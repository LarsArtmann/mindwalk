package server

import (
	"context"
	"net/http"
	"sync"

	"github.com/cosmtrek/mindwalk/internal/judge"
	"github.com/cosmtrek/mindwalk/internal/model"
)

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
	// runner overrides the judge subprocess in tests; nil auto-detects a CLI.
	runner judge.Runner
}

// reportStateFor grades one session for the list view: "running" while a
// judge job is in flight, then "done" / "stale" / "failed". Staleness here
// compares the report against the summary event count — cheap, no trace
// parse — so the badge can be a touch more approximate than the panel.
func (s *Server) reportStateFor(meta model.SessionMeta) string {
	s.analyze.mu.Lock()
	job := s.analyze.jobs[meta.Key]
	s.analyze.mu.Unlock()
	var report *model.Report
	switch {
	case job != nil && !job.done:
		return "running"
	case job != nil && job.err != "":
		return "failed"
	case job != nil && job.report != nil:
		report = job.report
	default:
		report = s.reportCache.Load(meta.Key)
	}
	if report == nil {
		return ""
	}
	if report.Session.EventCount != meta.EventCount || report.Judge.PromptVersion != judge.PromptVersion {
		return "stale"
	}
	return "done"
}

func (s *Server) judgeInfo() (string, bool) {
	if s.analyze.runner != nil {
		return s.analyze.runner.Name(), true
	}
	cli, err := judge.DetectCLI()
	return cli, err == nil
}

type reportStatus struct {
	State string `json:"state"` // none | running | done | failed
	// Stale marks a done report generated from fewer events than the trace
	// now has (or an older prompt); the UI offers re-evaluation.
	Stale          bool          `json:"stale"`
	Report         *model.Report `json:"report,omitempty"`
	Error          string        `json:"error,omitempty"`
	JudgeAvailable bool          `json:"judgeAvailable"`
	JudgeCLI       string        `json:"judgeCli,omitempty"`
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
	status.JudgeCLI, status.JudgeAvailable = s.judgeInfo()

	s.analyze.mu.Lock()
	job := s.analyze.jobs[meta.Key]
	s.analyze.mu.Unlock()
	switch {
	case job != nil && !job.done:
		status.State = "running"
	case job != nil && job.err != "":
		status.State = "failed"
		status.Error = job.err
	case job != nil && job.report != nil:
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
	if _, available := s.judgeInfo(); !available {
		http.Error(w, "no judge CLI found on PATH (looked for claude, codex)", http.StatusServiceUnavailable)
		return
	}

	s.analyze.mu.Lock()
	if job := s.analyze.jobs[meta.Key]; job != nil && !job.done {
		s.analyze.mu.Unlock()
		w.WriteHeader(http.StatusAccepted)
		writeJSON(w, reportStatus{State: "running", JudgeAvailable: true})
		return
	}
	job := &analyzeJob{}
	s.analyze.jobs[meta.Key] = job
	s.analyze.mu.Unlock()

	go s.runAnalyze(meta.Key, trace, job)

	w.WriteHeader(http.StatusAccepted)
	writeJSON(w, reportStatus{State: "running", JudgeAvailable: true})
}

func (s *Server) runAnalyze(key string, trace *model.Trace, job *analyzeJob) {
	ctx, cancel := context.WithTimeout(context.Background(), judge.DefaultTimeout)
	defer cancel()
	report, err := judge.Analyze(ctx, trace, judge.Options{Runner: s.analyze.runner})
	s.analyze.mu.Lock()
	defer s.analyze.mu.Unlock()
	job.done = true
	if err != nil {
		job.err = err.Error()
		return
	}
	job.report = report
	if storeErr := s.reportCache.Store(key, report); storeErr != nil {
		// the report still lives in the job entry; losing the disk copy only
		// costs a re-run after restart
		_ = storeErr
	}
}
