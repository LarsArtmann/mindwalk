package crush

import (
	"encoding/json"
	"sort"
	"strings"

	"github.com/cosmtrek/mindwalk/internal/adapter"
	"github.com/cosmtrek/mindwalk/internal/model"
)

// Crush's agent tool launches a child session whose id is the parent
// message id joined with the launching tool call id via "$$" — the
// same shape `internal/session/session.go` documents upstream. Reading
// the parts JSON for a single message yields every agent launch the
// assistant performed during that turn; the matching child row in the
// sessions table is then read by SourceID/LaunchCallID.

type agentLaunch struct {
	callID         string
	seq            int
	arguments      map[string]any
	output         string
	outputObserved bool
}

type agentLaunchOutput struct {
	AgentID  string `json:"agent_id"`
	Nickname string `json:"nickname"`
	TaskName string `json:"task_name"`
}

type crushGraphActor struct {
	session  model.SessionMeta
	nodeID   string
	depth    int
	sourceID string
}

func (a Adapter) AgentGraphInputs(root model.SessionMeta, catalog []model.SessionMeta) ([]string, error) {
	// The Crush adapter has no separate on-disk artifacts per session
	// — every trace lives in the same database — so the agent graph
	// builder only needs the root session's path.
	if root.Path == "" {
		return nil, nil
	}
	return []string{root.Path}, nil
}

// BuildAgentGraph stitches the agent-tool launches recorded in the
// root session's messages to the child sessions present in the
// catalog. Like the codex implementation it tolerates orphans in
// both directions — a launch with no matching child and a child
// with no recorded launch — and renders each into the graph at the
// appropriate quality tier.
func (a Adapter) BuildAgentGraph(root model.SessionMeta, catalog []model.SessionMeta) (*model.AgentGraph, error) {
	mainID := adapter.AgentNodeID(harnessName, root.Key, "root:"+root.Key)
	graph := &model.AgentGraph{
		Version:        model.AgentGraphVersion,
		RootSessionKey: root.Key,
		Agents: []model.AgentNode{{
			ID:                mainID,
			Depth:             0,
			Kind:              model.AgentKindMain,
			Label:             "Main",
			Status:            model.AgentStatusMain,
			TraceAvailability: model.TraceAvailabilityAvailable,
			TraceSessionKey:   root.Key,
			TraceEventCount:   root.EventCount,
			LinkQuality:       model.AgentLinkQualityExact,
			LinkMethod:        model.AgentLinkMethodRoot,
		}},
	}

	childrenByParent := indexChildrenByParent(catalog)
	launches, err := a.readAgentLaunches(root.Path)
	if err != nil {
		return nil, err
	}

	addedNodes := map[string]bool{mainID: true}
	visitedSessions := map[string]bool{root.Key: true}
	queue := []crushGraphActor{{session: root, nodeID: mainID, sourceID: root.ID}}
	for len(queue) > 0 {
		actor := queue[0]
		queue = queue[1:]

		linkedChildren := make(map[string]bool)
		for _, launch := range launches {
			output, hasIdentity := parseCrushLaunchOutput(launch.output)
			if hasIdentity && output.AgentID != "" {
				var child *model.SessionMeta
				for i := range childrenByParent[actor.sourceID] {
					candidate := &childrenByParent[actor.sourceID][i]
					if candidate.Agent != nil && candidate.Agent.SourceID == output.AgentID && !visitedSessions[candidate.Key] {
						child = candidate
						break
					}
				}
				node := exactCrushAgentNode(harnessName, root.Key, actor, launch, output, child)
				if !addedNodes[node.ID] {
					graph.Agents = append(graph.Agents, node)
					addedNodes[node.ID] = true
				}
				if child != nil {
					linkedChildren[child.Key] = true
					visitedSessions[child.Key] = true
					queue = append(queue, crushGraphActor{
						session:  *child,
						nodeID:   node.ID,
						depth:    node.Depth,
						sourceID: child.Agent.SourceID,
					})
				}
				continue
			}
			node := unlinkedCrushLaunchNode(harnessName, root.Key, actor, launch)
			if !addedNodes[node.ID] {
				graph.Agents = append(graph.Agents, node)
				addedNodes[node.ID] = true
			}
		}

		// Children recorded in the catalog but never matched to a
		// launch are still surfaced as derived nodes — they almost
		// always represent the same session launched via a path the
		// trace didn't capture (e.g. the spawn happened before the
		// cursor was saved).
		for i := range childrenByParent[actor.sourceID] {
			child := &childrenByParent[actor.sourceID][i]
			if linkedChildren[child.Key] || visitedSessions[child.Key] {
				continue
			}
			node := derivedCrushAgentNode(harnessName, root.Key, actor, child)
			if addedNodes[node.ID] {
				continue
			}
			graph.Agents = append(graph.Agents, node)
			addedNodes[node.ID] = true
			visitedSessions[child.Key] = true
			queue = append(queue, crushGraphActor{
				session:  *child,
				nodeID:   node.ID,
				depth:    node.Depth,
				sourceID: child.Agent.SourceID,
			})
		}
	}

	graph.Agents = adapter.OrderAgentNodesPreorder(graph.Agents)
	return graph, nil
}

