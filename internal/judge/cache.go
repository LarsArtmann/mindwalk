package judge

import (
	"encoding/json"
	"os"
	"path/filepath"

	"github.com/cosmtrek/mindwalk/internal/model"
)

// Cache persists reports under one file per session key so re-opening a
// session never re-runs the judge. Reports are expensive; traces are not.
type Cache struct {
	Dir string
}

// DefaultCacheDir is ~/.mindwalk/reports — mindwalk's own data directory,
// never inside ~/.claude, ~/.codex, or the inspected repository.
func DefaultCacheDir() string {
	home, err := os.UserHomeDir()
	if err != nil {
		return ""
	}
	return filepath.Join(home, ".mindwalk", "reports")
}

func (c Cache) path(sessionKey string) string {
	return filepath.Join(c.Dir, sessionKey+".json")
}

// Load returns the cached report for the session key, or nil when absent or
// unreadable (a corrupt cache entry is treated as a miss, not an error).
func (c Cache) Load(sessionKey string) *model.Report {
	if c.Dir == "" || sessionKey == "" {
		return nil
	}
	data, err := os.ReadFile(c.path(sessionKey))
	if err != nil {
		return nil
	}
	var report model.Report
	if json.Unmarshal(data, &report) != nil {
		return nil
	}
	// Syntactically valid but hollow payloads ("null", "{}", hand-edited
	// files) must read as a miss: the UI dereferences dimensions and judge
	// unconditionally.
	if report.Version < 1 || len(report.Dimensions) == 0 || report.Judge.CLI == "" {
		return nil
	}
	// A dimension's nil findings serializes as JSON null, which the panel
	// maps over unconditionally; normalize rather than reject.
	for i := range report.Dimensions {
		if report.Dimensions[i].Findings == nil {
			report.Dimensions[i].Findings = []model.ReportFinding{}
		}
	}
	return &report
}

// Fresh reports whether a cached report still matches the trace it would be
// regenerated from: same prompt version and the same judge input digest —
// event counts alone miss user messages (stored as marks) and content edits.
// The judge CLI is deliberately not part of freshness — a valid report stays
// valid. Reports from before the digest existed are stale by construction.
func Fresh(report *model.Report, trace *model.Trace) bool {
	return report != nil &&
		report.Judge.PromptVersion == PromptVersion &&
		report.Judge.InputDigest == InputDigest(trace)
}

func (c Cache) Store(sessionKey string, report *model.Report) error {
	if c.Dir == "" || sessionKey == "" {
		return nil
	}
	if err := os.MkdirAll(c.Dir, 0o755); err != nil {
		return err
	}
	data, err := json.MarshalIndent(report, "", "  ")
	if err != nil {
		return err
	}
	// A unique temp file per writer: the CLI and the server may finish
	// evaluating the same session concurrently, and a shared name would let
	// them truncate each other mid-write. Last rename wins, atomically.
	tmp, err := os.CreateTemp(c.Dir, sessionKey+"-*.tmp")
	if err != nil {
		return err
	}
	if _, err := tmp.Write(data); err != nil {
		tmp.Close()
		os.Remove(tmp.Name())
		return err
	}
	if err := tmp.Close(); err != nil {
		os.Remove(tmp.Name())
		return err
	}
	if err := os.Rename(tmp.Name(), c.path(sessionKey)); err != nil {
		os.Remove(tmp.Name())
		return err
	}
	return nil
}
