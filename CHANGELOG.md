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

### Fixed

- **Crush sessions showed zero targets / all-unvisited** —
  `trace.Session.Cwd` was never set for Crush sessions, so absolute
  tool-call paths could not be relativized and fell through to
  `OutsideTouch`. `projectPathForDB` now derives the project working
  directory from the `crush.db` path (via `projects.json`, then path
  inference) and stamps `Cwd` in `Parse`, `Summarize`, and both
  `ListSessions` paths.

### Changed

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
- Go idioms modernized for 1.26: `b.Loop()`, `slices.ContainsFunc`,
  `min()`, `WaitGroup.Go`, `strings.Cut`, `maps.Copy`,
  `strings.SplitSeq`, `range int`, `new(value)`.
- All errcheck warnings resolved; LSP shows 0 project warnings.

## [0.0.0] - initial

The first public release. Supports Claude Code and Codex
session traces on a deterministic 3D code city, plus a sealed
local agent CLI judge for process evaluation.
