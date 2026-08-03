package adapter

import (
	"encoding/json"
	"strings"

	"github.com/cosmtrek/mindwalk/internal/model"
)

// AgentLaunch records one agent-tool invocation the parent session made
// and the result the harness reported for it. Adapters (codex, crush)
// populate these from their harness-specific event streams and then
// stitch them to child sessions to render the agent graph.
//
// The fields are exported because each adapter reads only a subset:
// `arguments` carries the tool input (used for role/instruction), the
// `output`/`outputObserved` pair drives the unlinked-node status, and
// `seq` preserves launch order. Centralising the shape lets future
// adapters reuse the parsing/linking logic without re-defining a
// parallel struct.
type AgentLaunch struct {
	CallID         string
	Seq            int
	Arguments      map[string]any
	Output         string
	OutputObserved bool
}

// AgentLaunchOutput is the structured payload some harnesses return
// from an agent-tool result (codex embeds it in the function_call_output
// item; crush renders it as JSON inside the message parts). Keeping the
// JSON tags next to the field declarations makes the wire contract
// obvious in one place.
type AgentLaunchOutput struct {
	AgentID  string `json:"agent_id"`
	Nickname string `json:"nickname"`
	TaskName string `json:"task_name"`
}

// SubagentLabel is the placeholder an agent-graph node falls back to
// when no launch nickname, child title, or tool-call id is available.
// Centralised so the user-visible string only changes in one place
// across every adapter that renders subagent nodes.
const SubagentLabel = "Subagent"

// ApplySubagentLabel sets node.Label to SubagentLabel when the current
// label is empty. Adapters call this as the final fallback after
// preferring a child-provided label and a launch nickname.
func ApplySubagentLabel(node *model.AgentNode) {
	if node.Label == "" {
		node.Label = SubagentLabel
	}
}

// UnlinkedLaunchStatus inspects a launch record's output and marks
// the agent as failed when the harness emitted an observation that is
// neither valid JSON nor an empty payload. Adapters share the rule
// so "spawn returned garbage" looks the same across harnesses.
func UnlinkedLaunchStatus(launch AgentLaunch) string {
	trimmed := strings.TrimSpace(launch.Output)
	if launch.OutputObserved && trimmed != "" && !json.Valid([]byte(trimmed)) {
		return model.AgentStatusFailed
	}
	return model.AgentStatusUnknown
}
