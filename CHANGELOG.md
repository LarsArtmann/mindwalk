# Changelog

All notable changes to mindwalk are documented in this file. The
format is based on [Keep a Changelog](https://keepachangelog.com/),
and this project adheres to [Semantic Versioning](https://semver.org/).

## [Unreleased]

### Added

- **Crush (charmbracelet/crush) session adapter** — visualise
  Crush sessions alongside Claude Code and Codex. The adapter
  reads the SQLite-backed `crush.db`, decodes the `parts` JSON
  shape per message, and exposes each session through a
  synthetic `crush://session/<id>` deep-link handle so the
  existing server's filesystem-based code works without
  modification. Sub-agent sessions (the `agent` tool's child
  rows, whose ids are `messageID$$toolCallID`) surface on
  demand through the Agent Lens with the standard
  exact/derived/unavailable link-quality tiers.
  - `--crush-dir <path>` overrides the auto-discovered data
    directory; the default walks upward from the working dir
    looking for a `.crush/crush.db` (bounded by the git worktree
    root) and falls back to `$CRUSH_GLOBAL_DATA` /
    `$XDG_DATA_HOME/crush` / `~/.local/share/crush`.
  - `--no-crush` disables the adapter entirely.
  - `Config.CrushDir` and `Config.DisableCrush` are the
    programmatic equivalents for embedders.
  - Committed test fixture at `testdata/crush/crush.db` plus a
    full end-to-end server test
    (`TestServerLoadsCrushFixtureSession`) cover the
    sessions/trace/agents HTTP paths.
  - Per-harness parts parser coverage in
    `internal/adapter/crush/parts_test.go` (every part
    discriminator, malformed input, cross-message
    tool-call/result pairing, and `tool_call.id` collision).
  - Per-branch agent-graph coverage in
    `internal/adapter/crush/agents_test.go` (exact, unlinked,
    derived, empty catalog).
  - `docs/crush.md` documents the data-dir resolution, parts
    JSON shape, synthetic path scheme, and sub-agent id format.
  - `/api/adapters` endpoint returns harness name, session
    directory, live session count, and agent-graph capability
    for each registered adapter.
  - Benchmarks for the SQLite cold-open + parse path
    (`BenchmarkFixtureListSessions`,
    `BenchmarkFixtureParse`) catch regressions on the read path.
  - **Multi-database Crush discovery** — when no `--crush-dir` is
    set, the adapter reads Crush's `~/.local/share/crush/projects.json`
    registry and queries every project's `crush.db`, merging all
    sessions. A `sessionDBIndex` (`sync.Map`) routes each session id
    to its source database so `Parse`/`Summarize` open the right file.
  - **`--host` flag** on `serve` — bind to a specific host
    (`--host 0.0.0.0` for LAN access); defaults to `127.0.0.1`.
  - **`git diff` touch promotion** — file paths extracted from
    `diff --git a/… b/…` headers in shell-command output now register
    as weak "read" targets instead of generic "hit" mentions, so
    diffed files show as visited in the citymap.
  - **Crush as a judge CLI** — `crush` joins `claude` and `codex` in
    `SupportedCLIs`, so a session can be evaluated without installing
    a second agent. `crush run --quiet --verbose` reads the prompt
    from stdin and reports the answering model on stderr.
  - **`--host` flag on `open` and `map`** — both commands now accept
    `--host` and pass it to `server.Config`, matching `serve`.
  - **`mindwalk sessions`** — CLI subcommand that lists every
    discovered session across all adapters without starting the server.
  - **`mindwalk doctor`** — CLI subcommand that prints adapter status,
    session counts, and data-directory paths for configuration verification.
  - **Crush DB connection cache** — `Adapter.dbCache` (`*sync.Map`)
    keeps `*sql.DB` handles open across requests so a long-lived server
    does not re-open the SQLite file on every `Parse`/`Summarize` call.
  - **Agent-graph disk cache** — computed agent graphs are persisted to
    `~/.mindwalk/agent-graphs/<digest>.json` keyed by a stable digest
    (file paths + sizes + modtimes, excluding the server-local
    `freshGen` counter) so cold starts warm instantly.
  - **Schema coverage warning** — the Crush adapter warns on stderr
    when a database is missing the `model` column (pre-2025-06-27
    schema), so users know to upgrade Crush for full trace coverage.
  - **Frontend: 0-target warning** — the HUD shows a warning banner
    when a trace has events but none resolved to repository file
    targets, surfacing misconfigured adapters visually.
  - **Frontend: session Cwd in HUD** — the HUD now displays the
    adapter-resolved working directory so users can verify the root.
  - **Multi-DB discovery tests** — 11 tests in `sessions_test.go`
    covering `enumerateDBPaths`, `listAllProjectSessions`,
    `openDBForPath`, and `projectPathForDB` across single-DB and
    multi-DB (auto-discover) modes.
  - **Enriched test fixture** — `testdata/crush/crush.db` now includes
    `read`, `write`, and `bash` tool calls with `file_path` inputs,
    exercising the full event/target extraction path.
  - **`mindwalk sessions` improvements** — `--json` for machine-readable
    output, `--harness` to filter by adapter, `--limit` to cap results.
  - **`mindwalk version`** — prints the build revision, Go version, and
    module version.
  - **`mindwalk cache` subcommand** — `cache clear` removes persisted
    agent graphs; `cache status` reports file count and total size.
  - **`mindwalk doctor` diagnostics** — now reports directory readability,
    checks `projects.json` integrity, and verifies schema columns on each
    Crush database via the new `DiagnosticsSource` interface.
  - **Agent-graph disk cache eviction** — the cache auto-evicts oldest
    files when the directory exceeds 100 MB. Cache files now carry a
    version header so format changes cleanly invalidate old entries.
  - **Frontend: Cwd path truncation** — long working-directory paths in
    the HUD are shortened with ellipsis so they don't overflow the layout.
  - **Frontend: smarter 0-target warning** — distinguishes "adapter may be
    misconfigured" (file read/edit tools present but no targets) from
    "no file operations in this session" (only exec/other actions).
  - **CLI test isolation** — `cmd/mindwalk` now has a `TestMain` that
    redirects `CRUSH_GLOBAL_DATA`, `XDG_DATA_HOME`, and `MINDWALK_HOME`
    to temp dirs, preventing tests from scanning the host filesystem.
  - **CI improvements** — `go vet ./...` step, `-race` flag on tests,
    and a frontend `tsc --noEmit` typecheck step.
  - **Real-time judge progress via SSE** — the evaluation panel now
    streams step-by-step judge progress to the browser over
    Server-Sent Events (`GET /api/sessions/{key}/analyze/stream`),
    replacing the opaque 2.5s polling loop. Users see the current
    phase (rubric drafting, reuse, scoring, retry, done, error) and a
    log of completed steps as the judge runs.
  - **Crush provider, token usage, and cost** — the trace session and
    session metadata now carry `provider`, `promptTokens`,
    `completionTokens`, and `cost`, populated from the Crush
    `sessions` and `messages` tables. The session rail shows token
    counts and cost per session; the HUD shows the provider alongside
    the model.
  - **Exact read observability for Crush** — the `read_files` table is
    now queried to upgrade read tracking from `estimated` to `exact`
    for Crush sessions that have the table, with a graceful fallback
    when it is absent.
  - **Richer trace marks for Crush** — `thinking` marks (with duration
    from reasoning timestamps), `finish-reason` marks (error,
    content_filter, canceled, max_tokens), and `model-switch` marks
    (mid-session model or provider changes) are now emitted, with
    timeline glyphs and legend entries for thinking and finish-reason.
  - **Shell command (bang-mode) events for Crush** — bang-mode
    `shell_command` parts are now decoded into deduplicated bash exec
    events, skipping when an equivalent bash tool call already exists
    in the same message.
  - **Provider-executed flag** — tool calls with
    `provider_executed=true` now carry the flag on the trace event so
    the UI can distinguish server-side execution from local.
  - **Crush-specific agent link constant** — `crush-agent-id` replaces
    the misnomer codex constant in the agent graph link method enum.
  - **`schema/progress.schema.json`** — JSON Schema for the SSE `Progress`
    wire format, restoring the AGENTS.md invariant that every JSON contract
    has a committed schema.
  - **Per-message duration on marks** — `model.Mark.Duration` carries the
    wall-clock seconds from `finished_at - created_at` on thinking and
    finish-reason marks, surfaced in the Timeline tooltip. The
    `schema/trace.schema.json` and TypeScript `Mark` type include the new
    field.
  - **SSE heartbeat keep-alive** — the SSE handler now sends `: keep-alive`
    comment lines every 15 seconds during idle phases so reverse proxies
    (nginx, Cloudflare) do not drop long judge runs.
  - **Test fixture enriched** — `testdata/crush/crush.db` now carries
    non-zero `prompt_tokens`, `completion_tokens`, `cost`, and a `read_files`
    table, exercising the exact-observability and token-economics paths
    end-to-end via fixture tests.
  - **Test coverage lockdown** — new tests for `evictAgentGraphCache` (LRU
    eviction path), `crush.Adapter.Diagnostics()` (schema/data-dir checks),
    `adapter.OpenFile` (3-return contract), and `humanBytes` (B/KB/MB/GB).

### Fixed

- **Critical: `parseAdapterFlags` ignored all adapter flags** — the
  function dereferenced `*fs.String()`/`*fs.Bool()` pointers BEFORE
  `fs.Parse()` ran, capturing default values. `--no-crush`,
  `--crush-dir`, `--claude-dir`, `--codex-dir`, and `--pi-dir` were
  silently ignored by `sessions` and `doctor` (and would have been
  ignored by `serve`/`open`/`map` after the flag consolidation).
  Now uses `fs.StringVar`/`fs.BoolVar` writing directly into struct
  fields, returning `*adapterFlags` so callers see post-Parse values.
- **`worktreeRootCache` race condition** — changed from unprotected
  `map[string]string` to `sync.Map` with `Load`/`Store`.
- **`warnIfOldSchema` `QueryRow` misuse** — `QueryRow` returns a single
  `*Row` but the code looped as if it were `*Rows`. Changed to
  `QueryContext` + `rows.Next()`. Now also checks `provider` and
  `parent_session_id` columns (was only `model`), with per-DB
  deduplication via `sync.Map`.
- **CLI commands leaked database connections** — `listSessions` and
  `doctor` now call `closeSources()` via `defer` to release cached
  `*sql.DB` handles after scanning.
- **`mindwalk analyze` mangled `crush://` session paths** —
  `filepath.Abs` collapsed the `crush://session/<id>` URI into a
  filesystem path, making the crush judge unreachable from the CLI.
  Non-filesystem paths are now passed through untouched.
- **HUD showed false "cwd may not match repository" warning** —
  provider-executed tool calls (server-side reads/edits) have no local
  file targets but were counted as "file actions", triggering the
  misconfigured-adapter warning. The predicate now excludes
  `providerExecuted` events.
- **Timeline legend missing `model-switch` glyph** — the legend
  hardcoded five mark types but the CSS class and `MARK_LABEL` entry for
  `model-switch` already existed. The sixth glyph is now rendered.
- **`mindwalk cache clear` ignored reports** — only `agent-graphs/`
  was cleared; `~/.mindwalk/reports/` was left behind. Both directories
  are now cleared and reported in `cache status`.
- **`humanBytes` capped at MB** — a 1.5 GB cache showed "1500.0 MB".
  Added a GB branch to the switch.
- **`gitDiffPaths` failed on paths with spaces** — git quotes paths
  containing spaces (`diff --git "a/foo bar.go" "b/foo bar.go"`); the
  regex only matched unquoted form. Also added `+++`/`---` fallback for
  headerless diffs and hunk line-range extraction (`@@ -o,n +s,n @@`)
  into `Target.Lines`.

- **Crush sessions showed zero targets / all-unvisited** —
  `trace.Session.Cwd` was never set for Crush sessions, so absolute
  tool-call paths could not be relativized and fell through to
  `OutsideTouch`. `projectPathForDB` now derives the project working
  directory from the `crush.db` path (via `projects.json`, then path
  inference) and stamps `Cwd` in `Parse`, `Summarize`, and both
  `ListSessions` paths.
- **Old Crush databases crashed on `cost`/`finished_at` queries** —
  the `listSessionsQuery`, `sessionByIDQuery`, and
  `messagesBySessionQuery` unconditionally selected columns that
  older Crush databases do not have, causing `SQL logic error: no
such column`. Dynamic `build*Query()` functions now probe the schema
  once per database handle and substitute `0 AS cost` / `0 AS
finished_at` when the columns are absent.
- **All Crush sessions appeared at the Unix epoch (1970)** — Crush
  stores `created_at`, `updated_at`, and message timestamps as
  second-precision Unix values, but the adapter treated them as
  milliseconds (`3f547fc`). A value like `1781655007` (June 2026 in
  seconds) was passed to `time.UnixMilli`, producing `1970-01-21`.
  Renamed `millisToRFC3339` → `secondsToRFC3339` (`time.Unix(s, 0)`)
  and removed the erroneous `/ 1000` division from two message-duration
  calculations. The Crush migration comment says "milliseconds" but the
  `strftime('%s', 'now')` trigger writes seconds — the adapter now
  trusts the data.

### Changed

- **Crush old-schema warnings are now batched** — when the adapter
  auto-discovers many project databases, all old-schema notices are
  collapsed into a single summary line (with a count and a few example
  paths) instead of one line per database.
- `adapter.ToolResult` now carries a `ToolCallID` field, letting
  the cross-message tool-call/result pairing happen at the type
  level instead of through a fragile parallel-slice
  (`finishResult.resultIDs`) that the consumer had to index in
  lockstep.
- `fingerprintAgentGraphInputs` now guards `crush://` synthetic
  paths so the agent-graph fingerprint records the session id
  instead of always marking it "missing" (which could serve a
  stale graph indefinitely).
- `loadTraceAndMap` no longer falls through to
  `filepath.Dir(meta.Path)` when the path is a `crush://`
  synthetic handle, preventing a garbage repo-root from
  polluting the citymap.
- **`ComputeStats` signature gains `readsSignal`** — the reads
  observability grade is now threaded in as an explicit parameter
  (mirroring the existing `errorSignal`), eliminating the fragile
  post-hoc override in the Crush adapter. Adapters that do not supply
  a signal pass `""` and get the previous weak-target-derived
  behaviour.
- **`gitDiffPaths` renamed to `gitDiffTargets`** — returns
  `[]diffTarget` (path + hunk line ranges) instead of `[]string`, so
  diff-extracted targets carry precise `Target.Lines` from `@@` hunk
  headers. The line ranges flow through to the Inspector.
- **`evictAgentGraphCache` refactored** — the size cap is now a
  parameter (`evictAgentGraphCacheN`) so tests exercise eviction with a
  small threshold instead of writing 100 MB of fixture files.
- `model.SessionMeta.Path` comment now mentions the synthetic
  `crush://session/<id>` URI so future contributors don't trip
  over the silent contract.
- `crush://session/<id>` is now a single constant in the
  adapter package; all four server call sites
  (`sourceUsesFilesystem`, `fingerprintPath`,
  `fingerprintAgentGraphInputs`, `loadTraceAndMap`) call
  `crush.IsSessionPath` instead of hardcoding the prefix.
- `sessionDBIndex` is now a per-Adapter `dbIndex *sync.Map` field
  instead of a package global, isolating test state and enabling
  concurrent adapter instances. `NewAdapter(dir)` is the constructor;
  `crushAdapter()` in `server.go` uses it.
- `fingerprintAgentGraphInputs` digest no longer includes `freshGen`
  in the hash material; `freshGen` remains a separate field for
  in-memory cache invalidation. This allows the disk cache to reuse
  graphs across server restarts.
- CI workflow bumped from Go 1.25 to Go 1.26.5 to match `go.mod`.
- `projectPathCache`/`projectPathInit` globals moved to per-Adapter
  `projectPathStore` struct (`Adapter.projects`), following the
  `dbIndex`/`dbCache` pattern. Zero-value `Adapter{}` falls back to
  path inference only.
- `serve`, `open`, and `map` consolidated via `bindServeFlags` and
  `openSingle` helpers, eliminating inline flag duplication.
- Shared adapter helpers extracted: `adapter.HomePath`, `adapter.ReadableDir`,
  `adapter.OpenFile`, `adapter.NotRecognizedErr` — used by claudecode,
  codex, and pi adapters to remove duplicated `os.UserHomeDir`/`os.Stat`
  patterns.
- `agentLaunch` struct promoted to `adapter.AgentLaunch` (shared between
  codex and crush), eliminating type duplication.
- Go idioms modernized for 1.26: `b.Loop()`, `slices.ContainsFunc`,
  `min()`, `WaitGroup.Go`, `strings.Cut`, `maps.Copy`,
  `strings.SplitSeq`, `range int`, `new(value)`.
- All errcheck warnings resolved; LSP shows 0 project warnings.

## [0.0.0] - initial

The first public release. Supports Claude Code and Codex
session traces on a deterministic 3D code city, plus a sealed
local agent CLI judge for process evaluation.
