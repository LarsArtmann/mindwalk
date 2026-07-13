package judge

import (
	"bytes"
	"context"
	"fmt"
	"os/exec"
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

// CLIRunner shells out to a local agent CLI in non-interactive mode.
type CLIRunner struct {
	CLI string
}

func (r CLIRunner) Name() string { return r.CLI }

func (r CLIRunner) Run(ctx context.Context, prompt, input string) (string, error) {
	var cmd *exec.Cmd
	switch r.CLI {
	case "claude":
		cmd = exec.CommandContext(ctx, "claude", "-p", prompt)
		cmd.Stdin = strings.NewReader(input)
	case "codex":
		// codex exec takes the whole prompt as an argument and interleaves
		// its own logging on stdout; extractJSON in the parser copes with
		// the surrounding noise.
		cmd = exec.CommandContext(ctx, "codex", "exec", prompt+"\n\n"+input)
	default:
		return "", fmt.Errorf("unsupported judge CLI %q", r.CLI)
	}
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
