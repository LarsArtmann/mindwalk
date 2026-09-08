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

## Medium Impact

| Task                       | Status       | Impact | Effort | Evidence                                                                                                                                                                                                         |
| -------------------------- | ------------ | ------ | ------ | ---------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------- |
| Upstream-PR decision (T24) | 🔵 `BLOCKED` | Medium | n/a    | T06+T07 (OutcomeKnown + cross-message pairing) are upstream-applicable and self-contained; T12 (s.mu order) and the crush adapter itself are fork-only. User must choose before any push to `cosmtrek/mindwalk`. |

> Post-merge recovery batch (OutcomeKnown gap, sdk→master merge, lint/nix/frontend
> verification, merge checklist, parity test, and more — 31 tasks): see the Pareto
> plan at `docs/planning/2026-08-16_09-03_pareto-plan-post-merge-v0.3.0.html`. Tier 0
> through Tier 2 (T01–T24) executed 2026-08-16; commits `c2b9149`, `27371dc`,
> `73444b1`, `ac5d8cc`, `4d28736`, `2f6919b`, `e7f2fb9`, `66f68c7`, `271d128`,
> `fb72b87`. Backlog (T25–T32): T29 (`DecodeTodos` spike) shipped;
> the rest stay parked in the plan.

## Low Impact

| Task                                        | Status   | Impact | Effort | Evidence                                                                                                                                                                                   |
| ------------------------------------------- | -------- | ------ | ------ | ------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------ |
| ~~SSE frontend deduplication on reconnect~~ | ~~Done~~ | Low    | —      | `web/src/api/client.ts:88` `makeProgressDeduper` + `openAnalyzeStream` at `client.ts:107` filter replays via `e.lastEventId`. Tested in `web/src/api/client.test.ts`. No outstanding work. |

---

## Notes

- **SUPERB Sprint completed.** All 20 of 21 tasks from the plan at `docs/planning/2026-08-04_10-22_SUPERB-close-every-gap-sprint.md` are done (M11 guided tour: owner ruled it a **never-do** on 2026-09-07 — tours were deleted before on purpose; do not reintroduce). Frontend unit-test infrastructure (Vitest + jsdom) is live with 44 tests across 3 suites, wired into CI.
- Completed work is recorded in [CHANGELOG.md](CHANGELOG.md), never here.
