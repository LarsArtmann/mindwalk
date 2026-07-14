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
	tmp := c.path(sessionKey) + ".tmp"
	if err := os.WriteFile(tmp, data, 0o644); err != nil {
		return err
	}
	return os.Rename(tmp, c.path(sessionKey))
}
