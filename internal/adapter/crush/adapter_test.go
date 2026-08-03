package crush

import (
	"database/sql"
	"encoding/json"
	"os"
	"path/filepath"
	"strings"
	"testing"
	"time"

	_ "modernc.org/sqlite"
)

// newFixtureDB creates a fresh Crush database under t.TempDir/crush.db
// and seeds it with the minimum schema the adapter reads. Every test
// returns the open handle plus the working directory so adapters
// can resolve a project-local .crush without touching the host FS.
func newFixtureDB(t *testing.T, seed func(*sql.DB)) (dir string, db *sql.DB) {
	t.Helper()
	root := t.TempDir()
	data := filepath.Join(root, ".crush")
	if err := os.MkdirAll(data, 0o755); err != nil {
		t.Fatal(err)
	}
	handle, err := sql.Open("sqlite", "file:"+filepath.Join(data, "crush.db")+"?_pragma=journal_mode(WAL)")
	if err != nil {
		t.Fatal(err)
	}
	handle.SetMaxOpenConns(1)
	schema := `
		CREATE TABLE IF NOT EXISTS sessions (
			id TEXT PRIMARY KEY,
			parent_session_id TEXT,
			title TEXT NOT NULL,
			message_count INTEGER NOT NULL DEFAULT 0,
			prompt_tokens INTEGER NOT NULL DEFAULT 0,
			completion_tokens INTEGER NOT NULL DEFAULT 0,
			cost REAL NOT NULL DEFAULT 0.0,
			updated_at INTEGER NOT NULL,
			created_at INTEGER NOT NULL,
			todos TEXT
		);
		CREATE TABLE IF NOT EXISTS messages (
			id TEXT PRIMARY KEY,
			session_id TEXT NOT NULL,
			role TEXT NOT NULL,
			parts TEXT NOT NULL DEFAULT '[]',
			model TEXT,
			provider TEXT,
			created_at INTEGER NOT NULL,
			updated_at INTEGER NOT NULL,
			finished_at INTEGER
		);
	`
	if _, err := handle.Exec(schema); err != nil {
		handle.Close()
		t.Fatal(err)
	}
	if seed != nil {
		seed(handle)
	}
	t.Cleanup(func() { handle.Close() })
	return data, handle
}

func writeParts(t *testing.T, parts ...map[string]any) string {
	t.Helper()
	encoded := make([]json.RawMessage, 0, len(parts))
	for _, part := range parts {
		data, err := json.Marshal(part)
		if err != nil {
			t.Fatal(err)
		}
		encoded = append(encoded, data)
	}
	out, err := json.Marshal(encoded)
	if err != nil {
		t.Fatal(err)
	}
	return string(out)
}

// insertSession writes a row to the sessions table. createdAt is
// captured in milliseconds like Crush does internally.
func insertSession(t *testing.T, db *sql.DB, id string, parent string, title string, createdAt time.Time, messages int64) {
	t.Helper()
	if _, err := db.Exec(`INSERT INTO sessions (id, parent_session_id, title, message_count, prompt_tokens, completion_tokens, cost, updated_at, created_at) VALUES (?, ?, ?, ?, 0, 0, 0.0, ?, ?)`,
		id, nullableString(parent), title, messages, createdAt.UnixMilli(), createdAt.UnixMilli()); err != nil {
		t.Fatal(err)
	}
}

// insertMessage writes one row to the messages table. createdAt is
// recorded in milliseconds to match Crush's convention.
func insertMessage(t *testing.T, db *sql.DB, sessionID string, id string, role string, parts string, model string, createdAt time.Time) {
	t.Helper()
	if _, err := db.Exec(`INSERT INTO messages (id, session_id, role, parts, model, created_at, updated_at) VALUES (?, ?, ?, ?, ?, ?, ?)`,
		id, sessionID, role, parts, nullableString(model), createdAt.UnixMilli(), createdAt.UnixMilli()); err != nil {
		t.Fatal(err)
	}
}

func nullableString(value string) any {
	if value == "" {
		return nil
	}
	return value
}

