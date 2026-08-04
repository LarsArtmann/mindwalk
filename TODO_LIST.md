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

## Blocked

| Task                                                        | Status    | Impact | Effort | Evidence                                                                                                                                                                |
| ----------------------------------------------------------- | --------- | ------ | ------ | ----------------------------------------------------------------------------------------------------------------------------------------------------------------------- |
| Set up Vitest frontend unit-test infrastructure             | 🔵 `BLOCKED` | Med  | 2h     | `web/` has zero unit tests and no runner. npm not available in current environment. Install vitest + @testing-library/react + jsdom when npm is available.               |
| Write `filters.ts` + `treeLayout.ts` unit tests             | 🔵 `BLOCKED` | Low  | 1h     | Depends on Vitest setup. Two pure-logic modules with zero coverage.                                                                                                      |
| Guided tour system (T16)                                    | 🔵 `BLOCKED` | Low  | 1h30m  | `CheatSheet.tsx:6` has an `onReplayTour` stub; `GuidedTour.tsx` does not exist yet. Requires frontend build to test.                                                      |

## Low Impact

| Task                                                                  | Status    | Impact | Effort | Evidence                                                                                                                            |
| --------------------------------------------------------------------- | --------- | ------ | ------ | ----------------------------------------------------------------------------------------------------------------------------------- |
| SSE frontend deduplication on reconnect                               | 🔴 `TODO` | Low    | 30min  | Server now emits `id:` lines and honors `Last-Event-ID`, but `App.tsx:568` still blindly appends. Frontend dedup needed.            |

---

## Notes

- **SUPERB Sprint completed.** All Go-side tasks from the plan at `docs/planning/2026-08-04_10-22_SUPERB-close-every-gap-sprint.md` are done. The 3 remaining items are blocked on npm availability.
- Completed work is recorded in [CHANGELOG.md](CHANGELOG.md), never here.
