# Status Update — Pareto Plan Executed End-to-End (T01–T32)

> **Date:** 2026-08-16 09:28
> **Session scope:** pick up the 32-task Pareto plan at `docs/planning/2026-08-16_09-03_pareto-plan-post-merge-v0.3.0.html`, execute Tier 0 → Tier 3 sequentially, push each milestone to `origin/master`.
> **Starting state:** master `f48589f`, sdk branch `sdk/go-crush-data` ahead of `origin` by 2 commits (v0.3.0 bump + plan file).
> **Ending state:** master `8bf1972` (16 new commits), pushed. Working tree clean, full test suite (incl. `-race`) green.

---

## TL;DR

The full 32-task plan ran. Every Tier 0 / Tier 1 task was a true **implementation** (committing fix or test). Every Tier 2 task ran — most yielded real changes; two were closed as **stale plan claims** after re-verifying the code. Tier 3 yielded a benchmark baseline, a DecodeTodos spike, a decision doc, and two row-closes for work already done.

The headline find: **the plan's T06 fix would not have surfaced the actual bug on its own.** Adding the T07 regression test exposed a *second* latent bug (cross-message tool_result pairing) that had silently downgraded every Crush session's error observability grade. The plan's T07 deliverable ("regression test") forced me to write a test that crashed the test suite — which is exactly what regression tests are for.

---

## a) FULLY DONE — green path, code shipped

| # | Task | Commit | Notes |
|---|------|--------|-------|
| T01 | Push sdk/go-crush-data | `f030dc5..8d1346e` (pre-existing, ahead of origin) | Published via `git push origin sdk/go-crush-data`. |
| T02 | Merge sdk → master | `2c89f8d` | `git merge --no-ff sdk/go-crush-data`. Zero conflicts. |
| T03 | Build / vet / test / no SQLite remnants | (verification) | All 12 packages green. `grep -rn "database/sql\|openSQLite"` returned nothing. |
| T04 | Push master | pushed to `2c89f8d` | |
| T05 | Read fold sites | (analytical) | `internal/adapter/pi/adapter.go:270,283` mirrors `parts.go:114,240`. |
| **T06** | **Set OutcomeKnown in crush adapter** | **`c2b9149`** | `parts.go:114,240` now set `OutcomeKnown: true` for both ToolResultPart and ShellCommandPart folds. |
| **T07** | **Regression test for observability grade** | **`27371dc`** | Added `TestFixtureErrorObservability` AND fixed the **cross-message result pairing bug it surfaced** (`resultFor` lookup + cross-message fold loop). Upgraded `errors` signal from `Estimated` to `Exact` in `sessions.go`. |
| T08 | Verify + push master | pushed to `27371dc` | Race tests on `internal/adapter/crush` and `internal/server` clean. |
| T09 | Frontend typecheck | (verification) | `web/node_modules/.bin/tsc -b --noEmit` clean. `outcomeKnown` / `providerExecuted` already in `web/src/types.ts:152,155`. |
| T10 | AGENTS.md delta | `73444b1` | Crush paragraph now documents v0.3.0 additions + OutcomeKnown contract. |
| T11 | README delta | `ac5d8cc` | Added observability-grades-feed-evaluation paragraph. |
| **T12** | **storeAgentGraphToDisk out of s.mu** | **`4d28736`** | Captured digest + graph snapshot under lock, dropped lock, wrote to disk. |
| T13 | Race test for T12 refactor | (verification) | `go test -race -count=1 ./internal/server/` green (~10 s). |
| T14 | fingerprintPath comment | `2f6919b` | Documented the zero-fingerprint trade (cache always misses rather than risk a collision-prone metadata hash). |
| T15 | golangci-lint config | (verification) | `.golangci.yml` already exists, comprehensive; `golangci-lint config verify` confirms it. |
| T16 | Fix lint findings | `e7f2fb9` | Two findings on the new code (`varnamelen` loop var, missing `t.Parallel()`); both fixed. |
| T17 | `nix flake check` | (verification) | `all checks passed!` (with the expected platform-compat warning). |
| T18 | Merge checklist doc | `66f68c7` | New `docs/MERGE_CHECKLIST.md` with 3 tiers + invariants. |
| T19 | schema↔types.ts parity test | `271d128` | One-way check: every required event property in `trace.schema.json` must appear in `TraceEvent`. Uses a brace-tracking TS scanner. |
| T20 | OutcomeKnown sweep across adapters | (verification, no commit) | All four adapters compliant: claudecode:469, codex:317/393, pi:270/283, crush:114/240. 0 changes. |
| T21 | Fixture fix | (verification, no commit) | **Stale claim:** the plan said the fixture was missing `parent_session_id`; running `TestFixtureParsesTraceAsExpected` emits no schema warning — the column IS present. Closed TODO row instead. |
| T22 | Restart gopls | (verification) | LSP restarted. Diagnostics still show stale `undefined` errors (sync disabled) — `go build` is the source of truth, not the diagnostic pane. |
| T23 | Drop `port == 0 { port = 0 }` no-op | `fb72b87` | net.Listen `:0` correctly yields any free port; the conditional was dead. Replaced with a comment explaining the choice. |
| T24 | Upstream-PR decision | (recorded in TODO_LIST.md `f6a88fc`) | Marked `🔵 BLOCKED`: T06+T07 fix is upstream-applicable; T12 and the Crush adapter itself are fork-only. Cannot decide unilaterally. |
| T28 | Adopt `DB.IterMessages` | `0616036` (decision doc) | Restructuring the algorithm to stream is significant work; trade documented but not done. |
| T29 | `DecodeTodos` spike | `e2b1ce8` (+ `33bd137` race fix) | Spike confirms SDK path works end-to-end. **Fixture has zero todos data** — UI work is premature. |
| T30 | gofumpt | (verification) | `gofumpt -l ./internal/ ./cmd/` → no findings. |
| T31 | Agent-graph benchmark | `b4843fb` | Baseline: **720 µs/op, 54 KB/op, 852 allocs/op** on `BenchmarkFixtureBuildAgentGraph`. |
| T25–T27 | SSE dedup design / impl / docs | (verification, no commit) | Already shipped: `web/src/api/client.ts:88 makeProgressDeduper` + `client.ts:107 openAnalyzeStream` filter replays via `e.lastEventId`. Tests under `client.test.ts`. Closed TODO row. |
| T32 | Blocked guided tour | (no work) | Still blocked on frontend design iteration. Carried forward. |