// TestSessionDirPrefersProjectFixture verifies the adapter's project
// discovery: a .crush directory inside the working dir wins over the
// platform default even when CRUSH_GLOBAL_DATA points elsewhere.
func TestSessionDirPrefersProjectFixture(t *testing.T) {
	root := t.TempDir()
	project := filepath.Join(root, "project")
	data := filepath.Join(project, ".crush")
	if err := os.MkdirAll(data, 0o755); err != nil {
		t.Fatal(err)
	}
	// The directory only counts as a Crush data dir when crush.db
	// sits next to it — create an empty file so the lookup accepts
	// the project fixture.
	if err := os.WriteFile(filepath.Join(data, "crush.db"), nil, 0o644); err != nil {
		t.Fatal(err)
	}
	// Truncate any cached git-worktree root from previous runs so
	// the fresh temp directory is not confused with one upstream.
	worktreeRootCache = map[string]string{}
	t.Setenv("CRUSH_GLOBAL_DATA", filepath.Join(root, "global"))

	got := Adapter{WorkingDir: project}.SessionDir()
	if got != data {
		t.Fatalf("session dir = %q, want %q", got, data)
	}
}

// TestListSessionsHidesAgentSessions ensures that agent-tool child
// sessions (those with a parent_session_id) stay out of the rail.
func TestListSessionsHidesAgentSessions(t *testing.T) {
	data, db := newFixtureDB(t, nil)
	base := time.Date(2026, 8, 1, 12, 0, 0, 0, time.UTC)
	insertSession(t, db, "root-1", "", "Root session", base, 4)
	insertSession(t, db, "child-1", "root-1", "Agent: explore", base.Add(time.Minute), 2)

	adapter := Adapter{Dir: data}
	metas, err := adapter.ListSessions()
	if err != nil {
		t.Fatal(err)
	}
	if len(metas) != 1 {
		t.Fatalf("metas = %d, want 1 (child sessions should be hidden)", len(metas))
	}
	if metas[0].ID != "root-1" {
		t.Fatalf("meta id = %q", metas[0].ID)
	}
}

// TestParseBuildsEventsAndMarks covers the full Parse path: text
// concatenation across messages, tool_call/tool_result pairing, and
// the user-message mark for a finish-reason=stop turn.
func TestParseBuildsEventsAndMarks(t *testing.T) {
	data, db := newFixtureDB(t, nil)
	base := time.Date(2026, 8, 1, 12, 0, 0, 0, time.UTC)
	insertSession(t, db, "demo", "", "Demo", base, 3)

	// User message carrying the request.
	insertMessage(t, db, "demo", "m1", "user", writeParts(t,
		map[string]any{"type": "text", "data": map[string]any{"text": "Add crush support"}},
		map[string]any{"type": "finish", "data": map[string]any{"reason": "stop", "time": 0}},
	), "", base)

	// Assistant message with a view tool call.
	insertMessage(t, db, "demo", "m2", "assistant", writeParts(t,
		map[string]any{"type": "text", "data": map[string]any{"text": "Looking at the adapter."}},
		map[string]any{"type": "tool_call", "data": map[string]any{"id": "call_view_1", "name": "view", "input": `{"file_path":"internal/adapter/adapter.go"}`, "finished": true, "provider_executed": false}},
	), "minimax/minimax-m3", base.Add(time.Second))

	// Tool result message.
	insertMessage(t, db, "demo", "m3", "tool", writeParts(t,
		map[string]any{"type": "tool_result", "data": map[string]any{"tool_call_id": "call_view_1", "name": "view", "content": "package adapter\n", "is_error": false}},
	), "", base.Add(2*time.Second))

	adapter := Adapter{Dir: data}
	trace, err := adapter.Parse(SessionPath("demo"))
	if err != nil {
		t.Fatal(err)
	}
	if trace.Session.Harness != "crush" {
		t.Fatalf("harness = %q", trace.Session.Harness)
	}
	if trace.Session.Model != "minimax/minimax-m3" {
		t.Fatalf("model = %q", trace.Session.Model)
	}
	if len(trace.Events) != 1 {
		t.Fatalf("events = %d, want 1", len(trace.Events))
	}
	ev := trace.Events[0]
	if ev.Tool != "view" || ev.Action != "read" {
		t.Fatalf("event = %+v", ev)
	}
	if len(ev.Targets) != 1 || ev.Targets[0].Path != "internal/adapter/adapter.go" {
		t.Fatalf("targets = %+v", ev.Targets)
	}
	if len(trace.Marks) != 1 || trace.Marks[0].Type != "user-message" {
		t.Fatalf("marks = %+v", trace.Marks)
	}
}

