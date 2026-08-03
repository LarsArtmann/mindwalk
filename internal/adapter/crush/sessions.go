package crush

import (
	"context"
	"database/sql"
	"errors"
	"fmt"
	"os"
	"path/filepath"
	"sort"
	"strings"
	"time"

	"github.com/cosmtrek/mindwalk/internal/adapter"
	"github.com/cosmtrek/mindwalk/internal/judge"
	"github.com/cosmtrek/mindwalk/internal/model"
)

// harnessName is the canonical harness identifier mindwalk attaches to
// every trace that came through this adapter. The frontend matches on
// this string in a few places (filter pills, panel headers, judge
// input shape) so it must stay stable.
const harnessName = "crush"

// ListSessions returns the metadata for every top-level Crush session
// found in the resolved data directory, newest first. Auxiliary
// (sub-agent) sessions are intentionally hidden from the rail because
// the Agent Lens surfaces them on demand from a root session.
func (a Adapter) ListSessions() ([]model.SessionMeta, error) {
	db, err := a.openReadOnly()
	if err != nil {
		return nil, err
	}
	if db == nil {
		return nil, nil
	}
	defer db.close()

	rows, err := db.db.QueryContext(context.Background(), listSessionsQuery)
	if err != nil {
		return nil, fmt.Errorf("list crush sessions: %w", err)
	}
	defer rows.Close()

	var metas []model.SessionMeta
	for rows.Next() {
		meta, err := scanSessionMeta(rows)
		if err != nil {
			return nil, err
		}
		metas = append(metas, meta)
	}
	if err := rows.Err(); err != nil {
		return nil, err
	}
	sort.Slice(metas, func(i, j int) bool {
		return metas[i].EndedAt > metas[j].EndedAt
	})
	return metas, nil
}

// Summarize returns the metadata for one session without materialising
// its full message history. The agent-tool (sub-agent) session ID
// format `messageID$$toolCallID` is detected here so the rail can hide
// the corresponding rows from the root listing.
func (a Adapter) Summarize(path string) (model.SessionMeta, error) {
	db, err := a.openReadOnly()
	if err != nil {
		return model.SessionMeta{}, err
	}
	if db == nil {
		return model.SessionMeta{}, errDBUnavailable
	}
	defer db.close()

	id, isAgent, ok := splitSessionID(path)
	if !ok {
		return model.SessionMeta{}, fmt.Errorf("invalid Crush session id in path %q", path)
	}

	row := db.db.QueryRowContext(context.Background(), sessionByIDQuery, id)
	meta, err := scanSessionMeta(row)
	if err != nil {
		if errors.Is(err, sql.ErrNoRows) {
			return model.SessionMeta{}, fmt.Errorf("not a Crush session: %s", path)
		}
		return model.SessionMeta{}, err
	}
	if isAgent || meta.Agent != nil {
		meta.Auxiliary = true
	}
	if isAgent {
		parts := strings.SplitN(id, agentIDSeparator, 2)
		if len(parts) == 2 {
			if meta.Agent == nil {
				meta.Agent = &model.AgentSessionMeta{}
			}
			meta.Agent.SourceID = parts[0]
			meta.Agent.LaunchCallID = parts[1]
			// RootSessionID is the parent session id, not the
			// parent message id. scanSessionMeta already populated
			// it from parent_session_id; only fall back to the
			// source-id split when the row had no parent row.
			if meta.Agent.RootSessionID == "" {
				meta.Agent.RootSessionID = parts[0]
			}
		}
	}
	// Sessions whose cwd matches the mindwalk judge workdir are mindwalk
	// itself recording its judge runs — drop them from every listing.
	if judge.IsWorkDir(meta.Cwd) {
		meta.Auxiliary = true
	}
	if meta.Title == "" {
		meta.Title = filepath.Base(path)
	}
	return meta, nil
}