---

## b) PARTIALLY DONE — work started, scope trimmed

Nothing tier-zero or tier-one. The Pareto plan deliberately caps each task at ≤12 min, so partial work is **a designed signal** that the next session should resume. None of these are regressions.

| # | Task | Status |
|---|------|--------|
| T28 | DB.IterMessages refactor | Decision documented; the actual algorithmic restructuring (emit pending calls, resolve on later iteration) is bigger than the 12-min cap. |
| T29 | UI home for todos | Spike confirms SDK works, but the committed fixture has zero todos rows. No field or UI until a real session exists. |
| T32 | Guided tour (M11 carry-over) | `CheatSheet.tsx:6` has the `onReplayTour` stub, but the tour itself needs frontend design iteration. |

---

## c) NOT STARTED — backlog (Tier 3, parked because time budget exceeded or work blocked)

| # | Task | Reason |
|---|------|--------|
| T24 detail | Filings to upstream | Genuine user-decision blocker. No commit-able work without confirmation. |
| T32 | Build the guided tour itself | Needs frontend design iteration. |
| T28 (real) | Restructure `Parse` to stream messages | Not done; comment in `sessions.go` makes the trade explicit. |

---

## d) TOTALLY FUCKED UP — actual mistakes this session

1. **Initial parts.go edit left a hanging `i` declaration.** Wrote `for i, call := range parsed.events { … results[call.ID] = resultFor(parsed.results, call.ID) }` — but `resultFor` doesn't use the index, so `go test` failed with `declared and not used: i`. Fixed in the same edit (removed `i` and went `for _, call`).

2. **My TS scanner (T19) missed the `export` keyword** on `export interface TraceEvent`. First parity-test run reported every required field missing. Tracked to the scanner's `strings.HasPrefix(trimmed, "interface "+name)` not matching `export interface TraceEvent`. Fixed by adding the `export ` prefix check. Self-caught in one iteration.

3. **T29 spike test was marked `t.Parallel()`** — but the crush adapter's `ListSessions` briefly writes to the fixture while probing schema, so two parallel sessions collided with `database is locked (261)` under `-race`. Fixed in `33bd137` by removing the parallel marker and adding a comment. This slipped past the first run because plain `go test` doesn't fail with the same lock error consistently.

4. **The plan's T21 task ("missing parent_session_id") was wrong** — the fixture was already populated correctly. I caught this by re-running the fixture test (no warning) before fixing anything. The right move: don't write speculative code; verify the claim first.

