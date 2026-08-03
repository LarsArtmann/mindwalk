// rubriceval is the offline evaluation bench for the rubric judge pipeline
// (design doc §15, M1.5). It drives the real judge.Analyze over a batch of
// historical sessions and reports the gate metrics: rubric outcome rates,
// coverage-sufficient rate, dead-criteria rate, and per-phase latency.
//
// Usage:
//
//	go run ./cmd/rubriceval -o OUTDIR [-cli codex] [-workers 3] <session.jsonl>...
//
// Every session costs real judge-CLI calls; this is a bench, not a test.
package main

import (
	"context"
	"encoding/json"
	"flag"
	"fmt"
	"os"
	"path/filepath"
	"sort"
	"strings"
	"sync"
	"time"

	"github.com/cosmtrek/mindwalk/internal/adapter"
	"github.com/cosmtrek/mindwalk/internal/adapter/claudecode"
	"github.com/cosmtrek/mindwalk/internal/adapter/codex"
	"github.com/cosmtrek/mindwalk/internal/adapter/crush"
	"github.com/cosmtrek/mindwalk/internal/judge"
	"github.com/cosmtrek/mindwalk/internal/model"
)

// timingRunner wraps the real CLI runner and records each sealed call. The
// prompt text distinguishes the phases: the generation prompt announces
// itself, and the unified scoring prompt names the RUBRIC input section.
type timingRunner struct {
	inner judge.Runner
	// dumpDir, when set, saves every call's raw output for failure analysis.
	dumpDir string
	session string
	mu      sync.Mutex
	calls   []callRecord
}

type callRecord struct {
	Kind        string  `json:"kind"` // rubric | scoring-unified | scoring-legacy
	DurationSec float64 `json:"durationSec"`
	InputBytes  int     `json:"inputBytes"`
	OutputBytes int     `json:"outputBytes"`
}

func (t *timingRunner) Run(ctx context.Context, prompt, input string) (judge.RunResult, error) {
	start := time.Now()
	result, err := t.inner.Run(ctx, prompt, input)
	kind := "scoring-legacy"
	switch {
	case strings.Contains(prompt, "designing an evaluation rubric"):
		kind = "rubric"
	case strings.Contains(prompt, "RUBRIC"):
		kind = "scoring-unified"
	}
	t.mu.Lock()
	t.calls = append(t.calls, callRecord{
		Kind:        kind,
		DurationSec: time.Since(start).Seconds(),
		InputBytes:  len(input),
		OutputBytes: len(result.Text),
	})
	call := len(t.calls)
	t.mu.Unlock()
	if t.dumpDir != "" {
		name := fmt.Sprintf("%s.call%d.%s.txt", t.session, call, kind)
		_ = os.WriteFile(filepath.Join(t.dumpDir, name), []byte(result.Text), 0o644)
	}
	return result, err
}

func (t *timingRunner) Name() string { return t.inner.Name() }

// sessionResult is one bench row; failures carry Error and nothing else.
type sessionResult struct {
	Session    string         `json:"session"`
	Harness    string         `json:"harness,omitempty"`
	Events     int            `json:"events,omitempty"`
	TaskRunes  int            `json:"taskRunes"`
	Status     string         `json:"status"` // scored | unavailable | no-rubric-layer | error
	Reason     string         `json:"reason,omitempty"`
	Tasks      int            `json:"tasks,omitempty"`
	Criteria   int            `json:"criteria,omitempty"`
	Sufficient int            `json:"sufficient,omitempty"`
	Partial    int            `json:"partial,omitempty"`
	None       int            `json:"none,omitempty"`
	Dead       int            `json:"dead,omitempty"` // criteria with zero findings
	Verdicts   map[string]int `json:"verdicts,omitempty"`
	Calls      []callRecord   `json:"calls,omitempty"`
	TotalSec   float64        `json:"totalSec"`
	Error      string         `json:"error,omitempty"`
}

func main() {
	outDir := flag.String("o", "", "output directory (required)")
	cliName := flag.String("cli", "codex", "judge CLI")
	modelName := flag.String("model", "", "judge model override")
	workers := flag.Int("workers", 3, "concurrent sessions")
	dumpRaw := flag.Bool("dump-raw", false, "save every judge call's raw output next to the reports")
	flag.Parse()
	if *outDir == "" || flag.NArg() == 0 {
		fmt.Fprintln(os.Stderr, "usage: rubriceval -o OUTDIR [-cli codex] [-workers N] <session.jsonl>...")
		os.Exit(2)
	}
	if err := os.MkdirAll(*outDir, 0o755); err != nil {
		fmt.Fprintln(os.Stderr, err)
		os.Exit(1)
	}

	sem := make(chan struct{}, *workers)
	var wg sync.WaitGroup
	var mu sync.Mutex
	var results []sessionResult
	for _, path := range flag.Args() {
		wg.Add(1)
		go func(path string) {
			defer wg.Done()
			sem <- struct{}{}
			defer func() { <-sem }()
			result := evalSession(path, *cliName, *modelName, *outDir, *dumpRaw)
			mu.Lock()
			results = append(results, result)
			done := len(results)
			mu.Unlock()
			fmt.Printf("[%d/%d] %s → %s%s (%.0fs)\n", done, flag.NArg(), filepath.Base(path),
				result.Status, reasonSuffix(result), result.TotalSec)
		}(path)
	}
	wg.Wait()

	sort.Slice(results, func(i, j int) bool { return results[i].Session < results[j].Session })
	writeJSON(filepath.Join(*outDir, "results.json"), results)
	printSummary(results)
}

