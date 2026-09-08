# Crush session adapter

This document explains how mindwalk reads [charmbracelet/crush](https://github.com/charmbracelet/crush)
sessions. It complements `AGENTS.md`, which mentions Crush support
in the high-level architecture, by documenting the data-dir
resolution, the parts JSON shape, the synthetic session path
scheme, and the agent-tool sub-agent id format.

## Data directory resolution

The adapter resolves a Crush data directory in this order:

1. **Explicit override** — `--crush-dir <path>` on the CLI, or
   `Config.CrushDir`. When set, the directory is used verbatim and
   no auto-discovery runs.
2. **Project-local `.crush/`** — walks upward from
   `Config.WorkingDir` (default `os.Getwd()`) looking for a
   directory named `.crush` that contains a `crush.db` file. The
   walk stops at the git worktree root so a vendored fixture
   inside a subdirectory cannot bleed into a parent project.
3. **Global Crush data dir** — `CRUSH_GLOBAL_DATA` when set,
   otherwise `$XDG_DATA_HOME/crush` (Unix) or
   `%LOCALAPPDATA%\crush` (Windows), otherwise
   `~/.local/share/crush`.

When the resolved directory is missing, the adapter returns an
empty catalog rather than an error. The presence of a
`crush.db`-less `.crush` directory is also a miss — only the
file-backed variant is recognised.

The read-only open path is `mode=ro&_txlock=immediate` via
`modernc.org/sqlite` (pure Go, no cgo). Crush's own open path runs
migrations and acquires a process-wide advisory lock; mindwalk
intentionally bypasses both because it only reads.

## Multi-database discovery

When no `--crush-dir` is set, the adapter does not stop at a single
directory. Instead it reads Crush's `~/.local/share/crush/projects.json`
registry — a JSON file mapping project paths to their database locations —
and queries **every** project's `crush.db`, merging all sessions into one
unified catalog. This is the default mode when `mindwalk serve` runs without
adapter flags.

Key internals:

- **`enumerateDBPaths()`** (`sessions.go`) walks `projects.json` and returns
  every known database path. It also includes the global `crush.db` if
  present.
- **`sessionDBIndex`** (a per-Adapter `sync.Map`) routes each session id to
  its source database so `Parse`/`Summarize` open the correct file. Without
  this index, a session id alone would not tell the adapter which project
  database to read.
- **`openDBForPath()`** opens the right database in read-only mode, using the
  index for routing.
- **`projectPathForDB()`** derives the project working directory from the
  database path (via `projects.json`, then path inference) and stamps
  `trace.Session.Cwd` so absolute tool-call paths relativize correctly.
- The server's `scanSessions` short-circuits the directory walk for adapters
  whose paths are not real files.
- `fingerprintPath` synthesises a stable zero fingerprint for `crush://`
  paths so the trace cache still works.

The `doctor` command runs deeper health checks via the `DiagnosticsSource`
interface: data-dir readability, `projects.json` validity, and schema column
coverage across all discovered databases.

Old-schema warnings are batched across databases: when multiple project DBs
are missing expected columns, all notices collapse into a single summary
line instead of one per database.

## Synthetic session path

Sessions don't live on the filesystem — they live as rows in
`crush.db`. To make the existing server code (which is built around
file paths) work without a rewrite, the adapter hands the server
a synthetic URI:

```text
crush://session/<id>
```

`<id>` is the session's primary key in the `sessions` table. For
agent-tool sub-agents, `<id>` is the literal `messageID$$toolCallID`
format Crush uses upstream (see [Sub-agent session
ids](#sub-agent-session-ids)).

The scheme is a single constant, `sessionPathScheme`, in the
adapter package. Three helpers wrap the scheme:

- `crush.SessionPath(id string) string` — produces the synthetic path.
- `crush.IsSessionPath(path string) bool` — predicate.
- `crush.SessionIDFromPath(path string) string` — extracts the id.

Both server call sites (`sourceUsesFilesystem` and
`fingerprintPath`) use `crush.IsSessionPath` so a future rename is
one line.

The `model.SessionMeta.Path` field comment documents that the
field is a deep-link handle that may be a real filesystem path or
a synthetic URI like `crush://session/<id>`.

## Parts JSON shape

Every message has a `parts` column with a JSON array of part
objects. Each part has a `type` discriminator and a `data` payload.
The supported discriminators are:

| type            | data shape                                                                  | effect on the trace                                                                                                 |
| --------------- | --------------------------------------------------------------------------- | ------------------------------------------------------------------------------------------------------------------- |
| `text`          | `{"text": "..."}`                                                           | Concatenated into the message body, used for `user-message` mark when paired with `finish/stop`.                    |
| `reasoning`     | `{"thinking": "..."}`                                                       | Decoded for schema coverage; dropped from the trace.                                                                |
| `tool_call`     | `{"id": "...", "name": "...", "input": "...", "finished": true, ...}`       | Emitted as a `model.Event`. Inputs are JSON-decoded; a string-of-JSON input is peeled recursively.                  |
| `tool_result`   | `{"tool_call_id": "...", "name": "...", "content": "...", "is_error": ...}` | Paired with the originating `tool_call` by `tool_call_id`. An orphan result (no matching call in scope) is dropped. |
| `finish`        | `{"reason": "stop\|length\|tool_use\|safety\|...", "time": ...}`            | When `reason == "stop"` on a user message, records `userFinish` so `Parse` emits a `user-message` mark.             |
| `shell_command` | `{"command": "...", "output": "...", "exit_code": 0}`                       | Decoded for schema coverage; dropped from the trace (the parallel `bash` tool call drives replay).                  |
| `image_url`     | `{"url": "data:image/png;base64,..."}`                                      | Decoded for schema coverage; dropped from the trace.                                                                |
| `binary`        | `{"data": "...", "mime_type": "..."}`                                       | Decoded for schema coverage; dropped from the trace.                                                                |
| _other_         | _any_                                                                       | Silently ignored. A future Crush schema bump never crashes an older mindwalk binary.                                |

The parts parser accumulates tool calls and their results across
messages, so a `tool_call` in message A is correctly paired with
its `tool_result` in message B (real Crush databases routinely
split them this way). The parallel `resultIDs` slice in
`finishResult` preserves the originating `tool_call_id` of each
result so the agent graph reader can pair them across messages.

When two `tool_call` parts share the same `id`, the most recent
call's input wins (it represents the authoritative "what the
agent finally asked for" after any cursor replays). The result
is attached to the merged event.

## Sub-agent session ids

Crush's `agent` tool spawns a child session whose id is the
parent message id joined with the launching tool call id via
`$$`:

```text
<parentMessageID>$$<launchingToolCallID>
```

This is the upstream `internal/session/session.go` format. The
adapter's `splitAgentID` parses the two halves and the
`parseAgentIDToAgentGraph` lookup matches the launching tool
call's result (which carries an `agent_id` field) to the child
row in the database.

The child row's `parent_session_id` column points at the parent
session id. The synthetic session path for a child therefore
looks like:

```text
crush://session/<parentMessageID>$$<launchingToolCallID>
```

Child sessions are hidden from the rail (the catalog returned by
`ListSessions` filters them out via `WHERE parent_session_id IS
NULL`), but the agent graph builder surfaces them on demand via
`BuildAgentGraph`.

Older Crush releases used a different `title-<sessionID>` id
format for the same purpose. The adapter does not currently
recognise that shape; if your installation produces such ids, the
child will surface as an unlinked launch in the agent graph
rather than as a fully-traced child.

## Agent graph link quality

`BuildAgentGraph` produces a `model.AgentGraph` whose nodes are
tagged with a `LinkQuality` field. Crush supports all three:

- **exact** — the `agent` tool result carried an `agent_id` that
  matches a child row, the child's primary key matches
  `<parentMessageID>$$<launchingToolCallID>`, and the child's
  trace is available. The node gets `TraceAvailability=available`.
- **derived** — a child row exists in the catalog but the root
  session's messages did not record a matching launch. Almost
  always means the spawn happened before the cursor was saved.
  The node gets `TraceAvailability=available`.
- **unavailable** — the launch was recorded but the result was
  not the expected JSON shape with an `agent_id` field, or the
  result is missing. The node gets
  `TraceAvailability=missing` and `Status=failed` if the result
  is present but not valid JSON.

## Test fixture

`testdata/crush/crush.db` is a tiny committed SQLite database
that drives the Crush end-to-end tests. It contains:

- One root session (`fixture-root`) with ten messages across two user turns:
  user prompts with `finish/stop`, assistant turns with `agent`/`read`/`write`/`bash`
  tool calls, matching tool results, and non-zero token/cost values.
- One sub-agent session (`m_assistant_1$$call_agent_1`) whose
  `parent_session_id` is the root.
- A `read_files` table so the exact-read observability path is exercised.

The fixture is regenerated via a builder script:

```bash
go run testdata/crush/build.go
```

The builder (`testdata/crush/build.go`, `//go:build ignore` tag) recreates
the database from scratch with the schema, sessions, messages, and
`read_files` rows. Timestamps are Unix **seconds** (not milliseconds) —
consistent with the adapter's `secondsToRFC3339` decoder (`3f547fc`).

After regenerating, verify the fixture tests still pass:

```bash
go test ./internal/adapter/crush/... ./internal/server/...
```

## Disabling the adapter

`--no-crush` (or `Config.DisableCrush: true`) skips registering
the Crush adapter entirely. Useful for projects where the
`.crush` directory does not belong to the user (e.g. vendored
test fixtures) or for users who never want the Crush scan to
run.

## Schema drift detection

A future schema bump that introduces new part discriminators
will not crash an older mindwalk binary — unknown part types are
silently dropped. A future schema bump that renames a column
the adapter reads (id, title, parent_session_id, message_count,
prompt_tokens, completion_tokens, updated_at, created_at,
todos) will surface a SQLite error at the first query. The
adapter wraps every open with a path-qualified error message
so a user can see exactly which file failed to open.