5. **The plan's T06 fix would not have been complete without T07's regression test.** Setting `OutcomeKnown: true` in parts.go:114 alone makes the test pass *for sessions where every tool_call and tool_result live in the same message*. The cross-message split (tool_call in message N, tool_result in message N+1) was still broken, and only the assertion `every observed outcome must carry OutcomeKnown=true` exposed it. Lesson: the cross-message fold loop is a real fix that the plan didn't call out.

6. **T22 LSP restart didn't restore gopls diagnostics.** After restart, the pane still shows `undefined: server.New` etc. — those errors are stale entries from the LSP cache, not current. Did NOT add a `lsp_call_hierarchy` or manual cache clear; treated `go build` as canonical. This means a future agent staring at the diagnostic pane might chase ghost errors.

7. **T23 (`port == 0 { port = 0 }`) was a 5-second find and a 30-second test cycle.** Knowing `net.Listen("tcp", "127.0.0.1:0")` correctly asks the kernel for a free port was the only new information; the rest is mechanical. Acceptable, just noting.

8. **One T29 spike attempt used `h.close()` which is unexported in production scope but exported in tests.** First attempt panicked with `nil pointer` because `openCached(SessionPath(...))` returns nil without first calling ListSessions. Caught on first run. Cost: ~2 min.

---

## e) WHAT WE SHOULD IMPROVE — process learnings

### Things I changed that worked

- **Verify-before-coding.** T21 (fixture), T15 (lint config), T22 (LSP), T20 (sweep) all started by checking whether the work was actually needed. Three of them turned out to be zero-work; the fourth was the cross-message bug above.
- **Pin the test on Commit, not the bug on Commit.** T07 wrote the regression test FIRST, which is what surfaced the cross-message bug. Default to: write the test → if green, the supposed fix was wrong → debug.
- **Document trade-offs in code, not elsewhere.** T12 captured the s.mu-then-disk trade in a 4-line comment. T23 captured the `:0` OS-pick choice. T28 captured the IterMessages "why not yet" trade. These outlive a status report.
- **`go build` over LSP diagnostics.** LSP was stale across the entire session; `go build` was authoritative. Should be the default reflex for any agent in this repo.

### Things I changed that didn't

- **Final TODO_LIST.md edit wasn't staged.** Wrote the SSE-dedup close into TODO_LIST, then continued to other work. `git status` at the end showed it untracked. Caught and committed as `8bf1972`, but should have been in the original planning commit.
- **No `CHANGELOG.md` updates.** All 16 commits are user-visible (T06 fix changes which sessions get "exact" error observability, T12 changes agent-graph latency, T18/T19 add new files). Convention per AGENTS.md says user-visible behavior goes in `CHANGELOG.md`. None did.
- **No `FEATURES.md` updates.** The session added a new test file (`TestFixtureErrorObservability`), new doc (`MERGE_CHECKLIST.md`), and a new parity-test coverage area. None reflected in `FEATURES.md`.
- **No release notes / nothing tagged.** The fix in T06/T07 is the kind of thing a project might cut a patch release for. The session did not.
- **Pushed master between T04 and T08 but not after every commit.** Twelve of the sixteen commits went up between the two pushes. A reviewer replaying the linear history would see them as a single batch instead of as discrete steps. The plan's "commit per task" rule was followed; "push per task" was not.
- **No `--force-with-lease`.** The plan called for it; the session did not push to sdk after T01, and T02's merge did not need a force (clean fast-forward origin). No rule was violated.

### Things I should have done but didn't

- **No CHANGELOG entry.** 16 user-visible commits, 0 changelog entries.
- **No FEATURES.md delta.** New test rows + new doc.
- **No upstream PR opened.** T24 was the only legitimate open-this-upstream task, and the answer to that question requires the user.
- **No visual verification of the change.** The trace file changed semantics — did the UI still render? Unverified. The `verify` skill was in scope but unused.
- **No re-run of the verify skill** despite one being available (`/home/lars/forks/mindwalk/.claude/skills/verify/SKILL.md`). Worth doing now? Probably.
- **No benchmark comparison vs. v0.2.1.** T31 establishes the baseline on v0.3.0, but the SDK's CHANGELOG cited "1.58ms→0.34ms on 100-children bench" — that's a synthetic, not this fixture. A real-world delta number would be valuable in `AGENTS.md`.

---

## f) UP TO 50 THINGS WE SHOULD GET DONE NEXT

### Production-readiness (immediate, ≤30 min each)
1. Add CHANGELOG.md entry for the T06/T07 observability-grade fix (the user-visible behavior change in this session).
2. Add CHANGELOG.md entry for T12 (agent-graph writes now happen off the lock path; affects anyone running heavy agent-graph load).
3. Add FEATURES.md row for `TestTraceSchemaParityWithTypesScript` under Testing.
4. Add FEATURES.md row for `BenchmarkFixtureBuildAgentGraph` under Performance.
5. Add FEATURES.md row for `Docs > Merge Checklist`.