// Parse converts one Crush session into the shared model.Trace. The
// implementation streams the messages table once, walks the parts JSON
// for each row in declaration order, and emits one model.Event per
// resolved tool call. User messages with finish.reason=stop also
// produce a user-message mark so the judge layer sees the same task
// text the rail does.
func (a Adapter) Parse(path string) (*model.Trace, error) {
	db, err := a.openReadOnly()
	if err != nil {
		return nil, err
	}
	if db == nil {
		return nil, errDBUnavailable
	}
	defer db.close()

	id, isAgent, ok := splitSessionID(path)
	if !ok {
		return nil, fmt.Errorf("invalid Crush session id in path %q", path)
	}

	trace := &model.Trace{
		Version: 1,
		Session: model.TraceSession{
			ID:      id,
			Harness: harnessName,
			Path:    path,
		},
		Events: []model.Event{},
		Marks:  []model.Mark{},
	}
	if isAgent {
		// The synthetic agent-tool session id carries no human-meaningful
		// title, so leave it blank — the agent graph labels the node.
	}

	row := db.db.QueryRowContext(context.Background(), sessionByIDQuery, id)
	meta, err := scanSessionMeta(row)
	if err != nil {
		if errors.Is(err, sql.ErrNoRows) {
			return nil, fmt.Errorf("not a Crush session: %s", path)
		}
		return nil, err
	}
	applySessionMeta(trace, meta)

	rows, err := db.db.QueryContext(context.Background(), messagesBySessionQuery, id)
	if err != nil {
		return nil, fmt.Errorf("read crush messages: %w", err)
	}
	defer rows.Close()

	recognized := meta.ID != ""
	pending := map[string]adapter.ToolCall{}
	pendingOrder := []string{}
	results := map[string]adapter.ToolResult{}

	for rows.Next() {
		var msg messageRow
		if err := rows.Scan(&msg.ID, &msg.Role, &msg.Parts, &msg.Model, &msg.Provider, &msg.CreatedAt); err != nil {
			return nil, fmt.Errorf("scan crush message: %w", err)
		}
		recognized = true
		ts := millisToRFC3339(msg.CreatedAt)
		applyMessageMeta(trace, msg, ts)

		parsed, err := decodeParts(msg.Parts, ts)
		if err != nil {
			// A malformed parts payload on one message shouldn't
			// poison the whole trace — log nothing (the visualizer
			// surfaces the trace even with a partial event log)
			// and keep going.
			continue
		}

		// User messages with finish.reason=stop represent the user
		// turn boundary in Crush. The judge needs this so it can see
		// what task the user actually typed without scanning the
		// assistant's replies for the same shape.
		if msg.Role == "user" && parsed.userFinish && parsed.text != "" {
			trace.Marks = append(trace.Marks, model.Mark{
				Seq:  len(pendingOrder),
				Type: "user-message",
				Note: adapter.UserMessageNote(parsed.text),
			})
		}

		if parsed.subagent && msg.Role == "assistant" {
			note := parsed.subagentNote
			if note == "" {
				note = parsed.text
			}
			trace.Marks = append(trace.Marks, model.Mark{
				Seq:  len(pendingOrder),
				Type: "subagent",
				Note: note,
			})
		}

		for i, call := range parsed.events {
			if _, exists := pending[call.ID]; !exists {
				pendingOrder = append(pendingOrder, call.ID)
			}
			pending[call.ID] = call
			if i < len(parsed.results) {
				results[call.ID] = parsed.results[i]
			}
		}
	}
	if err := rows.Err(); err != nil {
		return nil, err
	}

	for _, id := range pendingOrder {
		call := pending[id]
		result := results[id]
		trace.Events = append(trace.Events, adapter.BuildEvent(trace, call, result))
	}
	sort.SliceStable(trace.Events, func(i, j int) bool {
		return trace.Events[i].Seq < trace.Events[j].Seq
	})
	for i := range trace.Events {
		trace.Events[i].Seq = i
	}
	trace.Session.EventCount = len(trace.Events)
	if trace.Session.Title == "" {
		trace.Session.Title = filepath.Base(path)
	}
	// Crush's finish reasons carry no observability flags; the visualizer
	// infers failures from tool_result.is_error the same way it does for
	// Claude Code and Codex.
	trace.Stats = model.ComputeStats(trace, 0, model.ObservabilityEstimated)

	if !recognized {
		return nil, fmt.Errorf("not a Crush session: %s", path)
	}
	return trace, nil
}

