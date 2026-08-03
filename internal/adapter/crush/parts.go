package crush

import (
	"encoding/json"
	"fmt"
	"strings"

	"github.com/cosmtrek/mindwalk/internal/adapter"
)

// partKind enumerates the values Crush can stamp on messages.parts[*].type
// (charmbracelet/crush/internal/message/content.go).
//
// Crush's parts are an interface{} tagged by a discriminator — there's
// no shared Go struct exported by the public API — so we decode them
// as raw JSON and match by type. Only the kinds that affect the
// trace/UI are recognized; everything else falls through as text.
const (
	partText         = "text"
	partReasoning    = "reasoning"
	partToolCall     = "tool_call"
	partToolResult   = "tool_result"
	partFinish       = "finish"
	partShellCommand = "shell_command"
	partImageURL     = "image_url"
	partBinary       = "binary"
)

// rawPart is the on-disk shape of every messages.parts[*] entry. The
// `data` field carries the part-specific payload as a JSON object,
// the same shape Crush's ContentPart interface tags with `isPart()`.
type rawPart struct {
	Type string          `json:"type"`
	Data json.RawMessage `json:"data"`
}

// toolCallData mirrors message.ToolCall from upstream Crush.
type toolCallData struct {
	ID               string `json:"id"`
	Name             string `json:"name"`
	Input            string `json:"input"`
	ProviderExecuted bool   `json:"provider_executed"`
	Finished         bool   `json:"finished"`
}

// toolResultData mirrors message.ToolResult from upstream Crush.
type toolResultData struct {
	ToolCallID string `json:"tool_call_id"`
	Name       string `json:"name"`
	Content    string `json:"content"`
	Data       string `json:"data"`
	MIMEType   string `json:"mime_type"`
	Metadata   string `json:"metadata"`
	IsError    bool   `json:"is_error"`
}

// finishData mirrors message.Finish — only Reason is meaningful for the
// trace, but we decode the rest so we can ignore unexpected payloads
// without warning on a minor schema bump.
type finishData struct {
	Reason  string `json:"reason"`
	Time    int64  `json:"time"`
	Message string `json:"message,omitempty"`
	Details string `json:"details,omitempty"`
}

// textData mirrors TextContent.
type textData struct {
	Text string `json:"text"`
}

// reasoningData mirrors ReasoningContent — we surface thinking parts
// only when the upstream reasoning is non-empty and only the `Thinking`
// field is read by the trace today.
type reasoningData struct {
	Thinking string `json:"thinking"`
}

// shellCommandData mirrors message.ShellCommand — Crush encodes bang
// shell commands as their own part so a session replay can show them.
// The visualizer skips them today; decoding the type here keeps the
// schema in sync with Crush so future additions stay cheap.
type shellCommandData struct {
	Command  string `json:"command"`
	Output   string `json:"output"`
	ExitCode int    `json:"exit_code"`
}

// partsParser walks one message's parts JSON in declaration order.
// Tool calls and their results are paired by tool_call_id; any
// orphan result is dropped, and any tool call without a matching
// result is emitted as an event with an empty ToolResult.
//
// State is held in the parser so callers can stream messages through
// one instance and keep the in-flight tool calls memory-cheap.
type partsParser struct {
	pending       map[string]adapter.ToolCall
	pendingOrder  []string
	results       map[string]adapter.ToolResult
	text          strings.Builder
	subagentNote  string
	subagentSeen  bool
	hasUserFinish bool
}

// newPartsParser constructs an empty parser ready for one message.
func newPartsParser() *partsParser {
	return &partsParser{
		pending: map[string]adapter.ToolCall{},
		results: map[string]adapter.ToolResult{},
	}
}

