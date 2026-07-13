package judge

import (
	"encoding/json"
	"fmt"
	"sort"
	"strings"

	"github.com/cosmtrek/mindwalk/internal/model"
)

const (
	maxUserMessages    = 12
	maxUserMessageLen  = 600
	maxSummaryLen      = 160
	maxNarrativeEvents = 2000
)

// BuildInput renders one trace as the judge's evidence document: session
// meta, user task wording, precomputed stats, and a one-line-per-event
// narrative. The judge reads only this — never the raw session log.
func BuildInput(trace *model.Trace) string {
	var b strings.Builder
	sess := trace.Session
	b.WriteString("# Session under evaluation\n\n")
	fmt.Fprintf(&b, "- harness: %s  model: %s\n", sess.Harness, orUnknown(sess.Model))
	fmt.Fprintf(&b, "- cwd: %s  events: %d\n", sess.Cwd, sess.EventCount)
	fmt.Fprintf(&b, "- started: %s  ended: %s\n\n", sess.StartedAt, sess.EndedAt)

	writeUserMessages(&b, trace.Marks)
	writeStats(&b, trace.Stats)
	writeNarrative(&b, trace)
	return b.String()
}

func writeUserMessages(b *strings.Builder, marks []model.Mark) {
	b.WriteString("## User messages (the task; later ones are follow-ups/corrections)\n\n")
	count := 0
	skipped := 0
	for _, mark := range marks {
		if mark.Type != "user-message" {
			continue
		}
		text := strings.TrimSpace(mark.Note)
		// Harness-injected wrappers (command envelopes, system reminders)
		// start with markup and are not the user's own words.
		if text == "" || strings.HasPrefix(text, "<") {
			continue
		}
		count++
		if count > maxUserMessages {
			skipped++
			continue
		}
		fmt.Fprintf(b, "[user #%d] %s\n\n", count, truncateRunes(text, maxUserMessageLen))
	}
	if skipped > 0 {
		fmt.Fprintf(b, "…and %d more user messages omitted.\n\n", skipped)
	}
	if count == 0 {
		b.WriteString("(no user message text available)\n\n")
	}
}

func writeStats(b *strings.Builder, stats model.Stats) {
	b.WriteString("## Deterministic stats (precomputed, trust these numbers)\n\n")
	encoded, err := json.MarshalIndent(stats, "", " ")
	if err != nil {
		encoded = []byte("{}")
	}
	b.WriteString("```json\n")
	b.Write(encoded)
	b.WriteString("\n```\n\n")
}

func writeNarrative(b *strings.Builder, trace *model.Trace) {
	b.WriteString("## Event narrative (seq | action | targets | summary; ERR = tool errored)\n\n")
	marksBySeq := map[int][]string{}
	for _, mark := range trace.Marks {
		marksBySeq[mark.Seq] = append(marksBySeq[mark.Seq], mark.Type)
	}
	seqs := make([]int, 0, len(marksBySeq))
	for seq := range marksBySeq {
		seqs = append(seqs, seq)
	}
	sort.Ints(seqs)

	for i, event := range trace.Events {
		if i >= maxNarrativeEvents {
			fmt.Fprintf(b, "…%d later events omitted.\n", len(trace.Events)-maxNarrativeEvents)
			break
		}
		for _, markType := range marksBySeq[event.Seq] {
			fmt.Fprintf(b, "--- mark: %s ---\n", markType)
		}
		paths := make([]string, 0, 3)
		for _, target := range event.Targets {
			if len(paths) == 3 {
				break
			}
			paths = append(paths, target.Path)
		}
		pathList := "-"
		if len(paths) > 0 {
			pathList = strings.Join(paths, ",")
		}
		errFlag := ""
		if event.IsError {
			errFlag = " ERR"
		}
		fmt.Fprintf(b, "%d | %s%s | %s | %s\n", event.Seq, event.Action, errFlag, pathList, truncateRunes(event.Summary, maxSummaryLen))
	}
	// Marks that point past the last event (e.g. a closing user message).
	for _, seq := range seqs {
		if seq >= len(trace.Events) {
			for _, markType := range marksBySeq[seq] {
				fmt.Fprintf(b, "--- mark: %s ---\n", markType)
			}
		}
	}
}

func truncateRunes(s string, limit int) string {
	runes := []rune(s)
	if len(runes) <= limit {
		return s
	}
	return string(runes[:limit]) + " …[truncated]"
}

func orUnknown(s string) string {
	if s == "" {
		return "?"
	}
	return s
}
