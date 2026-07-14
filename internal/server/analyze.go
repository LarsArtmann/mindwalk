package server

import (
	"context"
	"encoding/json"
	"errors"
	"fmt"
	"io"
	"net/http"
	"slices"
	"sync"

	"github.com/cosmtrek/mindwalk/internal/judge"
	"github.com/cosmtrek/mindwalk/internal/model"
)

// maxConcurrentJudges bounds simultaneous judge subprocesses: each one is a
// full agent-CLI run costing tokens and about a minute, and nothing stops a
// user from clicking evaluate across many sessions.
const maxConcurrentJudges = 2

// analyzeJob tracks one in-flight or finished judge run, keyed by session
// key. Evaluation only ever starts from an explicit POST — never from
// session scanning — because a judge run costs tokens and about a minute.
type analyzeJob struct {
	done   bool
	report *model.Report
	err    string
}

type analyzeState struct {
	mu   sync.Mutex
	jobs map[string]*analyzeJob
	// active counts in-flight judge subprocesses across all sessions.
	active int
	// runner overrides the judge subprocess in tests; nil auto-detects a CLI.
	runner judge.Runner
}

// snapshot returns a consistent copy of the session's job state. Job fields
// are written by the analyze goroutine under mu, so every read must happen
// inside the lock too — callers get a copy, never the live pointer.
func (a *analyzeState) snapshot(key string) (analyzeJob, bool) {
	a.mu.Lock()
	defer a.mu.Unlock()
	job, ok := a.jobs[key]
	if !ok {
		return analyzeJob{}, false
	}
	return *job, true
}

// reportStateFor grades one session for the list view: "running" while a
// judge job is in flight, then "done" / "stale" / "failed". Staleness here
// compares the report against the summary event count — cheap, no trace
// parse — so the badge can be a touch more approximate than the panel.
func (s *Server) reportStateFor(meta model.SessionMeta) string {
	job, ok := s.analyze.snapshot(meta.Key)
	var report *model.Report
	switch {
	case ok && !job.done:
		return "running"
	case ok && job.err != "":
		return "failed"
	case ok && job.report != nil:
		report = job.report
	default:
		report = s.reportCache.Load(meta.Key)
	}
	if report == nil {
		return ""
	}
	// A report without an input digest predates digest freshness and the
	// panel will grade it stale — say so here too rather than disagree. User
	// turns catch message-only growth the event count is blind to.
	if report.Session.EventCount != meta.EventCount ||
		report.Session.UserTurns != meta.UserTurns ||
		report.Judge.PromptVersion != judge.PromptVersion ||
		report.Judge.InputDigest == "" {
		return "stale"
	}
	return "done"
}

// judgeInfo lists the judge CLIs the user can pick from, preference order
// first. A test runner narrows the list to itself.
func (s *Server) judgeInfo() ([]string, bool) {
	if s.analyze.runner != nil {
		return []string{s.analyze.runner.Name()}, true
	}
	clis := judge.DetectCLIs()
	return clis, len(clis) > 0
}

type reportStatus struct {
	State string `json:"state"` // none | running | done | failed
	// Stale marks a done report generated from fewer events than the trace
	// now has (or an older prompt); the UI offers re-evaluation.
	Stale          bool          `json:"stale"`
	Report         *model.Report `json:"report,omitempty"`
	Error          string        `json:"error,omitempty"`
	JudgeAvailable bool          `json:"judgeAvailable"`
	// JudgeCLI is the default judge (first available); JudgeCLIs lists every
	// installed CLI so the panel can offer a choice.
	JudgeCLI  string   `json:"judgeCli,omitempty"`
	JudgeCLIs []string `json:"judgeClis,omitempty"`
}

func (s *Server) handleSessionReport(w http.ResponseWriter, r *http.Request, selector string) {
	if r.Method != http.MethodGet {
		http.Error(w, "method not allowed", http.StatusMethodNotAllowed)
		return
	}
	meta, err := s.findSession(selector)
	if err != nil {
		http.Error(w, err.Error(), http.StatusNotFound)
		return
	}
	trace, _, err := s.traceAndMap(selector)
	if err != nil {
		http.Error(w, err.Error(), http.StatusNotFound)
		return
	}

	status := reportStatus{State: "none"}
	status.JudgeCLIs, status.JudgeAvailable = s.judgeInfo()
	if status.JudgeAvailable {
		status.JudgeCLI = status.JudgeCLIs[0]
	}

	job, ok := s.analyze.snapshot(meta.Key)
	switch {
	case ok && !job.done:
		status.State = "running"
	case ok && job.err != "":
		status.State = "failed"
		status.Error = job.err
	case ok && job.report != nil:
		status.State = "done"
		status.Report = job.report
		status.Stale = !judge.Fresh(job.report, trace)
	default:
		if cached := s.reportCache.Load(meta.Key); cached != nil {
			status.State = "done"
			status.Report = cached
			status.Stale = !judge.Fresh(cached, trace)
		}
	}
	writeJSON(w, status)
}