// openReadOnly opens the database in read-only mode, returning (nil,
// nil) when the file is absent so ListSessions can return an empty
// catalog without treating "no Crush installed" as an error.
func (a Adapter) openReadOnly() (*sqlHandle, error) {
	path := a.dbPath()
	if path == "" {
		return nil, nil
	}
	if _, err := os.Stat(path); err != nil {
		if os.IsNotExist(err) {
			return nil, nil
		}
		return nil, err
	}
	db, err := openSQLite(path)
	if err != nil {
		return nil, err
	}
	return &sqlHandle{path: path, db: db}, nil
}

// sqlHandle bundles a *sql.DB with its source path so tests can
// inspect where the connection came from.
type sqlHandle struct {
	path string
	db   *sql.DB
}

func (h *sqlHandle) close() error {
	if h == nil || h.db == nil {
		return nil
	}
	return h.db.Close()
}

// listSessionsQuery, sessionByIDQuery and messagesBySessionQuery match
// the schema shipped in charmbracelet/crush's initial migration plus
// every later addition we care about. Stable identifiers (id, role,
// parts, created_at) come from the initial schema; model and provider
// come from the 2025-06-27 migration.
const listSessionsQuery = `SELECT id, title, parent_session_id, message_count, prompt_tokens, completion_tokens, updated_at, created_at, todos FROM sessions WHERE parent_session_id IS NULL ORDER BY updated_at DESC`

const sessionByIDQuery = `SELECT id, title, parent_session_id, message_count, prompt_tokens, completion_tokens, updated_at, created_at, todos FROM sessions WHERE id = ? LIMIT 1`

const messagesBySessionQuery = `SELECT id, role, parts, model, provider, created_at FROM messages WHERE session_id = ? ORDER BY created_at, id`

// sessionRow is the scan target for every row in the sessions table.
// The pointer fields are required because parent_session_id and todos
// are nullable and the SQLite driver refuses to Scan NULL into a
// plain string.
type sessionRow struct {
	ID               string
	Title            string
	ParentSessionID  sql.NullString
	MessageCount     int64
	PromptTokens     int64
	CompletionTokens int64
	UpdatedAt        int64
	CreatedAt        int64
	Todos            sql.NullString
}

type messageRow struct {
	ID        string
	Role      string
	Parts     string
	Model     sql.NullString
	Provider  sql.NullString
	CreatedAt int64
}

// scanTarget is implemented by both *sql.Row and *sql.Rows so
// Summarize and ListSessions share the same scan helper.
type scanTarget interface {
	Scan(dest ...any) error
}

// scanSessionMeta lifts a session row into the shared model and
// stamps the canonical harness key/path. The path doubles as the
// rail's deep-link handle so adapters always return the on-disk
// location they read from.
func scanSessionMeta(row scanTarget) (model.SessionMeta, error) {
	var sr sessionRow
	if err := row.Scan(
		&sr.ID, &sr.Title, &sr.ParentSessionID, &sr.MessageCount,
		&sr.PromptTokens, &sr.CompletionTokens, &sr.UpdatedAt, &sr.CreatedAt, &sr.Todos,
	); err != nil {
		return model.SessionMeta{}, err
	}
	if sr.ParentSessionID.Valid && sr.ParentSessionID.String != "" {
		// Non-null parent_session_id marks an agent-tool session.
		// The Synthesized path is the agent-tool id (messageID$$toolCallID)
		// so the rail and graph builder can find it back from the
		// parent's agent tool calls.
		agent := &model.AgentSessionMeta{
			SourceID:        sr.ParentSessionID.String,
			RootSessionID:   sr.ParentSessionID.String,
			ParentSessionID: sr.ParentSessionID.String,
		}
		// Crush's own agent-tool session id embeds both the parent
		// message id and the launching tool call id in the row's id
		// column ("messageID$$toolCallID"). Capture them so the graph
		// builder can match launches ↔ children by tool call id.
		if messageID, callID, ok := splitAgentID(sr.ID); ok {
			agent.LaunchCallID = callID
			agent.SourceID = messageID
		}
		return model.SessionMeta{
			Key:               SessionKey(sr.ID),
			ID:                sr.ID,
			Harness:           harnessName,
			Path:              sessionPath(sr.ID),
			Title:             sr.Title,
			StartedAt:         millisToRFC3339(sr.CreatedAt),
			EndedAt:           millisToRFC3339(sr.UpdatedAt),
			EventCount:        int(sr.MessageCount),
			UserTurns:         0,
			Auxiliary:         true,
			Agent:             agent,
		}, nil
	}
	return model.SessionMeta{
		Key:        SessionKey(sr.ID),
		ID:         sr.ID,
		Harness:    harnessName,
		Path:       sessionPath(sr.ID),
		Title:      sr.Title,
		StartedAt:  millisToRFC3339(sr.CreatedAt),
		EndedAt:    millisToRFC3339(sr.UpdatedAt),
		EventCount: int(sr.MessageCount),
	}, nil
}