// TestParseOrphanToolCallStillEmitsEvent ensures a tool_call without
// a matching tool_result still surfaces an event so the timeline
// doesn't silently lose tool attempts.
func TestParseOrphanToolCallStillEmitsEvent(t *testing.T) {
	data, db := newFixtureDB(t, nil)
	base := time.Date(2026, 8, 1, 12, 0, 0, 0, time.UTC)
	insertSession(t, db, "demo", "", "Orphan", base, 1)
	insertMessage(t, db, "demo", "m1", "assistant", writeParts(t,
		map[string]any{"type": "tool_call", "data": map[string]any{"id": "missing", "name": "bash", "input": `{"command":"go test"}`, "finished": true, "provider_executed": false}},
	), "", base)

	trace, err := Adapter{Dir: data}.Parse(SessionPath("demo"))
	if err != nil {
		t.Fatal(err)
	}
	if len(trace.Events) != 1 {
		t.Fatalf("events = %d, want 1", len(trace.Events))
	}
	if trace.Events[0].ResultBytes != 0 {
		t.Fatalf("orphan event should carry an empty result, got %d bytes", trace.Events[0].ResultBytes)
	}
}

// TestParseMarksSubagentLaunches ensures the `agent` tool emits a
// subagent mark so the trace aligns with the Agent Lens graph.
func TestParseMarksSubagentLaunches(t *testing.T) {
	data, db := newFixtureDB(t, nil)
	base := time.Date(2026, 8, 1, 12, 0, 0, 0, time.UTC)
	insertSession(t, db, "root", "", "Root", base, 1)
	insertMessage(t, db, "root", "m1", "assistant", writeParts(t,
		map[string]any{"type": "tool_call", "data": map[string]any{"id": "agent_1", "name": "agent", "input": `{"task_title":"explore schema","agent_type":"explore","message":"read the migrations"}`, "finished": true, "provider_executed": false}},
	), "", base)

	trace, err := Adapter{Dir: data}.Parse(SessionPath("root"))
	if err != nil {
		t.Fatal(err)
	}
	if len(trace.Marks) != 1 {
		t.Fatalf("marks = %+v", trace.Marks)
	}
	if trace.Marks[0].Type != "subagent" {
		t.Fatalf("mark type = %q", trace.Marks[0].Type)
	}
	if trace.Marks[0].Note != "explore schema" {
		t.Fatalf("note = %q", trace.Marks[0].Note)
	}
}

// TestParseHandlesNestedJSONInput guards against the common Crush
// shape where tool_call.input is a stringified JSON literal of a
// stringified JSON object. The parser must peel both layers.
func TestParseHandlesNestedJSONInput(t *testing.T) {
	data, db := newFixtureDB(t, nil)
	base := time.Date(2026, 8, 1, 12, 0, 0, 0, time.UTC)
	insertSession(t, db, "demo", "", "Nested", base, 1)
	// inner JSON literal — what Crush often writes for tool inputs.
	nested := `{"file_path":"internal/server/server.go","limit":50}`
	insertMessage(t, db, "demo", "m1", "assistant", writeParts(t,
		map[string]any{"type": "tool_call", "data": map[string]any{"id": "call_view_1", "name": "view", "input": nested, "finished": true, "provider_executed": false}},
	), "", base)

	trace, err := Adapter{Dir: data}.Parse(SessionPath("demo"))
	if err != nil {
		t.Fatal(err)
	}
	if len(trace.Events) != 1 {
		t.Fatalf("events = %d, want 1", len(trace.Events))
	}
	if trace.Events[0].Targets[0].Path != "internal/server/server.go" {
		t.Fatalf("path = %q", trace.Events[0].Targets[0].Path)
	}
}