func reasonSuffix(r sessionResult) string {
	if r.Reason == "" {
		return ""
	}
	return "/" + r.Reason
}

func evalSession(path, cliName, modelName, outDir string, dumpRaw bool) sessionResult {
	result := sessionResult{Session: filepath.Base(path)}
	trace, err := parseTrace(path)
	if err != nil {
		result.Status = "error"
		result.Error = err.Error()
		return result
	}
	result.Harness = trace.Session.Harness
	result.Events = trace.Session.EventCount
	result.TaskRunes = taskRunes(trace)

	runner := &timingRunner{
		inner:   judge.CLIRunner{CLI: cliName, Model: modelName},
		session: strings.TrimSuffix(result.Session, ".jsonl"),
	}
	if dumpRaw {
		runner.dumpDir = outDir
	}
	ctx, cancel := context.WithTimeout(context.Background(), judge.DefaultTimeout)
	defer cancel()
	start := time.Now()
	report, err := judge.Analyze(ctx, trace, judge.Options{Runner: runner})
	result.TotalSec = time.Since(start).Seconds()
	result.Calls = runner.calls
	if err != nil {
		result.Status = "error"
		result.Error = err.Error()
		return result
	}
	writeJSON(filepath.Join(outDir, strings.TrimSuffix(result.Session, ".jsonl")+".report.json"), report)

	if report.Rubric == nil {
		result.Status = "no-rubric-layer"
		return result
	}
	result.Status = report.Rubric.Status
	result.Reason = report.Rubric.Reason
	result.Tasks = len(report.Rubric.Tasks)
	result.Verdicts = map[string]int{}
	for _, task := range report.Rubric.Tasks {
		for _, criterion := range task.Criteria {
			result.Criteria++
			switch criterion.Coverage {
			case model.CoverageSufficient:
				result.Sufficient++
			case model.CoveragePartial:
				result.Partial++
			case model.CoverageNone:
				result.None++
			}
			if len(criterion.Findings) == 0 {
				result.Dead++
			}
			result.Verdicts[criterion.Verdict]++
		}
	}
	return result
}

// taskRunes mirrors the pipeline's weak-task-text measurement so threshold
// calibration can plot outcomes against the signal the gate actually sees.
func taskRunes(trace *model.Trace) int {
	total := 0
	for _, mark := range trace.Marks {
		if mark.Type != "user-message" {
			continue
		}
		text := strings.TrimSpace(mark.Note)
		if text == "" || adapter.InjectedUserMessage(text) {
			continue
		}
		total += len([]rune(text))
	}
	return total
}

func printSummary(results []sessionResult) {
	var scored, degraded, skipped, errored, noLayer int
	var criteria, sufficient, partial, none, dead int
	var rubricSecs, scoringSecs, totals []float64
	taskCounts := map[int]int{}
	for _, r := range results {
		switch {
		case r.Status == "error":
			errored++
			continue
		case r.Status == "no-rubric-layer":
			noLayer++
			continue
		case r.Status == model.RubricStatusScored:
			scored++
		case r.Reason == model.RubricReasonGenerationFailed:
			degraded++
		default:
			skipped++
		}
		totals = append(totals, r.TotalSec)
		criteria += r.Criteria
		sufficient += r.Sufficient
		partial += r.Partial
		none += r.None
		dead += r.Dead
		if r.Status == model.RubricStatusScored {
			taskCounts[r.Tasks]++
		}
		for _, call := range r.Calls {
			switch call.Kind {
			case "rubric":
				rubricSecs = append(rubricSecs, call.DurationSec)
			case "scoring-unified":
				scoringSecs = append(scoringSecs, call.DurationSec)
			}
		}
	}
	fmt.Println("\n=== M1.5 gate summary ===")
	fmt.Printf("sessions: %d — scored %d, skipped %d, degraded %d, no-layer %d, error %d\n",
		len(results), scored, skipped, degraded, noLayer, errored)
	if criteria > 0 {
		fmt.Printf("criteria: %d — coverage sufficient %d (%.0f%%), partial %d, none %d; dead %d (%.0f%%)\n",
			criteria, sufficient, 100*float64(sufficient)/float64(criteria), partial, none,
			dead, 100*float64(dead)/float64(criteria))
	}
	fmt.Printf("task-count distribution (scored sessions): %v\n", taskCounts)
	fmt.Printf("latency: rubric %s, unified scoring %s, session total %s\n",
		stats(rubricSecs), stats(scoringSecs), stats(totals))
}

func stats(xs []float64) string {
	if len(xs) == 0 {
		return "n/a"
	}
	sort.Float64s(xs)
	sum := 0.0
	for _, x := range xs {
		sum += x
	}
	return fmt.Sprintf("median %.0fs mean %.0fs max %.0fs (n=%d)",
		xs[len(xs)/2], sum/float64(len(xs)), xs[len(xs)-1], len(xs))
}

func parseTrace(path string) (*model.Trace, error) {
	abs, err := filepath.Abs(path)
	if err != nil {
		return nil, err
	}
	var lastErr error
	for _, source := range []adapter.Source{claudecode.Adapter{}, codex.Adapter{}, crush.Adapter{}} {
		trace, err := source.Parse(abs)
		if err == nil {
			return trace, nil
		}
		lastErr = err
	}
	return nil, lastErr
}

func writeJSON(path string, v any) {
	data, err := json.MarshalIndent(v, "", "  ")
	if err != nil {
		return
	}
	_ = os.WriteFile(path, data, 0o644)
}