// add folds one decoded part into the parser state. The caller is
// responsible for flushing text and events via finish().
func (p *partsParser) add(part rawPart, timestamp string) error {
	if part.Type == "" || len(part.Data) == 0 || string(part.Data) == "null" {
		return nil
	}
	switch part.Type {
	case partText:
		var t textData
		if err := json.Unmarshal(part.Data, &t); err != nil {
			return fmt.Errorf("decode text part: %w", err)
		}
		if t.Text != "" {
			if p.text.Len() > 0 {
				p.text.WriteString("\n")
			}
			p.text.WriteString(t.Text)
		}
	case partReasoning:
		// Reasoning parts are surfaced in the trace only as a
		// subagent cue for now; the visualizer does not have a
		// dedicated thinking lane. Decode to validate the
		// payload but ignore the contents.
		var r reasoningData
		if err := json.Unmarshal(part.Data, &r); err != nil {
			return fmt.Errorf("decode reasoning part: %w", err)
		}
	case partShellCommand:
		// Bash commands that originated from Crush's bang-mode shell
		// hook land here. The visualizer already knows about bash
		// tool calls; decode the part purely for schema coverage.
		var sc shellCommandData
		if err := json.Unmarshal(part.Data, &sc); err != nil {
			return fmt.Errorf("decode shell_command part: %w", err)
		}
	case partToolCall:
		var tc toolCallData
		if err := json.Unmarshal(part.Data, &tc); err != nil {
			return fmt.Errorf("decode tool_call part: %w", err)
		}
		if tc.ID == "" || tc.Name == "" {
			return nil
		}
		input := parseCrushInput(tc.Input)
		call := adapter.ToolCall{
			ID:        tc.ID,
			Name:      tc.Name,
			Input:     input,
			Timestamp: timestamp,
		}
		if tc.Name == "agent" {
			p.subagentSeen = true
			if label := agentLabelFromInput(input); label != "" {
				p.subagentNote = label
			} else {
				p.subagentNote = tc.Name
			}
		}
		if _, exists := p.pending[tc.ID]; !exists {
			p.pendingOrder = append(p.pendingOrder, tc.ID)
		}
		p.pending[tc.ID] = call
	case partToolResult:
		var tr toolResultData
		if err := json.Unmarshal(part.Data, &tr); err != nil {
			return fmt.Errorf("decode tool_result part: %w", err)
		}
		if tr.ToolCallID == "" {
			return nil
		}
		p.results[tr.ToolCallID] = adapter.ToolResult{
			Content: tr.Content,
			IsError: tr.IsError,
		}
	case partFinish:
		var f finishData
		if err := json.Unmarshal(part.Data, &f); err != nil {
			return fmt.Errorf("decode finish part: %w", err)
		}
		if f.Reason == "stop" {
			p.hasUserFinish = true
		}
	case partImageURL, partBinary:
		// Image and binary attachments are dropped from the trace —
		// the visualizer renders file edits, not base64 previews —
		// but decoding the discriminator keeps schema drift loud.
	default:
		// Unknown part types are ignored so a Crush schema bump
		// never crashes an older mindwalk binary.
	}
	return nil
}

// agentLabelFromInput pulls the best label from an agent tool call's
// input — task title, then description, then the first non-empty
// string field.
func agentLabelFromInput(input map[string]any) string {
	for _, key := range []string{"task_title", "title", "description", "prompt", "message"} {
		if v, ok := input[key].(string); ok {
			if trimmed := strings.TrimSpace(v); trimmed != "" {
				return trimmed
			}
		}
	}
	return ""
}

// parseCrushInput decodes a tool call input string (which Crush stores
// as raw JSON text in the SQLite column) into the map[string]any shape
// the existing actionFor/targetsFor helpers expect. The adapter never
// blocks on a malformed payload: it falls back to a single "_raw"
// entry so downstream heuristics can still mine it.
func parseCrushInput(raw string) map[string]any {
	input := map[string]any{}
	trimmed := strings.TrimSpace(raw)
	if trimmed == "" {
		return input
	}
	var value any
	if err := json.Unmarshal([]byte(trimmed), &value); err != nil {
		input["_raw"] = raw
		return input
	}
	switch v := value.(type) {
	case map[string]any:
		return v
	case string:
		// Nested JSON string is a frequent Crush shape (e.g. the
		// view tool stores a one-key object as a JSON literal).
		return parseCrushInput(v)
	}
	encoded, _ := json.Marshal(value)
	input["_raw"] = string(encoded)
	return input
}

// finish drains the parser and returns the materialised trace pieces:
//
//   - text:        the concatenated message body (used to detect user
//                  turns and emit a user-message mark).
//   - events:      ordered tool-call events, each paired with its
//                  result or an empty ToolResult when no result was
//                  observed. Order matches declaration in the parts
//                  JSON.
//   - subagent:    true when the message observed an `agent` tool
//                  call — the caller records a subagent mark.
//   - userFinish:  true when the message ended with a finish reason
//                  of `stop`, matching Crush's user-typed prompt shape
//                  (the assistant finishes the user turn with `stop`).
type finishResult struct {
	text          string
	events        []adapter.ToolCall
	results       []adapter.ToolResult
	subagent      bool
	subagentNote  string
	userFinish    bool
}

func (p *partsParser) finish() finishResult {
	result := finishResult{
		text:         strings.TrimSpace(p.text.String()),
		subagent:     p.subagentSeen,
		subagentNote: p.subagentNote,
		userFinish:   p.hasUserFinish,
	}
	for _, id := range p.pendingOrder {
		call := p.pending[id]
		result.events = append(result.events, call)
		if r, ok := p.results[id]; ok {
			result.results = append(result.results, r)
		} else {
			result.results = append(result.results, adapter.ToolResult{})
		}
	}
	return result
}

// decodeParts parses a single messages.parts JSON string. The
// returned list preserves declaration order; the parser accumulates
// tool calls/results internally so a single decode captures the whole
// message.
func decodeParts(raw string, timestamp string) (finishResult, error) {
	parser := newPartsParser()
	trimmed := strings.TrimSpace(raw)
	if trimmed == "" || trimmed == "[]" {
		return parser.finish(), nil
	}
	var parts []rawPart
	if err := json.Unmarshal([]byte(trimmed), &parts); err != nil {
		return finishResult{}, fmt.Errorf("decode parts: %w", err)
	}
	for _, part := range parts {
		if err := parser.add(part, timestamp); err != nil {
			return finishResult{}, err
		}
	}
	return parser.finish(), nil
}

