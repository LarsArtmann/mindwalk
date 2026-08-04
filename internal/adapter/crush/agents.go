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

type crushGraphActor = adapter.GraphActor

func (a Adapter) AgentGraphInputs(root model.SessionMeta, catalog []model.SessionMeta) ([]string, error) {
	// The Crush adapter stores every trace in a database, so
	// the agent graph only needs each session's path. Auxiliary
	// children are intentionally hidden from the rail (ListSessions
	// filters them out by parent_session_id IS NULL) but the agent
	// graph builder needs them so it can match launches ↔
	// children. Query the catalog first, then fall back to every
	// known database for any harness that didn't surface its
	// sub-sessions to the catalog.
	paths := map[string]bool{root.Path: true}
	for _, session := range catalog {
		if session.Harness != harnessName || session.Agent == nil || session.Path == "" {
			continue
		}
		paths[session.Path] = true
	}
	for _, dbPath := range a.enumerateDBPaths() {
		db, err := openReadOnlyAt(dbPath)
		if err != nil || db == nil {
			continue
		}
		if rows, err := db.db.Query(allSessionsQuery); err == nil {
			for rows.Next() {
				meta, err := scanSessionMeta(rows)
				if err == nil && meta.Agent != nil {
					paths[meta.Path] = true
				}
			}
			_ = rows.Close()
		}
		_ = db.close()
	}
	inputs := make([]string, 0, len(paths))
	for path := range paths {
		inputs = append(inputs, path)
	}
	sort.Strings(inputs)
	return inputs, nil
}

