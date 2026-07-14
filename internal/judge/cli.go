package judge

import (
	"bytes"
	"context"
	"encoding/json"
	"fmt"
	"os"
	"os/exec"
	"path/filepath"
	"regexp"
	"strings"
)

// RunResult carries the judge's raw text plus which model produced it. The
// model is recorded on the report — verdicts from different judges are only
// comparable when the report says who judged.
type RunResult struct {
	Text  string
	Model string
}

// Runner abstracts the judge CLI subprocess so tests can stub it.
type Runner interface {
	Run(ctx context.Context, prompt, input string) (RunResult, error)
	Name() string
}

// SupportedCLIs lists judge CLIs in detection preference order.
var SupportedCLIs = []string{"claude", "codex"}

// DetectCLI returns the first supported judge CLI found on PATH.
func DetectCLI() (string, error) {
	if clis := DetectCLIs(); len(clis) > 0 {
		return clis[0], nil
	}
	return "", fmt.Errorf("no judge CLI found on PATH (looked for %s)", strings.Join(SupportedCLIs, ", "))
}

// DetectCLIs returns every supported judge CLI found on PATH, in preference
// order; the UI offers the full list so the user can pick the judge.
func DetectCLIs() []string {
	var clis []string
	for _, cli := range SupportedCLIs {
		if _, err := exec.LookPath(cli); err == nil {
			clis = append(clis, cli)
		}
	}
	return clis
}

// WorkDir returns ~/.mindwalk/judge, the neutral directory judge subprocesses
// run in. It holds no repository and no project instructions, and adapters use
// IsWorkDir to recognize sessions recorded there as mindwalk's own judge runs
// (Codex offers no way to turn session persistence off).
func WorkDir() string {
	home, err := os.UserHomeDir()
	if err != nil {
		return ""
	}
	return filepath.Join(home, ".mindwalk", "judge")
}

// IsWorkDir reports whether path is the judge working directory.
func IsWorkDir(path string) bool {
	dir := WorkDir()
	return dir != "" && path != "" && filepath.Clean(path) == dir
}

func ensureWorkDir() (string, error) {
	dir := WorkDir()
	if dir == "" {
		return "", fmt.Errorf("judge workdir: cannot resolve home directory")
	}
	if err := os.MkdirAll(dir, 0o755); err != nil {
		return "", fmt.Errorf("judge workdir: %w", err)
	}
	return dir, nil
}

// CLIRunner shells out to a local agent CLI in non-interactive mode.
//
// The trace under evaluation is untrusted input (a prompt injection in the
// evaluated session must not reach tools), so the judge runs sealed: no
// tools, no MCP servers, no user or project settings, and nothing the judge
// produces may surface as a session for mindwalk itself to scan.
type CLIRunner struct {
	CLI string
	// Model overrides the CLI's default model when set (an alias like
	// "sonnet" or a full name like "gpt-5.6-sol").
	Model string
}

func (r CLIRunner) Name() string { return r.CLI }

func (r CLIRunner) Run(ctx context.Context, prompt, input string) (RunResult, error) {
	workdir, err := ensureWorkDir()
	if err != nil {
		return RunResult{}, err
	}
	var cmd *exec.Cmd
	switch r.CLI {
	case "claude":
		// --output-format json wraps the reply in a result envelope whose
		// modelUsage names the model that actually answered; see
		// parseClaudeEnvelope.
		args := []string{"-p",
			"--no-session-persistence", // never a session file for mindwalk to re-scan
			"--tools", "",
			"--strict-mcp-config",   // with no --mcp-config: zero MCP servers
			"--setting-sources", "", // no user/project settings, hooks, or allowlists
			"--output-format", "json",
		}
		if r.Model != "" {
			args = append(args, "--model", r.Model)
		}
		cmd = exec.CommandContext(ctx, "claude", append(args, prompt)...)
		cmd.Stdin = strings.NewReader(input)
	case "codex":
		// "-" reads the whole prompt from stdin — as an argv it would hit
		// per-argument size limits on big traces. codex interleaves its own
		// logging on stdout; extractJSON in the parser copes with the noise,
		// and the preamble's "model:" line names the model. Persistence
		// cannot be disabled, so the run is pinned to the judge workdir
		// where the codex adapter marks the recorded session auxiliary.
		args := []string{"exec",
			"--sandbox", "read-only",
			"--skip-git-repo-check", // the judge workdir is not a repository
			"-C", workdir,
		}
		if r.Model != "" {
			args = append(args, "-c", "model="+r.Model)
		}
		cmd = exec.CommandContext(ctx, "codex", append(args, "-")...)
		cmd.Stdin = strings.NewReader(prompt + "\n\n" + input)
	default:
		return RunResult{}, fmt.Errorf("unsupported judge CLI %q", r.CLI)
	}
	cmd.Dir = workdir
	var stdout, stderr bytes.Buffer
	cmd.Stdout = &stdout
	cmd.Stderr = &stderr
	if err := cmd.Run(); err != nil {
		detail := strings.TrimSpace(stderr.String())
		if detail == "" {
			detail = strings.TrimSpace(stdout.String())
		}
		if len(detail) > 500 {
			detail = detail[:500]
		}
		return RunResult{}, fmt.Errorf("%s failed: %w: %s", r.CLI, err, detail)
	}
	if r.CLI == "claude" {
		return parseClaudeEnvelope(stdout.String()), nil
	}
	return RunResult{Text: stdout.String(), Model: codexModel(stdout.String())}, nil
}

// claudeEnvelope mirrors the parts of `claude -p --output-format json` output
// mindwalk needs: the reply text and per-model usage.
type claudeEnvelope struct {
	Result     string `json:"result"`
	ModelUsage map[string]struct {
		InputTokens              int64 `json:"inputTokens"`
		CacheReadInputTokens     int64 `json:"cacheReadInputTokens"`
		CacheCreationInputTokens int64 `json:"cacheCreationInputTokens"`
	} `json:"modelUsage"`
}

// parseClaudeEnvelope unwraps the result envelope. The main model is the one
// that consumed the most input — the CLI also runs a small helper model for
// housekeeping, but only the judge reads the full evidence document. An
// unparseable envelope falls back to the raw text with no model recorded.
func parseClaudeEnvelope(raw string) RunResult {
	var envelope claudeEnvelope
	if err := json.Unmarshal([]byte(strings.TrimSpace(raw)), &envelope); err != nil || envelope.Result == "" {
		return RunResult{Text: raw}
	}
	model := ""
	var maxInput int64 = -1
	for name, usage := range envelope.ModelUsage {
		total := usage.InputTokens + usage.CacheReadInputTokens + usage.CacheCreationInputTokens
		if total > maxInput {
			maxInput = total
			model = name
		}
	}
	return RunResult{Text: envelope.Result, Model: model}
}

var codexModelLine = regexp.MustCompile(`(?m)^model:\s+(\S+)`)

// codexModel pulls the model name from the config preamble codex exec prints
// before the reply; absent a match the model stays unrecorded.
func codexModel(raw string) string {
	if match := codexModelLine.FindStringSubmatch(raw); match != nil {
		return match[1]
	}
	return ""
}