func (s *Server) handleSessionAnalyze(w http.ResponseWriter, r *http.Request, selector string) {
	if r.Method != http.MethodPost {
		http.Error(w, "method not allowed", http.StatusMethodNotAllowed)
		return
	}
	meta, err := s.findSession(selector)
	if err != nil {
		http.Error(w, err.Error(), http.StatusNotFound)
		return
	}
	trace, _, err := s.traceAndMap(selector)
	if err != nil {
		http.Error(w, err.Error(), http.StatusNotFound)
		return
	}
	clis, available := s.judgeInfo()
	if !available {
		http.Error(w, "no judge CLI found on PATH (looked for claude, codex)", http.StatusServiceUnavailable)
		return
	}

	// Optional body: the panel's judge choice. An empty body keeps the
	// default CLI and its default model; a malformed one is rejected — this
	// request starts an expensive run, so a garbled choice must not silently
	// fall back to defaults.
	var req struct {
		CLI   string `json:"cli"`
		Model string `json:"model"`
	}
	if r.Body != nil {
		decoder := json.NewDecoder(r.Body)
		if err := decoder.Decode(&req); err != nil {
			if !errors.Is(err, io.EOF) {
				http.Error(w, "invalid request body: "+err.Error(), http.StatusBadRequest)
				return
			}
		} else if _, err := decoder.Token(); !errors.Is(err, io.EOF) {
			// One JSON value and nothing after it — trailing garbage means a
			// broken client, and this request starts an expensive run.
			http.Error(w, "invalid request body: trailing data after JSON object", http.StatusBadRequest)
			return
		}
	}
	if req.CLI != "" && !slices.Contains(clis, req.CLI) {
		http.Error(w, fmt.Sprintf("judge CLI %q is not available (installed: %v)", req.CLI, clis), http.StatusBadRequest)
		return
	}

	s.analyze.mu.Lock()
	if job := s.analyze.jobs[meta.Key]; job != nil && !job.done {
		s.analyze.mu.Unlock()
		w.WriteHeader(http.StatusAccepted)
		writeJSON(w, reportStatus{State: "running", JudgeAvailable: true})
		return
	}
	if s.analyze.active >= maxConcurrentJudges {
		s.analyze.mu.Unlock()
		http.Error(w, fmt.Sprintf("%d evaluations already running; wait for one to finish", maxConcurrentJudges), http.StatusTooManyRequests)
		return
	}
	job := &analyzeJob{}
	s.analyze.jobs[meta.Key] = job
	s.analyze.active++
	s.analyze.mu.Unlock()

	go s.runAnalyze(meta.Key, trace, job, req.CLI, req.Model)

	w.WriteHeader(http.StatusAccepted)
	writeJSON(w, reportStatus{State: "running", JudgeAvailable: true})
}

func (s *Server) runAnalyze(key string, trace *model.Trace, job *analyzeJob, cli, judgeModel string) {
	ctx, cancel := context.WithTimeout(context.Background(), judge.DefaultTimeout)
	defer cancel()
	report, err := judge.Analyze(ctx, trace, judge.Options{Runner: s.analyze.runner, CLI: cli, Model: judgeModel})

	// Persist before publishing done, and outside the lock: once the job entry
	// is dropped, polls must be able to find the report on disk.
	persisted := false
	if err == nil && s.reportCache.Dir != "" {
		persisted = s.reportCache.Store(key, report) == nil
	}

	s.analyze.mu.Lock()
	defer s.analyze.mu.Unlock()
	s.analyze.active--
	job.done = true
	if err != nil {
		job.err = err.Error()
		return
	}
	job.report = report
	if persisted {
		// The cache owns the report now; dropping the entry keeps the jobs map
		// bounded. When the disk write failed the entry stays as the only copy —
		// losing it would cost a re-run — and failed jobs stay too (small, and
		// the UI needs the error until a re-run replaces them).
		delete(s.analyze.jobs, key)
	}
}
