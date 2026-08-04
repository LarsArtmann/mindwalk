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

| Task                                                                               | Status    | Impact | Effort | Evidence                                                                                                                                                                           |
| ---------------------------------------------------------------------------------- | --------- | ------ | ------ | ---------------------------------------------------------------------------------------------------------------------------------------------------------------------------------- |
| Add the **current-event summary card** to the playback UI (T1 of the UI/UX sprint) | 🔴 `TODO` | High   | 45min  | Closes the core feedback loop; `TraceEvent.tool/action/summary` exist but are unsurfaced. Plan: `docs/planning/2026-08-04_09-46_SUPERB-ui-ux-sprint.md`                            |
| Fix `queryReadFiles` missing `rows.Err()` check                                    | 🔴 `TODO` | High   | 10min  | `internal/adapter/crush/sessions.go:920` — `rows.Next()` loop with no final `rows.Err()`; gopls `sqlrowserr` warning. Partial SQLite results could be silently swallowed.          |
| Add `TestTimestampsAreSecondsNotMillis` regression test                            | 🔴 `TODO` | High   | 15min  | Guards `3f547fc`; no named test asserts a known second value yields a `2026-` date instead of `1970-`. `docs/status/2026-08-04_09-36_crush-timestamp-seconds-not-millis.md` (c.1). |

## Medium Impact

| Task                                                                                     | Status    | Impact | Effort | Evidence                                                                                                                                                                                        |
| ---------------------------------------------------------------------------------------- | --------- | ------ | ------ | ----------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------- |
| Add a **schema-validation test** (Go types marshal to checked-in `schema/*.schema.json`) | 🔴 `TODO` | Med    | 1h     | Documented AGENTS.md invariant ("update schema … in the same change") with zero enforcement. `schema/` has 5 files. `docs/status/2026-08-04_05-14_testing-audit-self-review.md` (f.5).          |
| Add tests for `cmd/rubriceval` (0.0% coverage)                                           | 🔴 `TODO` | Med    | 2h     | `cmd/rubriceval/main.go` — 260 lines, concurrent logic, no `_test.go`. `docs/status/2026-08-04_05-14_testing-audit-self-review.md` (f.1).                                                       |
| Write a **fixture builder script** for `testdata/crush/crush.db`                         | 🔴 `TODO` | Med    | 1h     | The fixture is a black box modified by hand via SQL; no regeneration script committed. Multiple reports flag this.                                                                              |
| Remove dead `finishData.Time` field (or wire it)                                         | 🔴 `TODO` | Med    | 10min  | `internal/adapter/crush/parts.go:62` — decoded from JSON but never read. `docs/status/2026-08-04_09-36_crush-timestamp-seconds-not-millis.md` (e.5).                                            |
| Add a defensive comment at `secondsToRFC3339` explaining the Crush schema lie            | 🔴 `TODO` | Med    | 5min   | `internal/adapter/crush/sessions.go:899` — Crush's migration comment says "milliseconds" but the trigger writes seconds. A future maintainer could "fix" it back.                               |
| Set up **Vitest** frontend unit-test infrastructure                                      | 🔴 `TODO` | Med    | 2h     | `web/` has zero unit tests and no runner (`package.json` has only `test:e2e`). Prerequisite for all frontend test coverage. `docs/status/2026-08-04_05-14_testing-audit-self-review.md` (f.11). |

## Low Impact

| Task                                                                  | Status    | Impact | Effort | Evidence                                                                                                                            |
| --------------------------------------------------------------------- | --------- | ------ | ------ | ----------------------------------------------------------------------------------------------------------------------------------- |
| Handle `writeSSE` unchecked `fmt.Fprintf` errors                      | 🔴 `TODO` | Low    | 15min  | `internal/server/sse.go:128` — a broken pipe mid-judge-run would silently spin. Low severity (ResponseWriter).                      |
| Make `gitDiffTargets` track `hasDiffGit` per-file instead of globally | 🔴 `TODO` | Low    | 20min  | `internal/adapter/adapter.go:1021` — a single boolean disables the `+++` fallback for all files. Mixed diffs lose headerless files. |
| Add `DiagnosticsSource` to claudecode/codex/pi adapters               | 🔴 `TODO` | Low    | 1h     | Only crush implements `Diagnostics()` (`internal/adapter/crush/diagnostics.go:21`). Other adapters report nothing to `doctor`.      |
| Add `golangci-lint` / `staticcheck` to CI                             | 🔴 `TODO` | Low    | 30min  | `.github/workflows/ci.yml` runs only `go vet`. Multiple reports flag this.                                                          |

---

## Notes

- The **UI/UX sprint** (`docs/planning/2026-08-04_09-46_SUPERB-ui-ux-sprint.md`) holds 27 ranked frontend tasks; only the #1 item (event summary card) is pulled into High Impact above. The remaining waves live in the plan until they become active.
- **Stress test with a 100k-message Crush session** lives in [ROADMAP.md](ROADMAP.md) (unbounded investigation, not a bounded task).
- Open questions that block decisions are in [ROADMAP.md](ROADMAP.md#open-questions).
- Completed work is recorded in [CHANGELOG.md](CHANGELOG.md), never here.
