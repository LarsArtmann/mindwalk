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

| Task                                                  | Status    | Impact | Effort | Evidence                                                                                         |
| ----------------------------------------------------- | --------- | ------ | ------ | ------------------------------------------------------------------------------------------------ |
| Add tests for multi-DB discovery                      | 🔴 `TODO` | Med    | 1h     | `loadProjectDBs`, `listAllProjectSessions`, `openDBForPath`, `projectPathForDB` — 0 coverage     |
| Verify the web UI renders Crush sessions in a browser | 🔴 `TODO` | Med    | 30min  | API verified; 3D citymap / HUD / agent-graph never visually confirmed                            |
| Add `--host` flag to `open` and `map` commands        | 🟢 `DONE` | Med    | 15min  | both commands now accept `--host` and pass it to `server.Config`                                 |
| Enrich the test fixture with file-touching tool calls | 🔴 `TODO` | Med    | 30min  | `testdata/crush/crush.db` has only an `agent` call; cannot exercise path normalization           |
| Fix errcheck warnings                                 | 🔴 `TODO` | Med    | 30min  | crush `sessions.go` (3), crush `adapter_test.go` (2), citymap `builder.go` (2), `adapter.go:848` |
| Modernize Go idioms                                   | 🔴 `TODO` | Med    | 30min  | `b.Loop()`, `slices.Contains` (`sessions.go:57`), `min()`, `strings.Cut`, `WaitGroup.Go`         |
| Cache `crush.db` reads across requests                | 🔴 `TODO` | Med    | 45min  | a long-lived server re-opens the DB per call                                                     |

## Low Impact

| Task                                                                 | Status    | Impact | Effort | Evidence                                                  |
| -------------------------------------------------------------------- | --------- | ------ | ------ | --------------------------------------------------------- |
| Persist the agent-graph cache to disk                                | 🔴 `TODO` | Low    | 90min  | keyed by `(session_key, fingerprint)` so cold starts warm |
| `mindwalk doctor` subcommand                                         | 🔴 `TODO` | Low    | 90min  | print adapter status, session counts, data-dir paths      |
| `mindwalk sessions` CLI subcommand                                   | 🔴 `TODO` | Low    | 45min  | print the rail without starting the server                |
| Add CI workflow                                                      | 🔴 `TODO` | Low    | 30min  | run `go test ./...` on every push                         |
| Schema coverage warning at startup                                   | 🔴 `TODO` | Low    | 30min  | warn if Crush DB predates the read-files migration        |
| Make `sessionDBIndex` a field on `Adapter`                           | 🔴 `TODO` | Low    | 30min  | package global `sync.Map` shares test state               |
| Frontend: warn when a trace loads with 0 targets but non-zero events | 🔴 `TODO` | Low    | 30min  | surfaces misconfigured adapters in the UI                 |
| Show session Cwd in the HUD/inspector                                | 🔴 `TODO` | Low    | 30min  | lets users verify the adapter resolved the right root     |
| Mention `--host 0.0.0.0` in README Quick Start                       | 🔴 `TODO` | Low    | 10min  | LAN access is undocumented in README                      |

---

## Notes

- **Stress test with a 100k-message Crush session** lives in [ROADMAP.md](ROADMAP.md)
  (unbounded investigation, not a bounded task).
- Open questions that block decisions are in [ROADMAP.md](ROADMAP.md#open-questions).
- Completed work is recorded in [CHANGELOG.md](CHANGELOG.md), never here.