// indexChildrenByParent groups the catalog's auxiliary sessions by the
// parent session id (the one stored in parent_session_id when the
// child row was created). The Crush schema records the parent session
// id directly, unlike codex, so no SourceID translation is required.
func indexChildrenByParent(catalog []model.SessionMeta) map[string][]model.SessionMeta {
	childrenByParent := make(map[string][]model.SessionMeta)
	for _, session := range catalog {
		if session.Agent == nil || session.Agent.RootSessionID == "" || session.Harness != harnessName {
			continue
		}
		childrenByParent[session.Agent.RootSessionID] = append(childrenByParent[session.Agent.RootSessionID], session)
	}
	for parent := range childrenByParent {
		sort.Slice(childrenByParent[parent], func(i, j int) bool {
			return childrenByParent[parent][i].Key < childrenByParent[parent][j].Key
		})
	}
	return childrenByParent
}

// readAgentLaunches scans one session's messages for `agent` tool
// calls and their results. The agent tool is the only Crush-internal
// tool that spawns a child session, so anything else is ignored here.
func (a Adapter) readAgentLaunches(path string) ([]agentLaunch, error) {
	if path == "" {
		return nil, nil
	}
	sessionID, _, ok := splitSessionID(path)
	if !ok {
		return nil, nil
	}

	db, err := a.openReadOnly()
	if err != nil {
		return nil, err
	}
	if db == nil {
		return nil, nil
	}
	defer db.close()

	rows, err := db.db.Query(messagesBySessionQuery, sessionID)
	if err != nil {
		return nil, err
	}
	defer rows.Close()

	launches := []agentLaunch{}
	launchByCallID := make(map[string]int)
	seenCalls := make(map[string]bool)
	seq := 0
	for rows.Next() {
		var msg messageRow
		if err := rows.Scan(&msg.ID, &msg.Role, &msg.Parts, &msg.Model, &msg.Provider, &msg.CreatedAt); err != nil {
			return nil, err
		}
		parsed, err := decodeParts(msg.Parts, "")
		if err != nil {
			continue
		}
		for _, call := range parsed.events {
			if call.Name != "agent" || call.ID == "" {
				continue
			}
			if seenCalls[call.ID] {
				continue
			}
			seenCalls[call.ID] = true
			launchByCallID[call.ID] = len(launches)
			launches = append(launches, agentLaunch{
				callID:    call.ID,
				seq:       seq,
				arguments: call.Input,
			})
			seq++
		}
		for i, call := range parsed.events {
			if call.Name != "agent" || call.ID == "" {
				continue
			}
			if i >= len(parsed.results) {
				continue
			}
			idx, ok := launchByCallID[call.ID]
			if !ok || launches[idx].outputObserved {
				continue
			}
			launches[idx].output = parsed.results[i].Content
			launches[idx].outputObserved = true
		}
	}
	if err := rows.Err(); err != nil {
		return nil, err
	}
	return launches, nil
}

func parseCrushLaunchOutput(raw string) (agentLaunchOutput, bool) {
	trimmed := strings.TrimSpace(raw)
	if trimmed == "" {
		return agentLaunchOutput{}, false
	}
	var output agentLaunchOutput
	if err := json.Unmarshal([]byte(trimmed), &output); err != nil {
		return agentLaunchOutput{}, false
	}
	return output, output.AgentID != "" || output.Nickname != "" || output.TaskName != ""
}

