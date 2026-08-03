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
	Rubric         *Rubric           `json:"rubric,omitempty"`
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
	// RubricPromptVersion is set only when the report carries a scored rubric;
	// deterministic skips (no/weak task text) stay fresh across rubric prompt
	// revisions because no generation happened.
	RubricPromptVersion int    `json:"rubricPromptVersion,omitempty"`
	GeneratedAt         string `json:"generatedAt"`
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

// Rubric statuses and skip/degrade reasons.
const (
	RubricStatusScored      = "scored"
	RubricStatusUnavailable = "unavailable"

	RubricReasonGenerationFailed = "generation-failed"
	RubricReasonNoTaskText       = "no-task-text"
	RubricReasonWeakTaskText     = "weak-task-text"
	// RubricReasonNoEvents skips traces with no tool events: with nothing to
	// cite, every finding would be dropped and criteria would default to
	// good verdicts on zero evidence.
	RubricReasonNoEvents = "no-events"
)

// Rubric generation input modes. A rubric generated with the full evidence
// document may absorb this attempt's implementation choices into its anchors;
// comparison across agents must only ever reuse task-sourced rubrics.
const (
	RubricSourceFull = "full"
	RubricSourceTask = "task"
)

// Criterion evidence coverage. Unlike severities these never feed warnings:
// a criterion the log cannot evidence rolls up to insufficient-data instead
// of counting against the agent.
const (
	CoverageSufficient = "sufficient"
	CoveragePartial    = "partial"
	CoverageNone       = "none"
)

// Rubric is the task-accounting layer of a report: session-specific criteria
// generated before scoring, grouped by the independent tasks the judge
// enumerated from the user's messages. The fixed dimensions never depend on
// it — a rubric failure degrades to a dimensions-only report.
type Rubric struct {
	Status string `json:"status"`
	// Reason qualifies an unavailable rubric: generation-failed after retry,
	// or a deterministic skip (no-task-text, weak-task-text).
	Reason string `json:"reason,omitempty"`
	Source string `json:"source,omitempty"`
	// TaskDigest fingerprints the task wording the rubric was derived from;
	// a re-evaluation whose digest still matches reuses the rubric unchanged.
	TaskDigest string       `json:"taskDigest,omitempty"`
	Tasks      []RubricTask `json:"tasks,omitempty"`
	// Note carries what the scorer felt the rubric did not let it express.
	Note string `json:"note,omitempty"`
}

type RubricTask struct {
	Title string `json:"title"`
	Type  string `json:"type,omitempty"`
	// AnchorUserMessages are [user #N] ordinals from the evidence document,
	// validated against the ordinals actually rendered there.
	AnchorUserMessages []int `json:"anchorUserMessages"`
	// AnchorSeqs are the mark seqs those ordinals resolve to — derived in Go,
	// never taken from the judge — so the UI can jump to a task's start.
	AnchorSeqs []int             `json:"anchorSeqs,omitempty"`
	Criteria   []RubricCriterion `json:"criteria"`
}

type RubricCriterion struct {
	ID    string `json:"id"`
	Title string `json:"title"`
	Why   string `json:"why,omitempty"`
	Good  string `json:"good,omitempty"`
	Bad   string `json:"bad,omitempty"`
	// Coverage and findings come from the scoring pass; verdict is rolled up
	// mechanically (coverage none forces insufficient-data).
	Coverage string          `json:"coverage,omitempty"`
	Verdict  string          `json:"verdict"`
	Findings []ReportFinding `json:"findings"`
}