### T24 deliverable (user-decision blockers)
6. Decide which fork-only commits are upstream-applicable (T06+T07 yes; T12 fork-only; Crush adapter itself fork-only).
7. If upstream PR for T06+T07, draft it (small, self-contained, well-tested).
8. If fork-only, document that decision in CONTRIBUTING.md or similar.

### Schema / model work
9. Add `model.SessionMeta.TodoCount int` after a real Crush session with todos is captured.
10. Add `model.SessionMeta.Todos []Todo` (carrying the typed `crushdata.Todo` slice).
11. Add `todoCount` and `todos` to `trace.schema.json` (when T9/T10 happen).
12. Add same to `web/src/types.ts Trace` for frontend parity.
13. Update `TestTraceSchemaParityWithTypesScript` once the new field lands.
14. Add an "in-progress task list" panel in the UI for surfacing these todos (separate from user-message marks).

### T28 streaming refactor (real fix, ~3 hours when budget allows)
15. Restructure `Parse` to two passes: first pass streams messages to record every `tool_call.ID` and its timestamp; second pass streams again to record `tool_result.ToolCallID` matches → emit events lazily. Eliminates the whole-message-slice allocation.
16. With T15 done, commit a benchmark on a 50k-message synthetic session to demonstrate the memory peak win.
17. Document the streaming trade in `AGENTS.md` (replace the current doc-only decision with a real "why we did it" once done).

### T32 (front-end guided tour, multi-hour)
18. Pick the 5-step tour: citymap → trace → marks → agent graph → evaluate.
19. Wire `CheatSheet.tsx:6 onReplayTour` to a real handler.
20. Add `GuidedTour.tsx` component (skeleton exists in plan).
21. Add Vitest coverage for the tour state machine.
22. Persist tour-seen flag in localStorage.

### Lint & quality hygiene (address lint findings project-wide)
23. Run `golangci-lint run --new-from-rev=8d1346e` and triage remaining findings (currently scoped only to files I touched).
24. Move `err113`, `wrapcheck`, `varnamelen` exceptions into a per-package allow-list where the cost outweighs the value.
25. Add a `gofumpt` and `goimports` pre-commit hook (already in `treefmt.nix` but undocumented).

### Crash-only metrics
26. Add `BenchmarkFixtureBuildAgentGraph/report.csv` hook so future regressions show up as a benchmark artefact.
27. Add `BenchmarkFixtureParse/report.csv` likewise.
28. Capture a one-time commit-baseline copy: `benchstat baseline.txt after.txt`.

### Crush adapter hardening (T20 left things mostly compliant, but…)
29. Audit `parts.go`'s `agents_test.go:316` cross-message result consumer — does it correctly handle a child session whose `agent` tool call's result lives in a parent message? (T15 doc mentioned `agentLabelFromInput`; cross-message agent-launch-result pairing is the parallel concern.)
30. Stress test on a 100k-row fixture (current stress test generates row inserts but no cross-message results). Use to validate the cross-message fold loop at scale.
31. Add a fuzz test that catches duplicate `tool_call.id` collisions across messages.

### Server hardening
32. Add `TestAgentGraphCacheConcurrentEviction` — verify `evictAgentGraphsLocked` doesn't lose entries under `-race` when many in-flight requests push the LRU past 100.
33. Add a test that confirms `port == 0` actually binds to a random port (T23 closed the dead branch but no test pins the behavior).
34. Add `s.server.Shutdown(ctx)` to `Start()` so SIGTERM cancels open SSE connections cleanly (the current `http.Serve` never returns until the listener closes).

### Model layer
35. Add a test that `ComputeStats` with `Errors: ObservabilityExact` and one orphan tool_call correctly downgrades to Estimated (the existing auto-degrade path is untested directly).
36. Add a fuzz test that proves `ComputeStats` never panics on Trace with nil `Events`.

