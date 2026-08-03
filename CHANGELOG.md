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

## [0.0.0] - initial

The first public release. Supports Claude Code and Codex
session traces on a deterministic 3D code city, plus a sealed
local agent CLI judge for process evaluation.