// applySessionMeta copies the rows of scanSessionMeta that matter to
// the trace: title, started/ended timestamps, model (best-effort).
// Cwd is not part of Crush's session schema; the visualizer still
// uses trace.Session.Cwd for path normalization so we leave it empty
// and let Parse fill it from individual message rows.
func applySessionMeta(trace *model.Trace, meta model.SessionMeta) {
	if meta.Title != "" {
		trace.Session.Title = meta.Title
	}
	if meta.StartedAt != "" {
		trace.Session.StartedAt = meta.StartedAt
	}
	if meta.EndedAt != "" {
		trace.Session.EndedAt = meta.EndedAt
	}
}

// applyMessageMeta updates the trace's running cwd/model window from
// one row. Only assistant messages carry a model — every other row's
// model column is NULL — so the first non-null assignment wins.
func applyMessageMeta(trace *model.Trace, msg messageRow, ts string) {
	if msg.Model.Valid && msg.Model.String != "" && trace.Session.Model == "" {
		trace.Session.Model = msg.Model.String
	}
	if ts != "" {
		if trace.Session.StartedAt == "" {
			trace.Session.StartedAt = ts
		}
		trace.Session.EndedAt = ts
	}
}

// millisToRFC3339 renders Crush's millisecond Unix timestamps in the
// ISO-8601 UTC shape the rest of mindwalk expects. Zero or negative
// values return "" so an empty/uninitialised timestamp doesn't trip
// downstream parsers.
func millisToRFC3339(ms int64) string {
	if ms <= 0 {
		return ""
	}
	return time.UnixMilli(ms).UTC().Format(time.RFC3339Nano)
}

// sessionPath is the synthetic handle the server uses to deep-link
// into a Crush session. The actual storage lives inside the SQLite
// database; the path encodes the harness + id so adapter.Summarize
// can recover the row and the Agent Lens can route to child sessions
// via the same id format Crush uses internally.
func sessionPath(id string) string {
	return "crush://session/" + id
}

// splitSessionID takes a path produced by sessionPath (or the bare
// session id) and returns the id plus a flag for the agent-tool
// "messageID$$toolCallID" shape.
func splitSessionID(path string) (string, bool, bool) {
	if path == "" {
		return "", false, false
	}
	id := path
	if strings.HasPrefix(id, "crush://session/") {
		id = strings.TrimPrefix(id, "crush://session/")
	}
	if id == "" {
		return "", false, false
	}
	if messageID, callID, ok := splitAgentID(id); ok {
		return messageID + agentIDSeparator + callID, true, true
	}
	return id, false, true
}

// splitAgentID reports whether id looks like Crush's agent-tool
// "messageID$$toolCallID" format and returns the components when it
// does. The dollar-sign-dollar separator is unique to Crush and
// never appears in a UUID or session index, so the match is precise.
func splitAgentID(id string) (string, string, bool) {
	parts := strings.SplitN(id, agentIDSeparator, 2)
	if len(parts) != 2 || parts[0] == "" || parts[1] == "" {
		return "", "", false
	}
	return parts[0], parts[1], true
}

const agentIDSeparator = "$$"

// SessionKey produces the rail/trace key from the canonical session
// id. We re-export adapter.SessionKey with a fixed harness name so
// downstream code reads the same key the server uses in its catalog.
func SessionKey(id string) string {
	return adapter.SessionKey(harnessName, sessionPath(id))
}