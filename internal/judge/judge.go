package judge

import (
	"context"
	"encoding/json"
	"fmt"
	"time"

	"github.com/cosmtrek/mindwalk/internal/model"
)

const DefaultTimeout = 5 * time.Minute

type Options struct {
	// Runner overrides the subprocess runner; nil selects CLIRunner{CLI}.
	Runner Runner
	// CLI names the judge CLI ("claude" or "codex"); empty auto-detects.
	CLI string
}

// Analyze runs the judge over one trace and returns the evaluation report.
// The judge only contributes findings; verdicts are rolled up mechanically.
// Invalid judge output is retried once before failing.
func Analyze(ctx context.Context, trace *model.Trace, opts Options) (*model.Report, error) {
	runner := opts.Runner
	if runner == nil {
		cli := opts.CLI
		if cli == "" {
			detected, err := DetectCLI()
			if err != nil {
				return nil, err
			}
			cli = detected
		}
		runner = CLIRunner{CLI: cli}
	}

	input := BuildInput(trace)
	var lastErr error
	for attempt := 0; attempt < 2; attempt++ {
		raw, err := runner.Run(ctx, prompt, input)
		if err != nil {
			return nil, err
		}
		report, err := parseOutput(raw, trace)
		if err != nil {
			lastErr = err
			continue
		}
		report.Judge = model.ReportJudge{
			CLI:           runner.Name(),
			PromptVersion: PromptVersion,
			GeneratedAt:   time.Now().UTC().Format(time.RFC3339),
		}
		return report, nil
	}
	return nil, fmt.Errorf("judge output invalid after retry: %w", lastErr)
}

// llmOutput mirrors the JSON shape the prompt requests from the judge.
type llmOutput struct {
	TaskSummary string `json:"task_summary"`
	Dimensions  []struct {
		Name     string `json:"name"`
		Findings []struct {
			Claim        string `json:"claim"`
			Severity     string `json:"severity"`
			EvidenceSeqs []int  `json:"evidence_seqs"`
		} `json:"findings"`
	} `json:"dimensions"`
	NotableMoments []struct {
		Seq  int    `json:"seq"`
		Note string `json:"note"`
	} `json:"notable_moments"`
	Narrative string `json:"narrative"`
}

func parseOutput(raw string, trace *model.Trace) (*model.Report, error) {
	payload, err := extractJSON(raw)
	if err != nil {
		return nil, err
	}
	var out llmOutput
	if err := json.Unmarshal([]byte(payload), &out); err != nil {
		return nil, fmt.Errorf("judge JSON: %w", err)
	}

	validSeqs := make(map[int]bool, len(trace.Events))
	for _, event := range trace.Events {
		validSeqs[event.Seq] = true
	}

	byName := map[string]*model.ReportDimension{}
	for _, dim := range out.Dimensions {
		if !knownDimension(dim.Name) {
			continue
		}
		target, ok := byName[dim.Name]
		if !ok {
			target = &model.ReportDimension{Name: dim.Name, Findings: []model.ReportFinding{}}
			byName[dim.Name] = target
		}
		for _, finding := range dim.Findings {
			if finding.Claim == "" {
				continue
			}
			seqs := make([]int, 0, len(finding.EvidenceSeqs))
			for _, seq := range finding.EvidenceSeqs {
				if validSeqs[seq] {
					seqs = append(seqs, seq)
				}
			}
			target.Findings = append(target.Findings, model.ReportFinding{
				Claim:        finding.Claim,
				Severity:     normalizeSeverity(finding.Severity),
				EvidenceSeqs: seqs,
			})
		}
	}
	if len(byName) != len(model.DimensionNames) {
		return nil, fmt.Errorf("judge output covers %d of %d dimensions", len(byName), len(model.DimensionNames))
	}

	report := &model.Report{
		Version: 1,
		Session: model.ReportSession{
			ID:         trace.Session.ID,
			Harness:    trace.Session.Harness,
			Model:      trace.Session.Model,
			EventCount: trace.Session.EventCount,
		},
		TaskSummary: out.TaskSummary,
		Narrative:   out.Narrative,
	}
	for _, name := range model.DimensionNames {
		dim := byName[name]
		dim.Verdict = rollupVerdict(name, dim.Findings, trace.Stats.Observability)
		report.Dimensions = append(report.Dimensions, *dim)
	}
	for _, moment := range out.NotableMoments {
		if validSeqs[moment.Seq] && moment.Note != "" {
			report.NotableMoments = append(report.NotableMoments, model.ReportMoment{Seq: moment.Seq, Note: moment.Note})
		}
	}
	return report, nil
}

// rollupVerdict derives the dimension verdict from finding severities; the
// judge never decides verdicts. Blind spots recorded by the deterministic
// layer force insufficient-data regardless of what the judge observed.
func rollupVerdict(name string, findings []model.ReportFinding, obs model.Observability) string {
	if obs.Reads == model.ObservabilityUnavailable && (name == model.DimensionExploration || name == model.DimensionWandering) {
		return model.VerdictInsufficientData
	}
	if obs.Errors == model.ObservabilityUnavailable && name == model.DimensionVerification {
		return model.VerdictInsufficientData
	}
	verdict := model.VerdictGood
	for _, finding := range findings {
		switch finding.Severity {
		case model.SeverityProblem:
			return model.VerdictProblem
		case model.SeverityWarning:
			verdict = model.VerdictWarning
		}
	}
	return verdict
}

func knownDimension(name string) bool {
	for _, known := range model.DimensionNames {
		if name == known {
			return true
		}
	}
	return false
}

func normalizeSeverity(severity string) string {
	switch severity {
	case model.SeverityWarning, model.SeverityProblem:
		return severity
	default:
		return model.SeverityInfo
	}
}

// extractJSON returns the first balanced top-level JSON object in text,
// tolerating judge CLIs that wrap output in logs or markdown fences.
func extractJSON(text string) (string, error) {
	start := -1
	depth := 0
	inString := false
	escaped := false
	for i, r := range text {
		if start == -1 {
			if r == '{' {
				start = i
				depth = 1
			}
			continue
		}
		if escaped {
			escaped = false
			continue
		}
		switch r {
		case '\\':
			if inString {
				escaped = true
			}
		case '"':
			inString = !inString
		case '{':
			if !inString {
				depth++
			}
		case '}':
			if !inString {
				depth--
				if depth == 0 {
					return text[start : i+1], nil
				}
			}
		}
	}
	return "", fmt.Errorf("no JSON object in judge output")
}
