package judge

import (
	"context"
	"strings"
	"testing"

	"github.com/cosmtrek/mindwalk/internal/model"
)

func sampleTrace() *model.Trace {
	return &model.Trace{
		Version: 1,
		Session: model.TraceSession{ID: "s1", Harness: "claude-code", Model: "claude-test", Cwd: "/repo", EventCount: 3},
		Events: []model.Event{
			{Seq: 0, Action: "read", Targets: []model.Target{{Path: "a.go", Touch: "read"}}, Summary: "Read a.go"},
			{Seq: 1, Action: "edit", Targets: []model.Target{{Path: "a.go", Touch: "edit"}}, Summary: "Edit a.go"},
			{Seq: 2, Action: "verify", IsError: true, Summary: "go test ./..."},
		},
		Marks: []model.Mark{
			{Seq: 0, Type: "user-message", Note: "fix the login bug"},
			{Seq: 0, Type: "user-message", Note: "<system-reminder>ignore</system-reminder>"},
		},
		Stats: model.Stats{Observability: model.Observability{Reads: model.ObservabilityExact, Errors: model.ObservabilityExact}},
	}
}

const validOutput = "noise before {\"task_summary\":\"修登录 bug\",\"dimensions\":[" +
	"{\"name\":\"exploration\",\"findings\":[{\"claim\":\"动手前读了目标文件\",\"severity\":\"info\",\"evidence_seqs\":[0,99]}]}," +
	"{\"name\":\"scope\",\"findings\":[]}," +
	"{\"name\":\"wandering\",\"findings\":[{\"claim\":\"批量编辑未穿插运行\",\"severity\":\"warning\",\"evidence_seqs\":[1]}]}," +
	"{\"name\":\"verification\",\"findings\":[{\"claim\":\"测试失败未跟进\",\"severity\":\"problem\",\"evidence_seqs\":[2]}]}]," +
	"\"notable_moments\":[{\"seq\":1,\"note\":\"首次编辑\"},{\"seq\":42,\"note\":\"不存在\"}]," +
	"\"narrative\":\"整体健康\"} noise after"

type stubRunner struct {
	outputs []string
	calls   int
}

func (s *stubRunner) Run(ctx context.Context, prompt, input string) (string, error) {
	out := s.outputs[s.calls]
	s.calls++
	return out, nil
}

func (s *stubRunner) Name() string { return "stub" }

func TestAnalyzeParsesAndRollsUp(t *testing.T) {
	trace := sampleTrace()
	runner := &stubRunner{outputs: []string{validOutput}}
	report, err := Analyze(context.Background(), trace, Options{Runner: runner})
	if err != nil {
		t.Fatal(err)
	}
	if report.TaskSummary != "修登录 bug" || report.Narrative != "整体健康" {
		t.Fatalf("report = %#v", report)
	}
	verdicts := map[string]string{}
	for _, dim := range report.Dimensions {
		verdicts[dim.Name] = dim.Verdict
	}
	want := map[string]string{
		"exploration":  model.VerdictGood,
		"scope":        model.VerdictGood,
		"wandering":    model.VerdictWarning,
		"verification": model.VerdictProblem,
	}
	for name, verdict := range want {
		if verdicts[name] != verdict {
			t.Fatalf("%s verdict = %q, want %q", name, verdicts[name], verdict)
		}
	}
	// Invalid evidence seq 99 must be dropped, valid seq 0 kept.
	if got := report.Dimensions[0].Findings[0].EvidenceSeqs; len(got) != 1 || got[0] != 0 {
		t.Fatalf("evidence = %#v", got)
	}
	// Moment with unknown seq 42 must be dropped.
	if len(report.NotableMoments) != 1 || report.NotableMoments[0].Seq != 1 {
		t.Fatalf("moments = %#v", report.NotableMoments)
	}
	if report.Judge.CLI != "stub" || report.Judge.PromptVersion != PromptVersion {
		t.Fatalf("judge meta = %#v", report.Judge)
	}
	if report.Session.EventCount != 3 {
		t.Fatalf("session = %#v", report.Session)
	}
}

