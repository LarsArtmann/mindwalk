package main

import (
	"flag"
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

// TestListSessionsPrintsHeaders verifies that listSessions runs
// without error against empty adapter dirs (the common case when the
// user just installed mindwalk and has no sessions yet).
func TestListSessionsPrintsHeaders(t *testing.T) {
	args := emptyAdapterArgs(t)
	out, err := captureStdout(t, func() error { return listSessions(args) })
	if err != nil {
		t.Fatalf("listSessions error: %v", err)
	}
	// With empty dirs there are zero sessions, so stdout should be empty.
	// The test validates that the command completes cleanly with no crash.
	if out != "" {
		t.Fatalf("expected empty output for empty dirs, got:\n%s", out)
	}
}

// TestListSessionsJSON verifies that --json produces valid JSON (an
// empty array when no sessions exist).
func TestListSessionsJSON(t *testing.T) {
	args := append(emptyAdapterArgs(t), "--json")
	out, err := captureStdout(t, func() error { return listSessions(args) })
	if err != nil {
		t.Fatalf("listSessions --json error: %v", err)
	}
	out = strings.TrimSpace(out)
	if out != "[]" {
		t.Fatalf("expected '[]' for empty --json output, got: %q", out)
	}
}

// TestListSessionsHarnessFilter verifies that --harness filters out
// non-matching adapters without error.
func TestListSessionsHarnessFilter(t *testing.T) {
	args := append(emptyAdapterArgs(t), "--harness", "codex")
	out, err := captureStdout(t, func() error { return listSessions(args) })
	if err != nil {
		t.Fatalf("listSessions --harness error: %v", err)
	}
	if out != "" {
		t.Fatalf("expected empty output for filtered empty dirs, got:\n%s", out)
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

// TestDoctorShowsDirectoryStatus verifies that doctor reports
// directory readability status ([dir missing] for non-existent dirs).
func TestDoctorShowsDirectoryStatus(t *testing.T) {
	args := emptyAdapterArgs(t)
	out, err := captureStdout(t, func() error { return doctor(args) })
	if err != nil {
		t.Fatalf("doctor error: %v", err)
	}
	if !strings.Contains(out, "[dir missing]") {
		t.Fatalf("expected '[dir missing]' for empty dirs, got:\n%s", out)
	}
}

// TestRunUnknownCommand verifies that unknown commands return an error.
func TestRunUnknownCommand(t *testing.T) {
	err := run([]string{"nonexistent-command"})
	if err == nil {
		t.Fatal("expected error for unknown command")
	}
}

// TestRunVersion verifies the version subcommand runs without error
// and produces output.
func TestRunVersion(t *testing.T) {
	out, err := captureStdout(t, func() error { return run([]string{"version"}) })
	if err != nil {
		t.Fatalf("run(version) error: %v", err)
	}
	if !strings.Contains(out, "mindwalk") {
		t.Fatalf("expected output to contain 'mindwalk', got:\n%s", out)
	}
}

// TestCacheStatusAndClear verifies the cache status/clear lifecycle.
func TestCacheStatusAndClear(t *testing.T) {
	// Point MINDWALK_HOME at a temp dir for isolation.
	home := t.TempDir()
	t.Setenv("MINDWALK_HOME", home)

	out, err := captureStdout(t, func() error { return run([]string{"cache", "status"}) })
	if err != nil {
		t.Fatalf("cache status error: %v", err)
	}
	if !strings.Contains(out, "agent-graphs") {
		t.Fatalf("expected 'agent-graphs' in status output, got:\n%s", out)
	}

	// Clear on an empty cache should succeed.
	out, err = captureStdout(t, func() error { return run([]string{"cache", "clear"}) })
	if err != nil {
		t.Fatalf("cache clear error: %v", err)
	}
	if !strings.Contains(out, "cleared") {
		t.Fatalf("expected 'cleared' in clear output, got:\n%s", out)
	}
}

// TestParseAdapterFlagsRespectsNoCrush is a smoke test that verifies the
// flag is actually parsed — not silently ignored. This catches the
// classic pointer-dereference-before-Parse bug where fs.String() returns
// a *string that is immediately dereferenced, capturing only the default.
func TestParseAdapterFlagsRespectsNoCrush(t *testing.T) {
	fs := flag.NewFlagSet("test", flag.ContinueOnError)
	af := parseAdapterFlags(fs)
	if err := fs.Parse([]string{"--no-crush", "--crush-dir", "/tmp/custom"}); err != nil {
		t.Fatal(err)
	}
	if !af.noCrush {
		t.Fatal("expected --no-crush to set noCrush=true, got false (flag was not parsed)")
	}
	if af.crushDir != "/tmp/custom" {
		t.Fatalf("expected crushDir=/tmp/custom, got %q", af.crushDir)
	}
}

// TestParseAdapterFlagsDefaults verifies that defaults are applied when
// no flags are passed.
func TestParseAdapterFlagsDefaults(t *testing.T) {
	fs := flag.NewFlagSet("test", flag.ContinueOnError)
	af := parseAdapterFlags(fs)
	if err := fs.Parse(nil); err != nil {
		t.Fatal(err)
	}
	if af.noCrush {
		t.Fatal("expected noCrush=false by default")
	}
	if af.crushDir != "" {
		t.Fatalf("expected crushDir empty by default, got %q", af.crushDir)
	}
	if af.claudeDir == "" {
		t.Fatal("expected claudeDir to have a non-empty default")
	}
}
