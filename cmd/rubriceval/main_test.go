package main

import (
	"context"
	"encoding/json"
	"os"
	"path/filepath"
	"testing"

	"github.com/cosmtrek/mindwalk/internal/judge"
	"github.com/cosmtrek/mindwalk/internal/model"
)

func TestMain(m *testing.M) {
	isolated, _ := os.MkdirTemp("", "rubriceval-test-*")
	_ = os.Setenv("CRUSH_GLOBAL_DATA", filepath.Join(isolated, "crush"))
	_ = os.Setenv("XDG_DATA_HOME", filepath.Join(isolated, "xdg"))
	_ = os.Setenv("MINDWALK_HOME", filepath.Join(isolated, "mindwalk"))
	code := m.Run()
	_ = os.RemoveAll(isolated)

	os.Exit(code)
}

func TestTaskRunesCountsUserMessageNotes(t *testing.T) {
	trace := &model.Trace{
		Marks: []model.Mark{
			{Type: "user-message", Note: "Fix the bug in the parser"},
			{Type: "user-message", Note: "Add tests for the new feature please"},
			{Type: "thinking", Note: "should not count"},
		},
	}
	got := taskRunes(trace)

	want := len([]rune("Fix the bug in the parser")) + len([]rune("Add tests for the new feature please"))
	if got != want {
		t.Fatalf("taskRunes = %d, want %d", got, want)
	}
}

func TestTaskRunesSkipsEmptyAndInjected(t *testing.T) {
	trace := &model.Trace{
		Marks: []model.Mark{
			{Type: "user-message", Note: "  "},
			{Type: "user-message", Note: "<system-reminder>auto</system-reminder>"},
			{Type: "user-message", Note: "Real task"},
		},
	}
	got := taskRunes(trace)

	want := len([]rune("Real task"))
	if got != want {
		t.Fatalf("taskRunes = %d, want %d", got, want)
	}
}

func TestTaskRunesEmptyTrace(t *testing.T) {
	trace := &model.Trace{}
	if got := taskRunes(trace); got != 0 {
		t.Fatalf("taskRunes(empty) = %d, want 0", got)
	}
}

func TestReasonSuffixEmptyReason(t *testing.T) {
	r := sessionResult{Reason: ""}
	if got := reasonSuffix(r); got != "" {
		t.Fatalf("reasonSuffix() = %q, want empty", got)
	}
}

func TestReasonSuffixWithReason(t *testing.T) {
	r := sessionResult{Reason: "generation-failed"}
	if got := reasonSuffix(r); got != "/generation-failed" {
		t.Fatalf("reasonSuffix() = %q, want /generation-failed", got)
	}
}

func TestRecordError(t *testing.T) {
	result := sessionResult{Session: "test"}

	out := recordError(&result, os.ErrNotExist)
	if out.Status != "error" {
		t.Fatalf("Status = %q, want error", out.Status)
	}

	if out.Error == "" {
		t.Fatal("Error should be non-empty")
	}

	if out.Session != "test" {
		t.Fatalf("Session = %q, want test", out.Session)
	}
}

func TestStatsEmpty(t *testing.T) {
	if got := stats(nil); got != "n/a" {
		t.Fatalf("stats(nil) = %q, want n/a", got)
	}
}

func TestStatsSingleValue(t *testing.T) {
	got := stats([]float64{42})
	if got == "n/a" {
		t.Fatal("stats should return a value, not n/a")
	}
}

func TestStatsMultipleValues(t *testing.T) {
	got := stats([]float64{10, 20, 30, 40, 50})
	if got == "n/a" {
		t.Fatal("stats should return a value, not n/a")
	}
}

func TestWriteJSONCreatesFile(t *testing.T) {
	dir := t.TempDir()
	path := filepath.Join(dir, "out.json")
	writeJSON(path, map[string]int{"x": 1})

	data, err := os.ReadFile(path)
	if err != nil {
		t.Fatal(err)
	}

	var m map[string]int
	if err := json.Unmarshal(data, &m); err != nil {
		t.Fatal(err)
	}

	if m["x"] != 1 {
		t.Fatalf("x = %d, want 1", m["x"])
	}
}

func TestPrintSummaryDoesNotPanic(t *testing.T) {
	results := []sessionResult{
		{
			Session:    "a",
			Status:     model.RubricStatusScored,
			Tasks:      2,
			Criteria:   4,
			Sufficient: 3,
			Partial:    1,
			TotalSec:   10,
			Calls:      []callRecord{{Kind: "rubric", DurationSec: 3}, {Kind: "scoring-unified", DurationSec: 7}},
		},
		{Session: "b", Status: "no-rubric-layer", TotalSec: 1},
		{Session: "c", Status: "error", Error: "boom", TotalSec: 0},
		{Session: "d", Status: model.RubricStatusUnavailable, Reason: model.RubricReasonNoTaskText, TotalSec: 2},
	}
	printSummary(results)
}

func TestPrintSummaryEmpty(t *testing.T) {
	printSummary(nil)
}

func TestTimingRunnerCallClassification(t *testing.T) {
	tr := &timingRunner{
		inner:   &fakeRunner{name: "test"},
		session: "sess",
	}
	ctx := t.Context()
	_, _ = tr.Run(ctx, "You are designing an evaluation rubric", "input")
	_, _ = tr.Run(ctx, "Score this session. RUBRIC section follows.", "input")

	_, _ = tr.Run(ctx, "Some other prompt", "input")
	if len(tr.calls) != 3 {
		t.Fatalf("expected 3 calls, got %d", len(tr.calls))
	}

	if tr.calls[0].Kind != "rubric" {
		t.Fatalf("call 0 kind = %q, want rubric", tr.calls[0].Kind)
	}

	if tr.calls[1].Kind != "scoring-unified" {
		t.Fatalf("call 1 kind = %q, want scoring-unified", tr.calls[1].Kind)
	}

	if tr.calls[2].Kind != "scoring-legacy" {
		t.Fatalf("call 2 kind = %q, want scoring-legacy", tr.calls[2].Kind)
	}
}

func TestTimingRunnerName(t *testing.T) {
	tr := &timingRunner{inner: &fakeRunner{name: "my-runner"}}
	if got := tr.Name(); got != "my-runner" {
		t.Fatalf("Name() = %q, want my-runner", got)
	}
}

func TestTimingRunnerDumpDir(t *testing.T) {
	dir := t.TempDir()
	tr := &timingRunner{
		inner:   &fakeRunner{name: "test"},
		session: "mysess",
		dumpDir: dir,
	}
	ctx := t.Context()
	_, _ = tr.Run(ctx, "designing an evaluation rubric", "hello")

	entries, err := os.ReadDir(dir)
	if err != nil {
		t.Fatal(err)
	}

	if len(entries) != 1 {
		t.Fatalf("expected 1 dumped file, got %d", len(entries))
	}
}

type fakeRunner struct {
	name string
}

func (f *fakeRunner) Run(_ context.Context, _ string, _ string) (judge.RunResult, error) {
	return judge.RunResult{}, nil
}

func (f *fakeRunner) Name() string { return f.name }
