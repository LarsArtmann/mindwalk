package model

// Report is the third first-class artifact next to CityMap and Trace: an
// LLM-assisted evaluation of one session trace. The LLM contributes findings
// and narrative; dimension verdicts are always derived mechanically from
// finding severities so two reports stay comparable.
type Report struct {
	Version        int               `json:"version"`
	Session        ReportSession     `json:"session"`
	Judge          ReportJudge       `json:"judge"`
	TaskSummary    string            `json:"taskSummary"`
	Dimensions     []ReportDimension `json:"dimensions"`
	NotableMoments []ReportMoment    `json:"notableMoments,omitempty"`
	Narrative      string            `json:"narrative"`
}

// ReportSession pins the report to the trace state it was generated from;
// EventCount is a cheap display/badge signal — freshness is decided by
// ReportJudge.InputDigest, which also sees user messages and event content.
type ReportSession struct {
	ID         string `json:"id"`
	Harness    string `json:"harness"`
	Model      string `json:"model,omitempty"`
	EventCount int    `json:"eventCount"`
	// UserTurns mirrors SessionMeta.UserTurns at generation time, giving the
	// badge's cheap staleness check eyes on message-only session growth.
	UserTurns int `json:"userTurns,omitempty"`
}

type ReportJudge struct {
	CLI string `json:"cli"`
	// Model names the LLM that actually judged (best-effort, reported by the
	// CLI itself); display and comparability only — never part of freshness.
	Model string `json:"model,omitempty"`
	// RequestedModel keeps the alias the run was asked for (e.g. "sonnet"),
	// so a repeated aliased request can recognize its own cached report.
	RequestedModel string `json:"requestedModel,omitempty"`
	PromptVersion  int    `json:"promptVersion"`
	GeneratedAt    string `json:"generatedAt"`
	// InputDigest fingerprints the exact evidence document the judge read;
	// the report is fresh only while the trace still renders to this digest.
	InputDigest string `json:"inputDigest,omitempty"`
}

// Dimension names, fixed set.
const (
	DimensionExploration  = "exploration"
	DimensionScope        = "scope"
	DimensionWandering    = "wandering"
	DimensionVerification = "verification"
)

// DimensionNames lists the four evaluation dimensions in display order.
var DimensionNames = []string{DimensionExploration, DimensionScope, DimensionWandering, DimensionVerification}

// Verdict values; SeverityInfo maps to VerdictGood.
const (
	VerdictGood             = "good"
	VerdictWarning          = "warning"
	VerdictProblem          = "problem"
	VerdictInsufficientData = "insufficient-data"
)

const (
	SeverityInfo    = "info"
	SeverityWarning = "warning"
	SeverityProblem = "problem"
)

type ReportDimension struct {
	Name     string          `json:"name"`
	Verdict  string          `json:"verdict"`
	Findings []ReportFinding `json:"findings"`
}

type ReportFinding struct {
	Claim    string `json:"claim"`
	Severity string `json:"severity"`
	// Always at least one entry — evidence-less findings are dropped at
	// parse time, and the schema marks the field required accordingly.
	EvidenceSeqs []int `json:"evidenceSeqs"`
}

type ReportMoment struct {
	Seq  int    `json:"seq"`
	Note string `json:"note"`
}
