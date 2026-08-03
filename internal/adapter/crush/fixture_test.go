package crush

import (
	"path/filepath"
	"testing"

	"github.com/cosmtrek/mindwalk/internal/model"
)

// fixtureDir is the path to the committed testdata/crush/crush.db
// fixture. The fixture is built once by the gencrushfixture helper
// (not committed) and checked into git so CI reproduces the
// end-to-end Crush verification path without a host install.
func fixtureDir(t *testing.T) string {
	t.Helper()
	return filepath.Join("..", "..", "..", "testdata", "crush")
}

// TestFixtureLoadsAllSessions walks the committed fixture and
// verifies both the root session and the auxiliary agent session
// surface through ListSessions with the expected metadata.
func TestFixtureLoadsAllSessions(t *testing.T) {
	dir := fixtureDir(t)
	metas, err := Adapter{Dir: dir}.ListSessions()
	if err != nil {
		t.Fatalf("ListSessions: %v", err)
	}
	if len(metas) != 1 {
		t.Fatalf("metas = %d, want 1 (child sessions should be hidden)", len(metas))
	}
	root := metas[0]
	if root.ID != "fixture-root" {
		t.Fatalf("id = %q", root.ID)
	}
	if root.Harness != "crush" {
		t.Fatalf("harness = %q", root.Harness)
	}
	if root.Title != "Fixture root session" {
		t.Fatalf("title = %q", root.Title)
	}
	if !IsSessionPath(root.Path) {
		t.Fatalf("path = %q, want crush://session/<id>", root.Path)
	}
}

// TestFixtureParsesTraceAsExpected decodes the root session into a
// Trace and checks the event count, model field, and the marks
// (user-message + subagent). This is the same path the server's
// /api/sessions/<key>/trace endpoint takes.
func TestFixtureParsesTraceAsExpected(t *testing.T) {
	dir := fixtureDir(t)
	trace, err := Adapter{Dir: dir}.Parse(SessionPath("fixture-root"))
	if err != nil {
		t.Fatalf("Parse: %v", err)
	}
	if trace.Session.Harness != "crush" {
		t.Fatalf("harness = %q", trace.Session.Harness)
	}
	if trace.Session.Model != "minimax/minimax-m3" {
		t.Fatalf("model = %q", trace.Session.Model)
	}
	if len(trace.Events) != 1 {
		t.Fatalf("events = %d, want 1 (single agent tool call)", len(trace.Events))
	}
	ev := trace.Events[0]
	if ev.Tool != "agent" {
		t.Fatalf("event = %+v", ev)
	}
	// Two marks: user-message (from finish/stop) and subagent
	// (from the agent tool call).
	if len(trace.Marks) != 2 {
		t.Fatalf("marks = %+v", trace.Marks)
	}
	var sawUser, sawSub bool
	for _, m := range trace.Marks {
		switch m.Type {
		case "user-message":
			sawUser = true
			if m.Note != "Read internal/server/server.go." {
				t.Fatalf("user note = %q", m.Note)
			}
		case "subagent":
			sawSub = true
			if m.Note != "read server" {
				t.Fatalf("subagent note = %q", m.Note)
			}
		}
	}
	if !sawUser || !sawSub {
		t.Fatalf("expected both marks, got user=%v sub=%v", sawUser, sawSub)
	}
}

// TestFixtureSummarizesChildSession ensures the auxiliary session
// is reachable via Summarize with the correct SourceID and
// LaunchCallID parsed from the `$$` separator.
func TestFixtureSummarizesChildSession(t *testing.T) {
	dir := fixtureDir(t)
	meta, err := Adapter{Dir: dir}.Summarize(SessionPath("m_assistant_1$$call_agent_1"))
	if err != nil {
		t.Fatalf("Summarize: %v", err)
	}
	if !meta.Auxiliary {
		t.Fatalf("Auxiliary = false, want true")
	}
	if meta.Agent == nil {
		t.Fatalf("Agent meta nil")
	}
	if meta.Agent.SourceID != "m_assistant_1" {
		t.Fatalf("SourceID = %q", meta.Agent.SourceID)
	}
	if meta.Agent.LaunchCallID != "call_agent_1" {
		t.Fatalf("LaunchCallID = %q", meta.Agent.LaunchCallID)
	}
	if meta.Agent.RootSessionID != "fixture-root" {
		t.Fatalf("RootSessionID = %q", meta.Agent.RootSessionID)
	}
}

// TestFixtureBuildsAgentGraph verifies the agent graph builder
// emits the main node plus the auxiliary child node when given the
// fixture's catalog.
func TestFixtureBuildsAgentGraph(t *testing.T) {
	dir := fixtureDir(t)
	adapter := Adapter{Dir: dir}
	metas, err := adapter.ListSessions()
	if err != nil {
		t.Fatal(err)
	}
	childMeta, err := adapter.Summarize(SessionPath("m_assistant_1$$call_agent_1"))
	if err != nil {
		t.Fatal(err)
	}
	root := metas[0]
	graph, err := adapter.BuildAgentGraph(root, []model.SessionMeta{childMeta})
	if err != nil {
		t.Fatalf("BuildAgentGraph: %v", err)
	}
	if graph.RootSessionKey != root.Key {
		t.Fatalf("root key = %q", graph.RootSessionKey)
	}
	if len(graph.Agents) != 2 {
		t.Fatalf("agents = %d, want 2 (main + child)", len(graph.Agents))
	}
	var sub *model.AgentNode
	for i := range graph.Agents {
		if graph.Agents[i].Kind == model.AgentKindSubagent {
			sub = &graph.Agents[i]
		}
	}
	if sub == nil {
		t.Fatalf("no subagent node in graph: %+v", graph.Agents)
	}
	if sub.LinkQuality != model.AgentLinkQualityExact {
		t.Fatalf("link quality = %q, want exact", sub.LinkQuality)
	}
	if sub.TraceSessionKey != childMeta.Key {
		t.Fatalf("trace key = %q, want %q", sub.TraceSessionKey, childMeta.Key)
	}
}