func TestAnalyzeDropsFindingsWithoutValidEvidence(t *testing.T) {
	output := "{\"task_summary\":\"t\",\"dimensions\":[" +
		"{\"name\":\"exploration\",\"findings\":[]}," +
		"{\"name\":\"scope\",\"findings\":[]}," +
		"{\"name\":\"wandering\",\"findings\":[]}," +
		"{\"name\":\"verification\",\"findings\":[" +
		"{\"claim\":\"引用了不存在的事件\",\"severity\":\"problem\",\"evidence_seqs\":[99999]}," +
		"{\"claim\":\"没给任何证据\",\"severity\":\"problem\"}]}]," +
		"\"notable_moments\":[],\"narrative\":\"n\"}"
	report, err := Analyze(context.Background(), sampleTrace(), Options{Runner: &stubRunner{outputs: []string{output}}})
	if err != nil {
		t.Fatal(err)
	}
	for _, dim := range report.Dimensions {
		if dim.Name != "verification" {
			continue
		}
		if len(dim.Findings) != 0 {
			t.Fatalf("evidence-less findings survived: %#v", dim.Findings)
		}
		if dim.Verdict != model.VerdictGood {
			t.Fatalf("verdict driven by evidence-less finding: %q", dim.Verdict)
		}
	}
}

func TestAnalyzeRetriesOnInvalidJSON(t *testing.T) {
	runner := &stubRunner{outputs: []string{"not json at all", validOutput}}
	report, err := Analyze(context.Background(), sampleTrace(), Options{Runner: runner})
	if err != nil {
		t.Fatal(err)
	}
	if runner.calls != 2 || report == nil {
		t.Fatalf("calls = %d", runner.calls)
	}
}

func TestAnalyzeFailsAfterRetry(t *testing.T) {
	runner := &stubRunner{outputs: []string{"nope", "{\"dimensions\":[]}"}}
	if _, err := Analyze(context.Background(), sampleTrace(), Options{Runner: runner}); err == nil {
		t.Fatal("expected error for persistently invalid output")
	}
}

func TestRollupHonorsObservabilityBlindSpots(t *testing.T) {
	trace := sampleTrace()
	trace.Stats.Observability = model.Observability{Reads: model.ObservabilityUnavailable, Errors: model.ObservabilityUnavailable}
	runner := &stubRunner{outputs: []string{validOutput}}
	report, err := Analyze(context.Background(), trace, Options{Runner: runner})
	if err != nil {
		t.Fatal(err)
	}
	verdicts := map[string]string{}
	for _, dim := range report.Dimensions {
		verdicts[dim.Name] = dim.Verdict
	}
	for _, name := range []string{"exploration", "wandering", "verification"} {
		if verdicts[name] != model.VerdictInsufficientData {
			t.Fatalf("%s verdict = %q, want insufficient-data", name, verdicts[name])
		}
	}
	if verdicts["scope"] != model.VerdictGood {
		t.Fatalf("scope verdict = %q", verdicts["scope"])
	}
}

func TestBuildInputSelectsUserWordsAndFlagsErrors(t *testing.T) {
	input := BuildInput(sampleTrace())
	if !strings.Contains(input, "[user #1] fix the login bug") {
		t.Fatalf("missing user message:\n%s", input)
	}
	if strings.Contains(input, "system-reminder") {
		t.Fatalf("markup-wrapped message should be skipped:\n%s", input)
	}
	if !strings.Contains(input, "2 | verify ERR | - | go test ./...") {
		t.Fatalf("missing error narrative line:\n%s", input)
	}
	if !strings.Contains(input, "--- mark: user-message ---") {
		t.Fatalf("missing mark line:\n%s", input)
	}
}

func TestCacheRoundTripAndFreshness(t *testing.T) {
	cache := Cache{Dir: t.TempDir()}
	trace := sampleTrace()
	report := &model.Report{
		Version: 1,
		Session: model.ReportSession{ID: "s1", EventCount: 3},
		Judge:   model.ReportJudge{CLI: "claude", PromptVersion: PromptVersion, InputDigest: InputDigest(trace)},
	}
	if err := cache.Store("key-1", report); err != nil {
		t.Fatal(err)
	}
	loaded := cache.Load("key-1")
	if loaded == nil || loaded.Session.ID != "s1" {
		t.Fatalf("loaded = %#v", loaded)
	}
	if !Fresh(loaded, trace) {
		t.Fatal("expected fresh")
	}
	// A new user message lands in marks, not events: the count is unchanged
	// but the judge input moved, so the report must go stale.
	trace.Marks = append(trace.Marks, model.Mark{Seq: 3, Type: "user-message", Note: "不要修改代码"})
	if Fresh(loaded, trace) {
		t.Fatal("expected stale after a new user message with no new events")
	}
	trace = sampleTrace()
	trace.Events = append(trace.Events, model.Event{Seq: 3, Action: "edit", Summary: "Edit b.go"})
	trace.Session.EventCount = 4
	if Fresh(loaded, trace) {
		t.Fatal("expected stale after event growth")
	}
	if Fresh(&model.Report{Judge: model.ReportJudge{PromptVersion: PromptVersion}}, sampleTrace()) {
		t.Fatal("report without a digest must be stale")
	}
	if cache.Load("missing") != nil {
		t.Fatal("expected nil for missing key")
	}
}
