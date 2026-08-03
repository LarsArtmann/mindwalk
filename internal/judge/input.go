package judge

import (
	"crypto/sha256"
	"encoding/hex"
	"encoding/json"
	"fmt"
	"sort"
	"strconv"
	"strings"

	"github.com/cosmtrek/mindwalk/internal/adapter"
	"github.com/cosmtrek/mindwalk/internal/model"
	"github.com/cosmtrek/mindwalk/internal/textutil"
)

const (
	maxUserMessages    = 12
	maxUserMessageLen  = 600
	maxSummaryLen      = 160
	maxNarrativeEvents = 2000
	// maxTaskMessages bounds the rubric phase's task-evidence section — much
	// wider than the scoring budget because the rubric must see every task
	// the user raised. Anchors, the task digest, and the weak-text gate all
	// read exactly this set; nothing rubric-related may consult a different
	// message list.
	maxTaskMessages = 48
)

// BuildInput renders one trace as the scoring judge's evidence document:
// session meta, budgeted user task wording, precomputed stats, and a
// one-line-per-event narrative. The judge reads only this — never the raw
// session log.
func BuildInput(trace *model.Trace) string {
	return buildDocument(trace, renderedUserMessages(trace.Marks))
}

// BuildRubricInput renders the rubric generator's evidence document: same
// stats and narrative, but the user-message section is the full task
// evidence (taskMessages) rather than the scoring budget — a task raised in
// the middle of a long session must be visible to the generator that is
// asked to enumerate tasks.
func BuildRubricInput(trace *model.Trace) string {
	return buildDocument(trace, taskMessages(trace.Marks))
}

func buildDocument(trace *model.Trace, keep []userMessage) string {
	var b strings.Builder
	sess := trace.Session
	b.WriteString("# Session under evaluation\n\n")
	fmt.Fprintf(&b, "- harness: %s  model: %s\n", sess.Harness, orUnknown(sess.Model))
	fmt.Fprintf(&b, "- cwd: %s  events: %d\n", sess.Cwd, sess.EventCount)
	fmt.Fprintf(&b, "- started: %s  ended: %s\n\n", sess.StartedAt, sess.EndedAt)

	writeMessages(&b, keep)
	writeStats(&b, trace.Stats)
	writeNarrative(&b, trace)
	return b.String()
}

// InputDigest fingerprints the evidence document BuildInput renders for the
// trace. Unlike a bare event count it moves when user messages, tool results,
// or stats change, so freshness checks see every input the judge saw.
func InputDigest(trace *model.Trace) string {
	sum := sha256.Sum256([]byte(BuildInput(trace)))
	return hex.EncodeToString(sum[:])
}

// userMessage is one user-message mark after injected-wrapper filtering.
// Ordinal is 1-based over the filtered list and is what the evidence document
// renders as [user #N]; seq is the mark seq it resolves to.
type userMessage struct {
	ordinal int
	seq     int
	text    string
}

// filteredUserMessages returns every user message that may appear in the
// evidence document, before the rendering budget is applied.
func filteredUserMessages(marks []model.Mark) []userMessage {
	var messages []userMessage
	for _, mark := range marks {
		if mark.Type != "user-message" {
			continue
		}
		text := strings.TrimSpace(mark.Note)
		// Adapters already drop injected wrappers before marks exist; the
		// re-check here keeps judge input clean even for traces built by
		// older adapters.
		if text == "" || adapter.InjectedUserMessage(text) {
			continue
		}
		messages = append(messages, userMessage{ordinal: len(messages) + 1, seq: mark.Seq, text: text})
	}
	return messages
}

// budgetMessages keeps the first message (it states the task) plus the
// newest budget-1 (they carry corrections); mid-session chatter gives way.
func budgetMessages(messages []userMessage, budget int) []userMessage {
	if len(messages) > budget {
		messages = append([]userMessage{messages[0]}, messages[len(messages)-(budget-1):]...)
	}
	return messages
}

// renderedUserMessages is the scoring document's message budget.
func renderedUserMessages(marks []model.Mark) []userMessage {
	return budgetMessages(filteredUserMessages(marks), maxUserMessages)
}

// taskMessages is the single task-evidence set of the rubric phase: what the
// generator reads, what anchors may reference, what the digest fingerprints,
// and what the weak-text gate measures.
func taskMessages(marks []model.Mark) []userMessage {
	return budgetMessages(filteredUserMessages(marks), maxTaskMessages)
}

func writeMessages(b *strings.Builder, keep []userMessage) {
	b.WriteString("## User messages (the task; later ones are follow-ups/corrections)\n\n")
	if len(keep) == 0 {
		b.WriteString("(no user message text available)\n\n")
		return
	}
	previous := 0
	for _, message := range keep {
		if message.ordinal != previous+1 {
			fmt.Fprintf(b, "…%d intermediate user messages omitted.\n\n", message.ordinal-previous-1)
		}
		previous = message.ordinal
		fmt.Fprintf(b, "[user #%d] %s\n\n", message.ordinal, truncateRunes(message.text, maxUserMessageLen))
	}
}

// taskTextRunes measures the task signal available to a rubric — over the
// same set the generator will actually see.
func taskTextRunes(marks []model.Mark) int {
	total := 0
	for _, message := range taskMessages(marks) {
		total += len([]rune(message.text))
	}
	return total
}

// taskSection renders the rubric phase's user-message section.
func taskSection(marks []model.Mark) string {
	var b strings.Builder
	writeMessages(&b, taskMessages(marks))
	return b.String()
}

// TaskDigest fingerprints the exact task section the rubric generator reads.
// Unlike InputDigest it ignores events and stats: a session that only grew
// in activity keeps its rubric, while any change to the task wording, the
// generation source mode, or the rubric prompt forces regeneration.
func TaskDigest(trace *model.Trace, source string) string {
	sum := sha256.Sum256([]byte(strings.Join([]string{
		trace.Session.Harness,
		taskSection(trace.Marks),
		source,
		strconv.Itoa(RubricPromptVersion),
	}, "\n")))
	return hex.EncodeToString(sum[:])
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
		fmt.Fprintf(
			b,
			"%d | %s%s | %s | %s\n",
			event.Seq,
			event.Action,
			errFlag,
			pathList,
			truncateRunes(event.Summary, maxSummaryLen),
		)
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
	return textutil.TruncateRunes(s, limit, " …[truncated]")
}

func orUnknown(s string) string {
	if s == "" {
		return "?"
	}
	return s
}