// TestSummarizeFlagsAuxiliary verifies the Summarize path stamps
// Auxiliary=true on agent-tool child sessions and exposes both the
// message id and launching tool call id on Agent.
func TestSummarizeFlagsAuxiliary(t *testing.T) {
	data, db := newFixtureDB(t, nil)
	base := time.Date(2026, 8, 1, 12, 0, 0, 0, time.UTC)
	insertSession(t, db, "root", "", "Root", base, 1)
	insertSession(t, db, "msg-1$$toolcall-1", "root", "Agent: explore", base.Add(time.Minute), 2)

	adapter := Adapter{Dir: data}
	meta, err := adapter.Summarize(SessionPath("msg-1$$toolcall-1"))
	if err != nil {
		t.Fatal(err)
	}
	if !meta.Auxiliary {
		t.Fatalf("meta auxiliary = false, want true")
	}
	if meta.Agent == nil || meta.Agent.SourceID != "msg-1" || meta.Agent.LaunchCallID != "toolcall-1" {
		t.Fatalf("agent = %+v", meta.Agent)
	}
}

// TestDecodePartsToleratesMalformedParts ensures a malformed parts
// payload doesn't poison the whole parse — the trace still loads.
func TestDecodePartsToleratesMalformedParts(t *testing.T) {
	_, err := decodeParts("not json", "")
	if err == nil {
		t.Fatalf("expected decode error for non-JSON parts")
	}
	result, err := decodeParts("[]", "")
	if err != nil {
		t.Fatal(err)
	}
	if result.text != "" || len(result.events) != 0 {
		t.Fatalf("empty parts should produce empty result, got %+v", result)
	}
}

// TestSummarizeMissingDatabase is the no-Crush-installed fallback —
// calling Summarize on an empty data dir must surface a clear error
// instead of returning a phantom meta.
func TestSummarizeMissingDatabase(t *testing.T) {
	root := t.TempDir()
	t.Setenv("CRUSH_GLOBAL_DATA", root)
	// Wipe the global data directory so neither project nor global
	// discovery can find a crush.db. The adapter should report
	// "no Crush session" rather than fabricating one.
	if err := os.RemoveAll(root); err != nil {
		t.Fatal(err)
	}
	_, err := Adapter{}.Summarize(SessionPath("anything"))
	if err == nil || !strings.Contains(err.Error(), "not a Crush session") {
		t.Fatalf("expected not-a-Crush-session error, got %v", err)
	}
}

// TestOpenReadOnlyReportsUnderlyingError verifies the error path
// surfaces the underlying cause and the resolved path so a user
// can diagnose a broken configuration without re-deriving the
// path. An empty file and a directory where crush.db is expected
// each produce a distinct, helpful error message.
func TestOpenReadOnlyReportsUnderlyingError(t *testing.T) {
	// Empty file → "empty (size 0)"
	dir := t.TempDir()
	emptyFile := filepath.Join(dir, "crush.db")
	if err := os.WriteFile(emptyFile, nil, 0o644); err != nil {
		t.Fatal(err)
	}
	_, err := Adapter{Dir: dir}.ListSessions()
	if err == nil || !strings.Contains(err.Error(), "empty (size 0)") {
		t.Fatalf("empty file error = %v", err)
	}

	// Directory where file is expected → "is a directory"
	dirAsFile := filepath.Join(t.TempDir(), "crush.db")
	if err := os.MkdirAll(dirAsFile, 0o755); err != nil {
		t.Fatal(err)
	}
	_, err = Adapter{Dir: filepath.Dir(dirAsFile)}.ListSessions()
	if err == nil || !strings.Contains(err.Error(), "is a directory") {
		t.Fatalf("directory-as-file error = %v", err)
	}
}
