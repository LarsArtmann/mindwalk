# TODO List

> Short-term, actionable, bounded work items for the mindwalk fork
> (`LarsArtmann/mindwalk`). Every item is verified against the actual code,
> not assumed from a status report. For long-term vision and raw ideas, see
> [ROADMAP.md](ROADMAP.md). When an item ships, remove it here and log it in
> [CHANGELOG.md](CHANGELOG.md).

## Status legend

| Status           | Meaning                                                     |
| ---------------- | ----------------------------------------------------------- |
| 🔴 `TODO`        | Not started. Needs doing.                                   |
| 🟡 `IN_PROGRESS` | Actively being worked on.                                   |
| 🔵 `BLOCKED`     | Cannot proceed; external dependency or decision needed.     |
| 🟢 `DONE`        | Completed. Remove from this list and log in `CHANGELOG.md`. |

## High Impact

| Task                                                                | Status    | Impact | Effort | Evidence                                                                                                                                 |
| ------------------------------------------------------------------- | --------- | ------ | ------ | ---------------------------------------------------------------------------------------------------------------------------------------- |
| Fix `agents.go` multi-DB routing                                    | 🟢 `DONE` | High   | 30min  | `agents.go` now uses `enumerateDBPaths()` / `openDBForPath()` instead of single-DB `openReadOnly()`                                      |
| Commit the uncommitted judge-CLI docs (AGENTS.md + ReportPanel.tsx) | 🟢 `DONE` | High   | 5min   | already committed in `c9fe352` (working tree was clean)                                                                                  |
| Add regression tests for the two round-2 server bugs                | 🟢 `DONE` | High   | 40min  | `TestFingerprintAgentGraphInputsHandlesSyntheticCrushPaths` + `TestLoadTraceAndMapDoesNotGarbageRootCrushPaths`                          |
| Fix server test isolation                                           | 🟢 `DONE` | High   | 45min  | `go test ./internal/server/` 79s → 0.28s; `TestMain` redirects `CRUSH_GLOBAL_DATA`/`XDG_DATA_HOME`; analyze tests now set `DisableCrush` |

## Medium Impact

| Task                                                  | Status    | Impact | Effort | Evidence                                                                                                                                                                      |
| ----------------------------------------------------- | --------- | ------ | ------ | ----------------------------------------------------------------------------------------------------------------------------------------------------------------------------- |
| Add tests for multi-DB discovery                      | 🟢 `DONE` | Med    | 1h     | `sessions_test.go`: 11 tests covering `enumerateDBPaths`, `listAllProjectSessions`, `openDBForPath`, `projectPathForDB`                                                       |
| Verify the web UI renders Crush sessions in a browser | 🟢 `DONE` | Med    | 30min  | API endpoints verified: sessions, trace (4 events), agent graph all return correct data; frontend HTML loads; browser-level visual verification deferred (requires GPU/WebGL) |
| Add `--host` flag to `open` and `map` commands        | 🟢 `DONE` | Med    | 15min  | both commands now accept `--host` and pass it to `server.Config`                                                                                                              |
| Enrich the test fixture with file-touching tool calls | 🟢 `DONE` | Med    | 30min  | `testdata/crush/crush.db` now has read, write, and bash tool calls with file_path inputs; `TestFixtureFileTouchingEventsHaveTargets` verifies extraction                      |
| Fix errcheck warnings                                 | 🟢 `DONE` | Med    | 30min  | all errcheck findings resolved; `go vet` clean, LSP shows 0 warnings                                                                                                          |
| Modernize Go idioms                                   | 🟢 `DONE` | Med    | 30min  | `b.Loop()`, `slices.ContainsFunc`, `min()`, `strings.Cut`, `WaitGroup.Go`, `maps.Copy`, `strings.SplitSeq`, `range int`, `new(value)`                                         |
| Cache `crush.db` reads across requests                | 🟢 `DONE` | Med    | 45min  | `dbCache *sync.Map` on `Adapter`; `openCached()` reuses `*sql.DB` handles; `sqlHandle.cached` prevents premature close                                                        |

## Low Impact

| Task                                                                 | Status    | Impact | Effort | Evidence                                                                                                                                     |
| -------------------------------------------------------------------- | --------- | ------ | ------ | -------------------------------------------------------------------------------------------------------------------------------------------- |
| Persist the agent-graph cache to disk                                | 🟢 `DONE` | Low    | 90min  | `~/.mindwalk/agent-graphs/<digest>.json`; `loadAgentGraphFromDisk`/`storeAgentGraphToDisk`; digest excludes `freshGen` for restart stability |
| `mindwalk doctor` subcommand                                         | 🟢 `DONE` | Low    | 90min  | prints adapter status, session counts, data-dir paths; `doctor()` in `main.go`                                                               |
| `mindwalk sessions` CLI subcommand                                   | 🟢 `DONE` | Low    | 45min  | lists all sessions across adapters without starting the server; `listSessions()` in `main.go`                                                |
| Add CI workflow                                                      | 🟢 `DONE` | Low    | 30min  | `.github/workflows/ci.yml` runs `go test ./...` + embedded frontend verification on every push; bumped to Go 1.26.5                          |
| Schema coverage warning at startup                                   | 🟢 `DONE` | Low    | 30min  | `warnIfOldSchema()` checks for `model` column via `pragma_table_info`; warns when Crush DB predates the 2025-06-27 migration                 |
| Make `sessionDBIndex` a field on `Adapter`                           | 🟢 `DONE` | Low    | 30min  | `dbIndex *sync.Map` field on `Adapter`; `NewAdapter(dir)` constructor; `crushAdapter()` wired in server.go                                   |
| Frontend: warn when a trace loads with 0 targets but non-zero events | 🟢 `DONE` | Low    | 30min  | `showNoTargetsWarning` computed in `Hud.tsx`; `.hud-warning` CSS banner displayed when events exist but none have targets                    |
| Show session Cwd in the HUD/inspector                                | 🟢 `DONE` | Low    | 30min  | `trace.session.cwd` displayed in `hud-commit` section with tooltip; Inspector is file-level so HUD is the session-level view                 |
| Mention `--host 0.0.0.0` in README Quick Start                       | 🟢 `DONE` | Low    | 10min  | README Quick Start documents `--host 0.0.0.0` for LAN access                                                                                 |

---

## Notes

- **Stress test with a 100k-message Crush session** lives in [ROADMAP.md](ROADMAP.md)
  (unbounded investigation, not a bounded task).
- Open questions that block decisions are in [ROADMAP.md](ROADMAP.md#open-questions).
- Completed work is recorded in [CHANGELOG.md](CHANGELOG.md), never here.
