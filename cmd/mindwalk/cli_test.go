package main

import (
	"io"
	"os"
	"path/filepath"
	"strings"
	"testing"
)

// captureStdout runs fn while redirecting os.Stdout to a pipe, then
// returns the captured text. Restores the original stdout on return.
func captureStdout(t *testing.T, fn func() error) (string, error) {
	t.Helper()
	old := os.Stdout
	r, w, err := os.Pipe()
	if err != nil {
		t.Fatal(err)
	}
	os.Stdout = w
	runErr := fn()
	if cerr := w.Close(); cerr != nil {
		t.Fatal(cerr)
	}
	os.Stdout = old
	out, err := io.ReadAll(r)
	if err != nil {
		t.Fatal(err)
	}
	return string(out), runErr
}

// emptyAdapterArgs returns flag args that point all adapter dirs at an
// empty temp directory with crush disabled. This makes CLI tests
// deterministic — no sessions found, no host-filesystem probing.
func emptyAdapterArgs(t *testing.T) []string {
	t.Helper()
	dir := t.TempDir()
	return []string{
		"--no-crush",
		"--claude-dir", filepath.Join(dir, "claude"),
		"--codex-dir", filepath.Join(dir, "codex"),
		"--pi-dir", filepath.Join(dir, "pi"),
	}
}

// TestRunDispatchesSessions verifies the sessions subcommand is
// recognized by run() and exits without error.
func TestRunDispatchesSessions(t *testing.T) {
	args := append([]string{"sessions"}, emptyAdapterArgs(t)...)
	if err := run(args); err != nil {
		t.Fatalf("run(sessions) error: %v", err)
	}
}

// TestRunDispatchesDoctor verifies the doctor subcommand is recognized
// by run() and exits without error.
func TestRunDispatchesDoctor(t *testing.T) {
	args := append([]string{"doctor"}, emptyAdapterArgs(t)...)
	if err := run(args); err != nil {
		t.Fatalf("run(doctor) error: %v", err)
	}
}

// TestListSessionsPrintsHeaders verifies that sessions output includes
// adapter harness names.
func TestListSessionsPrintsHeaders(t *testing.T) {
	args := emptyAdapterArgs(t)
	out, err := captureStdout(t, func() error { return listSessions(args) })
	if err != nil {
		t.Fatalf("listSessions error: %v", err)
	}
	if !strings.Contains(out, "claude") {
		t.Fatalf("expected output to contain 'claude', got:\n%s", out)
	}
}

// TestDoctorPrintsDataDirectories verifies that doctor output includes
// the data directory paths.
func TestDoctorPrintsDataDirectories(t *testing.T) {
	args := emptyAdapterArgs(t)
	out, err := captureStdout(t, func() error { return doctor(args) })
	if err != nil {
		t.Fatalf("doctor error: %v", err)
	}
	if !strings.Contains(out, "Data directories") {
		t.Fatalf("expected 'Data directories' in output, got:\n%s", out)
	}
	if !strings.Contains(out, "crush") {
		t.Fatalf("expected 'crush' in output, got:\n%s", out)
	}
}

// TestRunUnknownCommand verifies that unknown commands return an error.
func TestRunUnknownCommand(t *testing.T) {
	err := run([]string{"nonexistent-command"})
	if err == nil {
		t.Fatal("expected error for unknown command")
	}
}