func exactCrushAgentNode(harness, rootKey string, actor crushGraphActor, launch agentLaunch, output agentLaunchOutput, child *model.SessionMeta) model.AgentNode {
	seq := launch.seq
	node := model.AgentNode{
		ID:                 adapter.AgentNodeID(harness, rootKey, "crush-agent:"+output.AgentID),
		ParentID:           actor.nodeID,
		Depth:              actor.depth + 1,
		Kind:               model.AgentKindSubagent,
		Label:              output.Nickname,
		Role:               agentArgument(launch.arguments, "agent_type"),
		InstructionPreview: adapter.AgentInstructionPreview(agentArgument(launch.arguments, "message")),
		LaunchSeq:          &seq,
		LaunchCallID:       launch.callID,
		Status:             model.AgentStatusLaunched,
		TraceAvailability:  model.TraceAvailabilityMissing,
		LinkQuality:        model.AgentLinkQualityExact,
		LinkMethod:         model.AgentLinkMethodCodexAgentID,
	}
	if child != nil {
		node.TraceAvailability = model.TraceAvailabilityAvailable
		node.TraceSessionKey = child.Key
		node.TraceEventCount = child.EventCount
		if child.Agent != nil {
			node.Depth = crushChildDepth(child.Agent.Depth, actor.depth)
		}
		if child.Title != "" {
			node.Label = child.Title
		}
	}
	if node.Label == "" {
		node.Label = output.Nickname
	}
	if node.Label == "" {
		node.Label = "Subagent"
	}
	return node
}

func unlinkedCrushLaunchNode(harness, rootKey string, actor crushGraphActor, launch agentLaunch) model.AgentNode {
	seq := launch.seq
	status := model.AgentStatusUnknown
	trimmedOutput := strings.TrimSpace(launch.output)
	if launch.outputObserved && trimmedOutput != "" && !json.Valid([]byte(trimmedOutput)) {
		status = model.AgentStatusFailed
	}
	return model.AgentNode{
		ID:                 adapter.AgentNodeID(harness, rootKey, "crush-agent:"+launch.callID),
		ParentID:           actor.nodeID,
		Depth:              actor.depth + 1,
		Kind:               model.AgentKindSubagent,
		Label:              launch.callID,
		Role:               agentArgument(launch.arguments, "agent_type"),
		InstructionPreview: adapter.AgentInstructionPreview(agentArgument(launch.arguments, "message")),
		LaunchSeq:          &seq,
		LaunchCallID:       launch.callID,
		Status:             status,
		TraceAvailability:  model.TraceAvailabilityMissing,
		LinkQuality:        model.AgentLinkQualityUnavailable,
		LinkMethod:         model.AgentLinkMethodUnavailable,
	}
}

func derivedCrushAgentNode(harness, rootKey string, actor crushGraphActor, child *model.SessionMeta) model.AgentNode {
	node := model.AgentNode{
		ID:                 adapter.AgentNodeID(harness, rootKey, "crush-child:"+child.Agent.SourceID),
		ParentID:           actor.nodeID,
		Depth:              actor.depth + 1,
		Kind:               model.AgentKindSubagent,
		Label:              child.Title,
		Role:               child.Agent.Role,
		Status:             model.AgentStatusLaunched,
		TraceAvailability:  model.TraceAvailabilityAvailable,
		TraceSessionKey:    child.Key,
		TraceEventCount:    child.EventCount,
		LinkQuality:        model.AgentLinkQualityDerived,
		LinkMethod:         model.AgentLinkMethodCodexAgentID,
		LaunchCallID:       child.Agent.LaunchCallID,
	}
	if node.Label == "" {
		node.Label = "Subagent"
	}
	return node
}

// crushChildDepth uses the auxiliary row's recorded depth when one
// was set; otherwise the parent's depth + 1. Crush does not stamp a
// depth column, so we fall back to the conventional increment.
func crushChildDepth(recorded, parentDepth int) int {
	if recorded > 0 {
		return recorded
	}
	return parentDepth + 1
}

// agentArgument returns the first non-empty string field from input
// using the conventional Crush naming (prompt/task_title/...).
func agentArgument(input map[string]any, key string) string {
	if v, ok := input[key].(string); ok {
		return strings.TrimSpace(v)
	}
	for _, alias := range []string{"task_title", "title", "description", "message"} {
		if v, ok := input[alias].(string); ok && strings.TrimSpace(v) != "" {
			return strings.TrimSpace(v)
		}
	}
	return ""
}