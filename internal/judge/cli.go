package judge

import (
	"bytes"
	"context"
	"fmt"
	"os"
	"os/exec"
	"path/filepath"
	"strings"
)

// Runner abstracts the judge CLI subprocess so tests can stub it.
type Runner interface {
	Run(ctx context.Context, prompt, input string) (string, error)
	Name() string
}

// SupportedCLIs lists judge CLIs in detection preference order.
var SupportedCLIs = []string{"claude", "codex"}

// DetectCLI returns the first supported judge CLI found on PATH.
func DetectCLI() (string, error) {
	for _, cli := range SupportedCLIs {
		if _, err := exec.LookPath(cli); err == nil {
			return cli, nil
		}
	}
	return "", fmt.Errorf("no judge CLI found on PATH (looked for %s)", strings.Join(SupportedCLIs, ", "))
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
}

func (r CLIRunner) Name() string { return r.CLI }

func (r CLIRunner) Run(ctx context.Context, prompt, input string) (string, error) {
	workdir, err := ensureWorkDir()
	if err != nil {
		return "", err
	}
	var cmd *exec.Cmd
	switch r.CLI {
	case "claude":
		cmd = exec.CommandContext(ctx, "claude", "-p",
			"--no-session-persistence", // never a session file for mindwalk to re-scan
			"--tools", "",
			"--strict-mcp-config",   // with no --mcp-config: zero MCP servers
			"--setting-sources", "", // no user/project settings, hooks, or allowlists
			prompt)
		cmd.Stdin = strings.NewReader(input)
	case "codex":
		// codex exec takes the whole prompt as an argument and interleaves
		// its own logging on stdout; extractJSON in the parser copes with
		// the surrounding noise. Persistence cannot be disabled, so the run
		// is pinned to the judge workdir where the codex adapter marks the
		// recorded session auxiliary.
		cmd = exec.CommandContext(ctx, "codex", "exec",
			"--sandbox", "read-only",
			"--skip-git-repo-check", // the judge workdir is not a repository
			"-C", workdir,
			prompt+"\n\n"+input)
	default:
		return "", fmt.Errorf("unsupported judge CLI %q", r.CLI)
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
		return "", fmt.Errorf("%s failed: %w: %s", r.CLI, err, detail)
	}
	return stdout.String(), nil
}