// BuildAgentGraph stitches the agent-tool launches recorded in the
// root session's messages to the child sessions present in the
// catalog. Like the codex implementation it tolerates orphans in
// both directions — a launch with no matching child and a child
// with no recorded launch — and renders each into the graph at the
// appropriate quality tier.
//
// Auxiliary children are hidden from the rail (ListSessions filters
// them out), so the catalog handed in by the server does not contain
// them. The builder supplements the catalog with any agent-tool
// sessions present in the same database.
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
	if extras, err := a.loadAgentChildren(); err == nil {
		for _, child := range extras {
			childrenByParent[child.Agent.RootSessionID] = append(childrenByParent[child.Agent.RootSessionID], child)
		}
	}
	launches, err := a.readAgentLaunches(root.Path)
	if err != nil {
		return nil, err
	}

	addedNodes := map[string]bool{mainID: true}
	visitedSessions := map[string]bool{root.Key: true}
	queue := []crushGraphActor{{Session: root, NodeID: mainID, SourceID: root.ID}}
	for len(queue) > 0 {
		actor := queue[0]
		queue = queue[1:]

		linkedChildren := make(map[string]bool)
		for _, launch := range launches {
			output, hasIdentity := parseCrushLaunchOutput(launch.Output)
			if hasIdentity && output.AgentID != "" {
				var child *model.SessionMeta
				for i := range childrenByParent[actor.SourceID] {
					candidate := &childrenByParent[actor.SourceID][i]
					if candidate.Agent != nil && candidate.Agent.SourceID == output.AgentID &&
						!visitedSessions[candidate.Key] {
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
						Session:  *child,
						NodeID:   node.ID,
						Depth:    node.Depth,
						SourceID: child.Agent.SourceID,
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
		for i := range childrenByParent[actor.SourceID] {
			child := &childrenByParent[actor.SourceID][i]
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
				Session:  *child,
				NodeID:   node.ID,
				Depth:    node.Depth,
				SourceID: child.Agent.SourceID,
			})
		}
	}

	graph.Agents = adapter.OrderAgentNodesPreorder(graph.Agents)
	return graph, nil
}

// loadAgentChildren reads every auxiliary (agent-tool) session
// from every known database. ListSessions hides these from the rail, but
// the agent graph builder needs them so it can match launches to
// child rows. Errors are non-fatal: the catalog the caller passed
// in is the source of truth, this is just a supplement.
func (a Adapter) loadAgentChildren() ([]model.SessionMeta, error) {
	var children []model.SessionMeta
	for _, dbPath := range a.enumerateDBPaths() {
		db, err := openReadOnlyAt(dbPath)
		if err != nil || db == nil {
			continue
		}
		rows, err := db.db.Query(allSessionsQuery)
		if err != nil {
			_ = db.close()
			continue
		}
		for rows.Next() {
			meta, err := scanSessionMeta(rows)
			if err != nil {
				continue
			}
			if meta.Agent != nil {
				children = append(children, meta)
			}
		}
		_ = rows.Close()
		_ = db.close()
	}
	return children, nil
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
//
// Tool calls and their results can land in different messages. The
// streaming parser keeps an observed-ids map across messages so a
// tool call in message A is paired with its result in message B.
func (a Adapter) readAgentLaunches(path string) ([]adapter.AgentLaunch, error) {
	if path == "" {
		return nil, nil
	}
	sessionID, _, ok := splitSessionID(path)
	if !ok {
		return nil, nil
	}

	db, err := a.openDBForPath(path)
	if err != nil {
		return nil, err
	}
	if db == nil {
		return nil, nil
	}
	defer db.closeDiscard()

	rows, err := db.db.Query(messagesBySessionQuery, sessionID)
	if err != nil {
		return nil, err
	}
	defer func() { _ = rows.Close() }()

	launches := []adapter.AgentLaunch{}
	launchByCallID := make(map[string]int)
	seenCalls := make(map[string]bool)
	seenResults := make(map[string]bool)
	seq := 0
	for rows.Next() {
		var msg messageRow
		if err := rows.Scan(&msg.ID, &msg.Role, &msg.Parts, &msg.Model, &msg.Provider, &msg.CreatedAt, &msg.FinishedAt); err != nil {
			return nil, err
		}
		parsed, err := decodeParts(msg.Parts, "")
		if err != nil {
			continue
		}
		// Record each agent tool call (first occurrence wins).
		// The events loop runs first so a tool result observed in
		// the same message finds its corresponding launch.
		for _, call := range parsed.events {
			if call.Name != "agent" || call.ID == "" {
				continue
			}
			if seenCalls[call.ID] {
				continue
			}
			seenCalls[call.ID] = true
			launchByCallID[call.ID] = len(launches)
			launches = append(launches, adapter.AgentLaunch{
				CallID:    call.ID,
				Seq:       seq,
				Arguments: call.Input,
			})
			seq++
		}
		// Attach tool results to launches. Each result carries the
		// originating tool_call_id, so we can match them across
		// messages here.
		for _, result := range parsed.results {
			callID := result.ToolCallID
			if callID == "" || seenResults[callID] {
				continue
			}
			seenResults[callID] = true
			idx, ok := launchByCallID[callID]
			if !ok {
				continue
			}
			launches[idx].Output = result.Content
			launches[idx].OutputObserved = true
		}
	}
	if err := rows.Err(); err != nil {
		return nil, err
	}
	return launches, nil
}

func parseCrushLaunchOutput(raw string) (adapter.AgentLaunchOutput, bool) {
	trimmed := strings.TrimSpace(raw)
	if trimmed == "" {
		return adapter.AgentLaunchOutput{}, false
	}
	var output adapter.AgentLaunchOutput
	if err := json.Unmarshal([]byte(trimmed), &output); err != nil {
		return adapter.AgentLaunchOutput{}, false
	}
	return output, output.AgentID != "" || output.Nickname != "" || output.TaskName != ""
}

func exactCrushAgentNode(
	harness, rootKey string,
	actor crushGraphActor,
	launch adapter.AgentLaunch,
	output adapter.AgentLaunchOutput,
	child *model.SessionMeta,
) model.AgentNode {
	seq := launch.Seq
	node := model.AgentNode{
		ID:                 adapter.AgentNodeID(harness, rootKey, "crush-agent:"+output.AgentID),
		ParentID:           actor.NodeID,
		Depth:              actor.Depth + 1,
		Kind:               model.AgentKindSubagent,
		Label:              output.Nickname,
		Role:               agentArgument(launch.Arguments, "agent_type"),
		InstructionPreview: adapter.AgentInstructionPreview(agentArgument(launch.Arguments, "message")),
		LaunchSeq:          &seq,
		LaunchCallID:       launch.CallID,
		Status:             model.AgentStatusLaunched,
		TraceAvailability:  model.TraceAvailabilityMissing,
		LinkQuality:        model.AgentLinkQualityExact,
		LinkMethod:         model.AgentLinkMethodCrushAgentID,
	}
	if child != nil {
		node.TraceAvailability = model.TraceAvailabilityAvailable
		node.TraceSessionKey = child.Key
		node.TraceEventCount = child.EventCount
		if child.Agent != nil {
			node.Depth = crushChildDepth(child.Agent.Depth, actor.Depth)
		}
		if child.Title != "" {
			node.Label = child.Title
		}
	}
	adapter.ApplyLaunchNickname(&node, output)
	return node
}

func unlinkedCrushLaunchNode(
	harness, rootKey string,
	actor crushGraphActor,
	launch adapter.AgentLaunch,
) model.AgentNode {
	seq := launch.Seq
	return model.AgentNode{
		ID:                 adapter.AgentNodeID(harness, rootKey, "crush-agent:"+launch.CallID),
		ParentID:           actor.NodeID,
		Depth:              actor.Depth + 1,
		Kind:               model.AgentKindSubagent,
		Label:              launch.CallID,
		Role:               agentArgument(launch.Arguments, "agent_type"),
		InstructionPreview: adapter.AgentInstructionPreview(agentArgument(launch.Arguments, "message")),
		LaunchSeq:          &seq,
		LaunchCallID:       launch.CallID,
		Status:             adapter.UnlinkedLaunchStatus(launch),
		TraceAvailability:  model.TraceAvailabilityMissing,
		LinkQuality:        model.AgentLinkQualityUnavailable,
		LinkMethod:         model.AgentLinkMethodUnavailable,
	}
}

func derivedCrushAgentNode(harness, rootKey string, actor crushGraphActor, child *model.SessionMeta) model.AgentNode {
	node := model.AgentNode{
		ID:                adapter.AgentNodeID(harness, rootKey, "crush-child:"+child.Agent.SourceID),
		ParentID:          actor.NodeID,
		Depth:             actor.Depth + 1,
		Kind:              model.AgentKindSubagent,
		Label:             child.Title,
		Role:              child.Agent.Role,
		Status:            model.AgentStatusLaunched,
		TraceAvailability: model.TraceAvailabilityAvailable,
		TraceSessionKey:   child.Key,
		TraceEventCount:   child.EventCount,
		LinkQuality:       model.AgentLinkQualityDerived,
		LinkMethod:        model.AgentLinkMethodCodexAgentID,
		LaunchCallID:      child.Agent.LaunchCallID,
	}
	adapter.ApplySubagentLabel(&node)
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
