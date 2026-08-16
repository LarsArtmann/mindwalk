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

| Task              | Status       | Impact | Effort | Evidence                                                                                                                                       |
| ----------------- | ------------ | ------ | ------ | ---------------------------------------------------------------------------------------------------------------------------------------------- |
| Guided tour (T16) | 🔵 `BLOCKED` | Low    | 1h30m  | `CheatSheet.tsx:6` has an `onReplayTour` stub; `GuidedTour.tsx` does not exist yet. Requires frontend development iteration to build and test. |

## Medium Impact

| Task                                        | Status    | Impact | Effort | Evidence                                                                                                                     |
| ------------------------------------------- | --------- | ------ | ------ | ---------------------------------------------------------------------------------------------------------------------------- |
| Adopt `DB.IterMessages` for huge sessions   | 🔴 `TODO` | Medium | 30min  | go-crush-data v0.3.0 ships `IterMessages`; `internal/adapter/crush/sessions.go` materializes one slice per session (memory peak). |
| `DecodeTodos` spike → UI todo state         | 🔴 `TODO` | Low    | 30min  | go-crush-data v0.3.0 ships `DecodeTodos`; mindwalk never surfaces todo state. Spike only — needs a UI home first.               |
| Fix `testdata/crush/crush.db` old schema    | 🔴 `TODO` | Medium | 15min  | Fixture predates the SDK: missing `parent_session_id` column, emits warning during crush adapter tests.                          |

> Post-merge recovery batch (OutcomeKnown gap, sdk→master merge, lint/nix/frontend
> verification, merge checklist, parity test, and more — 31 tasks): see the Pareto
> plan at `docs/planning/2026-08-16_09-03_pareto-plan-post-merge-v0.3.0.html`.

## Low Impact

| Task                                    | Status    | Impact | Effort | Evidence                                                                                                                 |
| --------------------------------------- | --------- | ------ | ------ | ------------------------------------------------------------------------------------------------------------------------ |
| SSE frontend deduplication on reconnect | 🔴 `TODO` | Low    | 30min  | Server now emits `id:` lines and honors `Last-Event-ID`, but `App.tsx:568` still blindly appends. Frontend dedup needed. |

---

## Notes

- **SUPERB Sprint completed.** All 20 of 21 tasks from the plan at `docs/planning/2026-08-04_10-22_SUPERB-close-every-gap-sprint.md` are done (M11 guided tour remains blocked on design work). Frontend unit-test infrastructure (Vitest + jsdom) is live with 44 tests across 3 suites, wired into CI.
- Completed work is recorded in [CHANGELOG.md](CHANGELOG.md), never here.
