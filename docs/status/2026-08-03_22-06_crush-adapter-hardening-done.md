# Status: Crush adapter hardening — DONE, live-verified, ready to push

**Date:** 2026-08-03 22:06
**Author:** Crush (with user prompt as scope)
**Scope of this run:** Continue the Crush adapter work from the previous session. The adapter landed in `0ba1f79` but had thin test coverage, a cross-message tool-call/result pairing bug, and 30+ open follow-up tasks. This session executed the Pareto backlog: tests, fixture, refactor, docs, CLI flags, and live verification.

> **Update 2026-08-03:** ~~ready to push~~ pushed and built on. 17 more
> commits followed this session (multi-DB discovery `72f91e2`, Cwd fix
> `72f91e2`, judge CLI `266bd64`). The P0 push/gofmt/gitignore items all
> shipped. Per-item status in the [Resolution](#resolution-2026-08-03)
> appendix; open work is now in `TODO_LIST.md`.

## Summary

17 commits since the initial adapter. 24 files changed, 3,833 insertions, 58 deletions. All 11 packages green. 39 tests in the crush package alone (1,182 lines of test code). Live-verified against the host's real Crush database: `mindwalk trace --crush-dir /path/.crush "crush://session/<id>"` exports correct traces with proper harness, model, events, and marks across multiple sessions and LLM providers.

## What I did (a) — fully done

| #   | Item                                                                                                                                                                                                                                                                                                                                                                          | Evidence         |
| --- | ----------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------- | ---------------- |
| 1   | Added a `docs/planning/2026-08-03_20-01_crush-adapter-hardening.md` Pareto plan with 30 ranked tasks, effort/impact table, and a mermaid execution graph.                                                                                                                                                                                                                     | commit `5b300c8` |
| 2   | Added `internal/adapter/crush/parts_test.go` covering every part discriminator (text, reasoning, tool_call, tool_result, finish, shell_command, image_url, binary, unknown), malformed input, empty/null/whitespace edge cases, tool_call id collision, nested JSON input, and the `agentLabelFromInput` / `splitAgentID` / `splitSessionID` helpers. 14 tests, 42 sub-tests. | commit `3cf5265` |
| 3   | Added `internal/adapter/crush/agents_test.go` covering the exact-match, unlinked-launch, derived-child, and empty-catalog branches plus all helper functions (`parseCrushLaunchOutput`, `crushChildDepth`, `agentArgument`, `indexChildrenByParent`). 10 tests.                                                                                                               | commit `84357ab` |
| 4   | Fixed the `RootSessionID` bug in `Summarize` that overwrote the parent session id with the source message id.                                                                                                                                                                                                                                                                 | commit `84357ab` |
| 5   | Extracted the `crush://session/<id>` magic string into `crush.SessionPath(id)`, `crush.IsSessionPath(path)`, and `crush.SessionIDFromPath(path)` helpers; updated both server call sites to use the predicate. Replaced `HasPrefix + TrimPrefix` with `CutPrefix`.                                                                                                            | commit `7bb2232` |
| 6   | Updated `model.SessionMeta.Path` comment to document the synthetic URI scheme.                                                                                                                                                                                                                                                                                                | commit `f5c1416` |
| 7   | Committed `testdata/crush/crush.db` fixture (20KB) with a root session, a user prompt, an `agent` tool call + result, and a sub-agent child session.                                                                                                                                                                                                                          | commit `3ea8f4c` |
| 8   | Added `internal/adapter/crush/fixture_test.go` with 4 end-to-end tests that exercise ListSessions, Parse, Summarize, and BuildAgentGraph against the committed fixture.                                                                                                                                                                                                       | commit `3ea8f4c` |
| 9   | Added `TestServerLoadsCrushFixtureSession` in `internal/server/server_test.go` exercising the full HTTP path: `/api/sessions`, `/api/sessions/<key>/trace`, `/api/sessions/<key>/agents`. Asserts session listing, event count, mark types, and agent graph link quality.                                                                                                     | commit `69c8e96` |
| 10  | Fixed the cross-message tool-call/result pairing bug. The parts parser now records `resultIDs` (parallel to results) so the agent graph reader can match a tool result in message B to its tool call in message A. Added `allSessionsQuery` so the agent graph builder can find auxiliary children that `ListSessions` intentionally hides from the rail.                     | commit `69c8e96` |
| 11  | Added `--no-crush` flag and `Config.DisableCrush` field. Server skips registering the Crush adapter entirely when set. Refactored adapter registration into `buildAdapters(cfg)` helper.                                                                                                                                                                                      | commit `fcba6de` |
| 12  | Added `TestServerSkipsCrushWhenDisabled` to verify the flag works.                                                                                                                                                                                                                                                                                                            | commit `fcba6de` |
| 13  | Tightened `openReadOnly` error reporting: wraps every non-NotFound failure with the resolved path, detects empty files and directory-where-file-expected early. Added `TestOpenReadOnlyReportsUnderlyingError`.                                                                                                                                                               | commit `db98d81` |
| 14  | Added per-harness session count log line in `scanSessions`: `mindwalk: found N session(s) — N claude-code, N codex, N crush`.                                                                                                                                                                                                                                                 | commit `9a435fe` |
| 15  | Documented `--crush-dir`, `--no-crush`, and `crush://session/<id>` path in the CLI `--help` text with concrete examples.                                                                                                                                                                                                                                                      | commit `4c49684` |
| 16  | Added `docs/crush.md` — 193-line reference covering data-dir resolution, parts JSON shape table, synthetic path scheme, sub-agent id format, agent graph link quality tiers, fixture regeneration recipe, and `--no-crush` flag.                                                                                                                                              | commit `d2ebd5f` |
| 17  | Tightened GoDoc on `Adapter.Harness()` and removed a dead-code empty branch in `Parse` (the `isAgent` local was unused).                                                                                                                                                                                                                                                      | commit `3966b52` |
| 18  | Added `CHANGELOG.md` with the initial-release entry and a full [Unreleased] section documenting every change in this cycle.                                                                                                                                                                                                                                                   | commit `6c799a9` |
| 19  | Added `--crush-dir` and `--no-crush` flags to `mindwalk trace` and `mindwalk analyze`. Refactored `parseTrace` to accept a crushDir parameter and added a `crushDirFor` helper.                                                                                                                                                                                               | commit `c630310` |
| 20  | Removed the unused `buildEvent` wrapper in `parts.go` and its now-unneeded `internal/model` import.                                                                                                                                                                                                                                                                           | commit `3cf5265` |
| 21  | Live-verified `mindwalk trace --crush-dir <path> "crush://session/<id>"` against 4 real sessions from the host's Crush database. Confirmed correct harness, model, events (0-93), and marks (1-27) across MiniMax-M2.7-highspeed and mimo-v2-pro models.                                                                                                                      | session output   |
| 22  | Live-verified the server boots and serves the Crush session through `/api/sessions`. Confirmed the scan log line works.                                                                                                                                                                                                                                                       | session output   |

## What I did (b) — partially done

| #   | Item                                                                                                                                                                                                                                                                                                                                                                                                                                | Gap                                                       |
| --- | ----------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------- | --------------------------------------------------------- |
| 1   | **`mindwalk analyze` against a live Crush session**: I added the `--crush-dir` and `--no-crush` flags and verified the trace export path works. But I did NOT fire `mindwalk analyze` end-to-end because the judge requires a local `claude` or `codex` CLI binary, which is not installed on this machine. The trace pipeline (the adapter's Parse path the judge reads) is live-verified; the judge subprocess invocation is not. | The judge CLI is a hard external dependency.              |
| 2   | **Web UI (Three.js) verification**: I started the server, confirmed `/api/sessions` returns the Crush session with the right metadata, and confirmed the scan log line. But I did NOT open a browser and visually inspect the 3D citymap, event ticks, file targets, or agent graph. The API shape is correct; the rendering is unverified.                                                                                         | No browser in this environment.                           |
| 3   | **Agent Lens end-to-end with a real sub-agent session**: The fixture has a sub-agent session and the agent graph test passes against it. The live sessions I tested don't have sub-agents (the `agent` tool was never called), so the real-data Agent Lens path is only verified through the fixture, not through the host's actual database.                                                                                       | Would need a live Crush session that spawned a sub-agent. |
| 4   | **`/api/adapters` endpoint**: Not started. The planning doc listed it as a P2 task. The `scanSessions` log line partially covers the "which adapters are wired" need, but an HTTP endpoint would be better for debugging.                                                                                                                                                                                                           | Deferred — P2 tier.                                       |

## What I did NOT start (c)

| #   | Item                                                                                                             |
| --- | ---------------------------------------------------------------------------------------------------------------- |
| 1   | `/api/adapters` status endpoint returning harness name, session count, and data dir for each registered adapter. |
| 2   | `mindwalk doctor` subcommand that prints session counts, data dir paths, and which adapters are wired.           |
| 3   | Stress test with a 100k-message Crush session to find the first place the read path chokes.                      |
| 4   | Cache `crush.db` reads across requests via `sync.Map` so a long-lived server doesn't open the file per call.     |
| 5   | Persist the agent graph cache to disk keyed by `(session_key, fingerprint_of_messages_count)`.                   |
| 6   | Benchmark for the SQLite parse path to catch a future regression on large sessions.                              |
| 7   | Schema coverage warning at startup if the Crush DB schema is older than expected.                                |
| 8   | `mindwalk sessions` CLI subcommand that prints the rail without starting the server.                             |
| 9   | Frontend (Three.js) verification in a real browser.                                                              |
| 10  | Audit other `internal/server` paths for `crush://` assumptions beyond the two I already fixed.                   |

## What I screwed up (d) — fully owned

| #   | Item                                                                                                                                                                                                                                                                                                                                  | Cost                                  |
| --- | ------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------- | ------------------------------------- |
| 1   | The first version of the fixture had a `view` tool call (not an `agent` tool call), so the agent graph builder couldn't test the exact-match branch. Had to regenerate the fixture with an `agent` tool call + matching tool_result.                                                                                                  | One round-trip.                       |
| 2   | The first cross-message pairing fix was wrong: I tried to pair results inside the same `decodeParts` call, but real Crush splits tool_call and tool_result across separate messages. Had to extend the parser with `resultOrder` and `resultIDs` so the agent reader can match across message boundaries.                             | Three iterations.                     |
| 3   | The first version of `loadAgentChildren` used `listSessionsQuery` (which filters `WHERE parent_session_id IS NULL`), so it only found root sessions — never the auxiliary children it was supposed to find. Had to add `allSessionsQuery` without the filter.                                                                         | One iteration.                        |
| 4   | When I changed `finish()` to surface cross-message results, I accidentally broke the same-message pairing: the "paired" check used `p.results[callID]` (which is always populated for any result), so every result looked paired and the cross-message loop was skipped. Had to track paired results in a separate `map[string]bool`. | One iteration.                        |
| 5   | The `TestAgentGraphInputsReturnsRootPath` test used `Adapter{}` (empty Dir) which auto-discovers the host's real Crush database, making the test non-deterministic. Had to change to `Adapter{Dir: filepath.Join(t.TempDir(), "no-crush")}`.                                                                                          | One iteration.                        |
| 6   | I initially wrote `_ = trace` as a no-op to silence the `isAgent unused` lint warning, then realised that's exactly the kind of no-op the status report flagged as a smell. Reverted and just used `_` in the destructuring.                                                                                                          | One round-trip.                       |
| 7   | The first `parseCrushInput` nested-JSON test was wrong: `jsonEscape` used `strings.Trim` to strip quotes, which mangled the escaped inner quotes. Had to rewrite using `json.Marshal` directly.                                                                                                                                       | One iteration.                        |
| 8   | When I extended `SessionMeta.Path` with a comment, I accidentally deleted the `Path` field itself (the `old_string` match was too aggressive). The build broke with 16 errors. Had to re-add the field.                                                                                                                               | One panic + one fix.                  |
| 9   | The sed-based `sessionPath` → `SessionPath` rename worked on the source files but the LSP reported stale errors for 10+ minutes, making it look like the rename had failed. Had to restart the LSP and re-verify with `go build`.                                                                                                     | Wasted time on stale diagnostics.     |
| 10  | I spent too long debugging the fixture's agent graph (3-node issue) by adding temporary debug test files instead of reading the code path carefully. The root cause — `loadAgentChildren` querying the wrong SQL — was obvious once I added one log line.                                                                             | ~20 minutes of unnecessary iteration. |
| 11  | The first version of the `trace` command's `--crush-dir` support used a manual loop over positional args, which was fragile and didn't match the `flag.NewFlagSet` pattern used by the other subcommands. Had to refactor to use `crushDirFor` helper.                                                                                | One round-trip.                       |

## What to improve (e) — process, judgment, scope

- **Read the fixture generator's output before writing tests.** I wrote fixture tests that assumed a `view` tool call, then generated the fixture with a `view` tool call, then discovered the agent graph test needed an `agent` tool call. The fixture should have been designed to exercise the exact-match branch from the start.
- **Debug with log lines, not temporary test files.** I created 6+ temporary `_test.go` debug files (debug, debug2, debug3, debug4, debug5, debug6, debug7, dumpgraph) to inspect state. A single `t.Logf` in the existing test would have been faster and left no cleanup.
- **Check the SQL query before assuming the code is wrong.** The `loadAgentChildren` bug took 20 minutes because I assumed the Go code was broken. The SQL query was filtering out the rows I wanted. Reading the query string once would have caught it immediately.
- **Don't trust LSP diagnostics after a sed-based rename.** The LSP reported 16 phantom errors for 10+ minutes after the rename. `go build` is the source of truth; the LSP catches up eventually.
- **The `resultIDs` / `resultOrder` design is more complex than it needs to be.** A cleaner approach would have been to add `ToolCallID` to the `adapter.ToolResult` struct so the pairing happens at the type level, not via a parallel slice. The parallel-slice approach works but is fragile and will trip up the next contributor.
- **Commit more granularly during the debugging phase.** The cross-message pairing fix (`69c8e96`) bundles 7 files and 273 insertions because I waited until everything worked before committing. Smaller commits would have made the debugging traceable.
- **The `crushDirFor` hack is ugly.** Passing `"/dev/null/mindwalk-no-crush"` to signal "disable" is a magic string. The proper fix is a `DisableCrush bool` parameter to `parseTrace`, but that would require changing the function signature everywhere. Deferred.

## What to get done next (f) — ranked

Ordered by customer value × effort:

### P0 — must do before push

1. **Push to origin** — 17 commits ahead, all tests green, working tree clean (except WAL files). Just needs `git push`. (1 min)
2. **Add `testdata/crush/` to `.gitignore` for WAL files** — the `crush.db-shm` and `crush.db-wal` files regenerate on every test run and shouldn't be committed. (5 min)
3. **Run `gofmt` on all changed files** — I didn't run `gofmt` after every edit. The CI might catch formatting issues. (5 min)

### P1 — this week

4. **Add `adapter.ToolResult.ToolCallID` field** and remove the parallel `resultIDs` slice. This is the clean fix for the cross-message pairing design. (45 min)
5. **Fire `mindwalk analyze` end-to-end** against a live Crush session with a judge CLI installed. Verify the rubric layer accepts the Crush tool vocabulary. (30 min + judge CLI install)
6. **Boot the web UI in a browser** and visually verify the Crush session renders: rail row, event ticks, file targets on the citymap, agent graph. (30 min)
7. **Add `/api/adapters` endpoint** returning harness name, session count, data dir, and enabled/disabled status for each registered adapter. (45 min)
8. **Test with a live sub-agent session** — find or create a Crush session that actually spawned a sub-agent and verify the Agent Lens renders the graph correctly. (30 min)
9. **Add a benchmark for the SQLite parse path** — cold open + messages scan on the fixture. (30 min)
10. **Add `mindwalk doctor` subcommand** that prints adapter status, session counts, and data dir paths. (60 min)
11. **Audit `handleSessionResource` subresource routing** for `crush://` assumptions beyond the two call sites I already fixed. (30 min)
12. **Cache `crush.db` reads across requests** via `sync.Map` keyed by absolute path. (45 min)
13. **Investigate whether `findSession` should try `crush://session/<id>`** for the bare-id URL form. (30 min)
14. **Cross-check the Crush parts parser against the latest upstream source** — I read a frozen snapshot; upstream may have moved. (30 min)
15. **Add a stress test with a 100k-message Crush session** to find the first bottleneck. (60 min)
16. **Generalise the synthetic-path scheme** into a `model.SyntheticPath(scheme, id)` helper now that the pattern is proven. (30 min)

### P2 — this month

17. **Persist the agent graph cache to disk** keyed by `(session_key, fingerprint)`. (90 min)
18. **Refactor `summarizeCached` to take `model.SessionMeta`** directly rather than `(source, path, info)`. (45 min)
19. **Add `mindwalk sessions` CLI subcommand** that prints the rail without starting the server. (45 min)
20. **Add schema coverage warning** at startup if the Crush DB schema is older than expected. (30 min)
21. **Support the older `title-<sessionID>` agent id format** for backward compatibility with older Crush releases. (30 min)
22. **Add a `crush sessions` CLI** for `crush://session/<id>` paths that shows rail output in the terminal. (60 min)
23. **Investigate the Crush `provider_executed` flag** — server-side tool calls are currently ignored. Document the limitation. (15 min)
24. **Audit `lookupProjectDataDir`** for the corner case where the working dir is outside a git worktree. (30 min)
25. **Add `tool_call.id` collision test for cross-message duplicates** — the current test only covers same-message collisions. (20 min)
26. **Reduce test runtime** — 18 server tests each spin up a Crush adapter that calls `os.Getwd`. Consider a `sync.Once`. (20 min)
27. **Add a CI workflow** that runs `go test ./...` on every push, not just locally. (30 min)
28. **Update the `README.md` screenshots** to include a Crush session in the rail. (30 min)
29. **Add a `--crush-projects-file` flag** for advanced users who want to pin a specific projects.json. (60 min)
30. **Investigate Cwd extraction** — Crush sessions don't have a per-session cwd field. Check if per-message cwd data exists. (deferred)

## Questions for the user (g)

1. **Should I push now?** The branch is 17 commits ahead of `origin/master`, all tests pass, and the working tree is clean (except SQLite WAL files that shouldn't be committed). I have not pushed because the original instructions said "do not push unless explicitly asked." Should I push, or do you want to review first?

2. **Should the WAL files (`crush.db-shm`, `crush.db-wal`) be committed or gitignored?** Currently they're untracked. SQLite's WAL mode creates them at runtime; they're not needed for the fixture to work but their presence avoids a one-time WAL creation on first test run. I lean toward gitignoring them (they're build artifacts, not source), but the main `crush.db` file IS committed, so there's an argument for consistency.

3. **Should I generalise the `crush://session/<id>` synthetic-path scheme into a `model.SyntheticPath(scheme, id)` helper now, or wait for a second DB-backed adapter?** My instinct is to wait — the typed helpers (`SessionPath`, `IsSessionPath`, `SessionIDFromPath`) are already localised and the generalisation would be speculative without a second consumer. But if you plan to add Aider or Goose support soon, doing it now avoids a second refactor.

---

## Resolution (2026-08-03)

Section (f) next-steps resolved. Hashes are post-rebase current values.

| #      | Item                           | Status   | Commit / where                   |
| ------ | ------------------------------ | -------- | -------------------------------- |
| **P0** |                                |          |                                  |
| 1      | Push to origin                 | done     | pushed                           |
| 2      | `.gitignore` WAL files         | done     | round 2 (`6c986d3` era)          |
| 3      | gofmt                          | done     | round 2                          |
| **P1** |                                |          |                                  |
| 4      | `ToolResult.ToolCallID` field  | done     | `6c986d3`                        |
| 5      | `mindwalk analyze` end-to-end  | open     | TODO_LIST                        |
| 6      | Boot web UI in browser         | open     | TODO_LIST                        |
| 7      | `/api/adapters` endpoint       | done     | `6c986d3`                        |
| 8      | Live sub-agent session test    | open     | TODO_LIST                        |
| 9      | Benchmark SQLite parse         | done     | `6c986d3`                        |
| 10     | `mindwalk doctor`              | open     | TODO_LIST                        |
| 11     | Audit `handleSessionResource`  | done     | `6c986d3`                        |
| 12     | Cache `crush.db` reads         | open     | TODO_LIST                        |
| 13     | `findSession` bare-id          | done     | no change needed                 |
| 14     | Cross-check parser vs upstream | open     | ROADMAP                          |
| 15     | 100k-message stress test       | open     | ROADMAP                          |
| 16     | Generalise synthetic path      | deferred | ROADMAP non-goal                 |
| **P2** |                                |          |                                  |
| 17     | Persist agent-graph cache      | open     | TODO_LIST                        |
| 18     | Refactor `summarizeCached`     | deferred | low priority                     |
| 19     | `mindwalk sessions` CLI        | open     | TODO_LIST                        |
| 20     | Schema-coverage warning        | open     | TODO_LIST                        |
| 21     | `title-<sessionID>` support    | won't-do | ROADMAP non-goal                 |
| 22     | `crush sessions` CLI           | dedup    | of #19                           |
| 23     | `provider_executed` flag       | open     | ROADMAP                          |
| 24     | Audit `lookupProjectDataDir`   | deferred | low priority                     |
| 25     | Cross-message collision test   | open     | same-message covered (`639cb7d`) |
| 26     | Reduce test runtime            | open     | TODO_LIST                        |
| 27     | CI workflow                    | open     | TODO_LIST                        |
| 28     | README screenshots             | deferred | low priority                     |
| 29     | `--crush-projects-file` flag   | won't-do | multi-DB shipped at `72f91e2`    |
| 30     | Cwd extraction                 | done     | `72f91e2` (`projectPathForDB`)   |
