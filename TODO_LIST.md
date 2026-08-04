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

| Task                                                                 | Status    | Impact | Effort | Evidence                                                                                                                 |
| -------------------------------------------------------------------- | --------- | ------ | ------ | ------------------------------------------------------------------------------------------------------------------------ |
| Add `schema/progress.schema.json` for the SSE `Progress` wire format | 🔴 `TODO` | High   | 20min  | `internal/judge/progress.go:6`; AGENTS.md line 79 says "update schema when JSON shapes change"; file missing             |
| Wire `providerExecuted` into the HUD 0-target warning                | 🔴 `TODO` | High   | 30min  | `model.Event.ProviderExecuted` populated in Go, typed in `web/src/types.ts:152`, but `web/src/ui/Hud.tsx` never reads it |
| Add `model-switch` glyph to the Timeline legend                      | 🔴 `TODO` | High   | 10min  | `MARK_LABEL` entry exists (`web/src/ui/Timeline.tsx:51`) but the rendered legend (`Timeline.tsx:457`) omits it           |
| Add test for `evictAgentGraphCache()`                                | 🔴 `TODO` | High   | 30min  | `internal/server/server.go:1034`; zero test coverage on the eviction path                                                |
| Add test for `crush.Adapter.Diagnostics()`                           | 🔴 `TODO` | High   | 30min  | `internal/adapter/crush/diagnostics.go:21`; only exercised indirectly via CLI against empty temp dirs                    |

## Medium Impact

| Task                                                                           | Status    | Impact | Effort | Evidence                                                                                                                      |
| ------------------------------------------------------------------------------ | --------- | ------ | ------ | ----------------------------------------------------------------------------------------------------------------------------- |
| Surface per-message duration from `finished_at`                                | 🔴 `TODO` | Med    | 1h     | `finished_at` column scanned (`sessions.go:750`) but value discarded; no per-message duration on events or marks              |
| Add test for `adapter.OpenFile` (3-return signature)                           | 🔴 `TODO` | Med    | 20min  | `internal/adapter/adapter.go:92`; public API, zero direct tests                                                               |
| Fix `humanBytes` to handle GB and add test                                     | 🔴 `TODO` | Med    | 15min  | `cmd/mindwalk/main.go:607`; caps at MB; no test                                                                               |
| Make `mindwalk cache clear` also clear reports                                 | 🔴 `TODO` | Med    | 15min  | `cmd/mindwalk/main.go:53`; clears `agent-graphs/` only, ignores `~/.mindwalk/reports/`                                        |
| Refactor read_files observability to pass grade through `ComputeStats`         | 🔴 `TODO` | Med    | 45min  | Current post-hoc override of `ComputeStats` output is fragile; a future change could silently undo it                         |
| Update committed test fixture with non-zero tokens/cost and `read_files` table | 🔴 `TODO` | Med    | 30min  | `testdata/crush/crush.db` has all-zero tokens/cost and no `read_files` table; exact observability path untestable via fixture |

## Low Impact

| Task                                                           | Status    | Impact | Effort | Evidence                                                                                                               |
| -------------------------------------------------------------- | --------- | ------ | ------ | ---------------------------------------------------------------------------------------------------------------------- |
| Add SSE heartbeat/keep-alive pings                             | 🔴 `TODO` | Low    | 30min  | `internal/server/sse.go`; long judge runs (~2min) could trigger proxy timeouts without keep-alive                      |
| Fix `gitDiffPaths` regex for paths with spaces                 | 🔴 `TODO` | Low    | 15min  | `internal/adapter/adapter.go`; regex fails on quoted `"a/path with space.go"` format                                   |
| Extract hunk line ranges from `@@` headers into `Target.Lines` | 🔴 `TODO` | Low    | 30min  | `internal/adapter/adapter.go`; `Lines` is nil for diff-extracted targets                                               |
| Parse `---`/`+++` fallback diff lines                          | 🔴 `TODO` | Low    | 15min  | `internal/adapter/adapter.go`; catches diffs without `diff --git` headers                                              |
| Verify `mindwalk analyze --judge crush` end-to-end             | 🔴 `TODO` | Low    | 15min  | Crush judge CLI wired (`cli.go:151`) but never fired against a real trace; see [ROADMAP.md](ROADMAP.md) Open Questions |

---

## Notes

- **Stress test with a 100k-message Crush session** lives in [ROADMAP.md](ROADMAP.md)
  (unbounded investigation, not a bounded task).
- Open questions that block decisions are in [ROADMAP.md](ROADMAP.md#open-questions).
- Completed work is recorded in [CHANGELOG.md](CHANGELOG.md), never here.