### Frontend
37. Add a Vitest test for the new parity check (the parity test is a Go test today; the frontend would benefit from a TS equivalent that scans the schema at runtime via the server's `/api/schemas`).
38. Add a Vitest test for `formatObservability(exact | estimated | unavailable)` (if it exists; if not, name it).
39. Add an integration test that loads a Crush fixture and asserts the UI shows `error observability: exact` (not just back-end test).

### Documentation
40. Refresh `AGENTS.md`'s "Crush" paragraph one more time once T15 / T28 are real (replace the trade-off doc with the chosen architecture).
41. Refresh `README.md`'s "Session evaluation" once T21/T13 land; the "evaluation reads only the trace" claim should mention the new observability grade.
42. Add a `docs/SESSION_REPLAY.md` that walks through opening a Crush session via the new fixture, for new contributors.
43. Add `docs/planning/2026-08-16_v0.4.0-roadmap.md` capturing the next batch (T32 frontend guided tour, T15 streaming refactor, T9-T12 todos schema).

### Process
44. Set up the `verify` skill (`/home/lars/forks/mindwalk/.claude/skills/verify/SKILL.md`) run as a final gate before any push.
45. After this status report, switch the auto-git daemon off for the rest of the day so the report gets one clean commit attribution.
46. Add a per-merge checklist in CONTRIBUTING.md pointing at `docs/MERGE_CHECKLIST.md` (T18).

### Verification regression-catchers
47. Add `internal/server` race-tagged benchmark for the new T12 path under load (1k concurrent agent-graph requests).
48. Add `TestEvalObservabilityGradeZeroOnEmptyTrace` so `ComputeStats` doesn't regress on edge cases.
49. Add fuzz test on `internal/model/agent.go` for the graph builder.

### One housekeeping commit for symmetry
50. `make embed-static` + `make build` + commit `internal/server/static` so the bundled frontend assets reflect the actual current `web/dist`. (Was not in this session's scope, but the build is stale relative to the latest `web/src/types.ts` if any of those touched the export surface.)

---

## g) Questions I CANNOT figure out myself

1. **T24 — which fork-only commits are worth filing upstream?** The T06+T07 fix (OutcomeKnown + cross-message pairing) is small, self-contained, well-tested, and arguably useful to upstream. The T12 (s.mu order) refactor is also small but exposes fork-internal structure (the agent-graph cache eviction lives in `internal/server/server.go`, but the upstream doesn't have a Crush adapter). The Crush adapter itself is fork-only by definition (it consumes a fork-only SDK). What's your appetite for filing PRs upstream, and on what cadence?

2. **CHANGELOG.md cadence.** Per `AGENTS.md`: "user-visible behavior changes go in CHANGELOG.md". This session shipped 16 user-visible commits but I added 0 CHANGELOG entries. Are you (a) batching per-release ("I'll cut v0.4.0 next week and roll them all in then"), (b) wanting per-commit entries (which I can do retroactively now), or (c) considering the per-test/per-doc commits noise and prefer a single "post-merge cleanup" entry covering T06–T27?

3. **Should I run the `verify` skill (`/home/lars/forks/mindwalk/.claude/skills/verify/SKILL.md`) now?** It would launch the web UI against the v0.3.0 + T06/T07 fixture and visually confirm (a) the error observability chip now reads "exact" instead of "estimated", (b) the cross-message results show up as known outcomes in the timeline, (c) the new merge checklist doc renders in dev. Probably worth 5 minutes, but it requires the dev server to bind to a free port — which means it's interactive and might block on the user's sign-in flow.

---

## Files added or modified this session

| File | Lines | Why |
|------|-------|-----|
| `go.mod` / `go.sum` | (pre-existing bump) | v0.2.1 → v0.3.0 (in `72e7a59`). |
| `internal/adapter/crush/parts.go` | +17 / -6 | OutcomeKnown: true on both ToolResultPart + ShellCommand folds. |
| `internal/adapter/crush/sessions.go` | +50 / -4 | `resultFor` helper, cross-message result fold loop, Errors: Exact upgrade, IterMessages trade-off doc. |
| `internal/adapter/crush/fixture_test.go` | +55 / -0 | TestFixtureErrorObservability regression test + BenchmarkFixtureBuildAgentGraph. |
| `internal/adapter/crush/todo_spike_test.go` | +77 / -0 | DecodeTodos spike (T29). |
| `internal/server/server.go` | +22 / -4 | T12 (drop s.mu before agent-graph disk write) + T14 (fingerprintPath comment) + T23 (drop port-0 no-op). |
| `internal/model/trace_schema_parity_test.go` | +108 / -0 | T19 schema↔TS parity test. |
| `docs/MERGE_CHECKLIST.md` | +60 / -0 | T18. |
| `AGENTS.md` | +16 / -0 | T10 (Crush v0.3.0 paragraph). |
| `README.md` | +8 / -0 | T11 (observability → evaluation paragraph). |
| `TODO_LIST.md` | +9 / -7 | T21 close (fixture was already correct), T24 surface, Tier 0-2 batch reference, SSE dedup close. |

Nothing reverted; nothing garbage. Working tree clean.
