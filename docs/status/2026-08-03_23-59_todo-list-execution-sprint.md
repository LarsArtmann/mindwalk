# Status Report: 2026-08-03 23-59 — TODO List Execution Sprint

> **RESOLVED:** All actionable items in this report have been addressed. See the Resolution section at the bottom for details.

> Generated at the end of the first sprint through TODO_LIST.md (20 items).
> This report covers work done in this session only.

---

## a) FULLY DONE (9 of 20 tasks, verified green)

| #   | Task                              | What was done                                                                                                                                                                                                                                     | Evidence                                                                               |
| --- | --------------------------------- | ------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------- | -------------------------------------------------------------------------------------- |
| 1   | Fix `agents.go` multi-DB routing  | Extracted `allProjectDBs()` and `enumerateDBPaths()` helpers. All three methods in `agents.go` (`AgentGraphInputs`, `loadAgentChildren`, `readAgentLaunches`) now iterate every project database instead of calling `openReadOnly()` (single-DB). | `go test ./internal/adapter/crush/` passes; `go build ./...` clean                     |
| 2   | Commit uncommitted judge-CLI docs | Working tree was already clean; commit `c9fe352` already landed the doc/UI mention.                                                                                                                                                               | `git status` clean                                                                     |
| 3   | Regression tests for round-2 bugs | Added `TestFingerprintAgentGraphInputsHandlesSyntheticCrushPaths` and `TestLoadTraceAndMapDoesNotGarbageRootCrushPaths` to `server_test.go`.                                                                                                      | Both pass; covers the `crush://` path fingerprint and garbage-root bugs from `6c986d3` |
| 4   | Fix server test isolation         | Added `TestMain` in `main_test.go` that redirects `CRUSH_GLOBAL_DATA` and `XDG_DATA_HOME` to a temp dir. Fixed 6 analyze-test `Config{}` calls that were missing `CrushDir`/`PiDir`/`DisableCrush`.                                               | `go test ./internal/server/` went from **79.8s → 0.28s** (280x speedup)                |
| 7   | `--host` flag for `open`/`map`    | Both commands now accept `--host` and pass it to `server.Config`. Usage strings updated.                                                                                                                                                          | `go build ./cmd/mindwalk` clean                                                        |
| 9   | Fix errcheck warnings             | Fixed all errcheck warnings across `adapter.go` (`fmt.Sscanf`), `builder.go` (2x `f.Close`), `adapter_test.go` (2x `handle.Close`), `main.go` (`f.Close`).                                                                                        | LSP diagnostics show 0 errcheck warnings on changed files                              |
| 10  | Modernize Go idioms               | `b.Loop()` in fixture benchmarks, `slices.ContainsFunc` in sessions dedup, `min()` in server scan, `WaitGroup.Go` in server workers, `strings.Cut` in `summaryPath`, `range N` in test loop.                                                      | All tests pass                                                                         |
| 15  | CI workflow                       | Already existed at `.github/workflows/ci.yml` — runs `go test ./...` + embedded frontend verification.                                                                                                                                            | File present, no changes needed                                                        |
| 20  | `--host 0.0.0.0` in README        | Updated Quick Start command block and added a sentence about LAN access.                                                                                                                                                                          | README updated                                                                         |

---

## b) PARTIALLY DONE (1 task — in progress, NOT verified)

### Task 17: Make `sessionDBIndex` a field on `Adapter`

**What's done:**

- Added `dbIndex *sync.Map` field to `Adapter` struct in `adapter.go`
- Added `NewAdapter(dir string) Adapter` constructor
- Added `"sync"` import to `adapter.go`
- Updated `sessions.go`: removed package-level `sessionDBIndex sync.Map`, updated `listAllProjectSessions` to use `a.dbIndex.Store()`, updated `openDBForPath` to use `a.dbIndex.Load()`

**What's NOT done (CRITICAL):**

- **`go build` has NOT been run since the last edit** — the code may not compile
- `server.go:1227` `crushAdapter()` still constructs `crush.Adapter{}` / `crush.Adapter{Dir: explicit}` instead of `crush.NewAdapter(dir)` — so the server creates adapters with a nil `dbIndex`, which means multi-DB routing silently degrades to single-DB fallback in auto-discover mode
- No test verifies that two `Adapter` instances have isolated indexes
- The `sync` import in `sessions.go` may now be unused (it was imported for the `sync.Map` and `sync.Once` in `projects.go` — need to verify)
- TODO_LIST.md has NOT been updated to reflect this task's status

**Risk:** This is a half-applied refactor. The code is in a potentially broken state. If the user stops me here, the next session will find uncommitted, unverified changes.

---

## c) NOT STARTED (10 tasks)

| #   | Task                                          | Notes                                                                                             |
| --- | --------------------------------------------- | ------------------------------------------------------------------------------------------------- |
| 5   | Add tests for multi-DB discovery              | `loadProjectDBs`, `listAllProjectSessions`, `openDBForPath`, `projectPathForDB` — 0 test coverage |
| 6   | Verify web UI renders Crush sessions          | Requires browser; the `verify` skill exists but was not loaded                                    |
| 8   | Enrich test fixture with file-touching calls  | `testdata/crush/crush.db` has only an `agent` call; cannot exercise path normalization            |
| 11  | Cache `crush.db` reads across requests        | A long-lived server re-opens the DB per call                                                      |
| 12  | Persist agent-graph cache to disk             | Keyed by `(session_key, fingerprint)`                                                             |
| 13  | `mindwalk doctor` subcommand                  | Print adapter status, session counts, data-dir paths                                              |
| 14  | `mindwalk sessions` CLI subcommand            | Print the rail without starting the server                                                        |
| 16  | Schema coverage warning at startup            | Warn if Crush DB predates the read-files migration                                                |
| 18  | Frontend: warn on 0 targets + non-zero events | Surfaces misconfigured adapters in the UI                                                         |
| 19  | Show session Cwd in HUD/inspector             | Lets users verify the adapter resolved the right root                                             |

---

## d) TOTALLY FUCKED UP (nothing, but close calls)

**Nothing is irreversibly broken**, but there are real concerns:

1. **Task 17 is half-applied and UNVERIFIED.** The last `go build` was run BEFORE the `sessionDBIndex` → `dbIndex` refactor. If `sync` is now unused in `sessions.go`, or if the nil `dbIndex` path has a bug, the build is broken. **This must be the first thing fixed.**

2. **TODO_LIST.md is stale.** Only the High Impact section and `--host` were updated. The errcheck, modernize, CI, and README tasks are marked done in the todo tracker but NOT in TODO_LIST.md itself. The file should be updated to match reality.

3. **No commits were made.** All changes are uncommitted in the working tree. An auto-git daemon may or may not commit them. If the user wants clean, reviewable history, this is a problem.

4. **The errcheck fixes changed `defer rows.Close()` to `defer func() { _ = rows.Close() }()` everywhere.** This is correct but verbose. An alternative — making `close()` and `Close()` methods return nothing — was not considered. The pattern is consistent now but could be simplified with a helper.

5. **AGENTS.md was edited** to remove the "Known gap" note about agents.go multi-DB routing. This is correct since we fixed it, but the edit happened before the fix was verified end-to-end.

---

## e) WHAT WE SHOULD IMPROVE

### Process improvements

1. **Verify after EVERY change.** The session broke its own rule: the last `go build`/`go test` was run before the `dbIndex` refactor. The refactor is now in an unverified state.
2. **Update TODO_LIST.md incrementally**, not in batches. By the time the session was interrupted, the file was out of sync with reality.
3. **Commit in logical chunks.** All 9+ completed tasks are in one uncommitted blob. There's no way to review or revert individual changes.
4. **Load relevant skills before starting.** The `verify` skill (`/home/lars/forks/mindwalk/.claude/skills/verify/SKILL.md`) should have been loaded for the browser verification task. The `docs-health` skill should have been loaded for TODO_LIST.md maintenance.

### Code quality observations (noticed during this session)

5. **`sync.Once` in `projects.go`** (`projectPathInit`) is still package-level and caches across test runs. Even after making `sessionDBIndex` per-adapter, `projectPathForDB` still shares global state.
6. **`worktreeRootCache`** in `adapter.go:177` is also a package-level map with no mutex — race condition if multiple adapters scan concurrently.
7. **The server's `crushAdapter()` function** at `server.go:1227` is the single construction point for Crush adapters in production. If `NewAdapter()` isn't wired there, the `dbIndex` field is always nil.
8. **The `allSessionsQuery`** in `agents.go` fetches ALL sessions from every DB — this could be expensive with many projects. A `WHERE parent_session_id IS NOT NULL` filter would be more efficient.
9. **`listAllProjectSessions` still calls `projectPathForDB`** per-row inside the scan loop. With the per-adapter `dbIndex`, the index could also store the project path, avoiding the `sync.Once` global cache entirely.

### Testing gaps

10. **No test exercises the `enumerateDBPaths()` method** — the new code from task 1 has zero direct test coverage.
11. **The `singleCrushSource` test helper** added in task 3 is minimal. It doesn't implement `AgentGraphSource`, so agent-graph tests can't use it.
12. **No integration test** creates two project databases and verifies that `listAllProjectSessions` merges them correctly.

---

## f) Up to 50 things we should get done next

### Immediate (blocking / must-fix)

1. **Run `go build ./...` to verify task 17 compiles** — highest priority
2. **Run `go test ./...` to verify all tests pass** after task 17
3. **Wire `NewAdapter()` into `server.go:1227` `crushAdapter()`** so the server gets isolated `dbIndex`
4. **Update `TODO_LIST.md`** to mark tasks 9, 10, 15, 17, 20 as DONE with evidence
5. **Remove unused `sync` import from `sessions.go` if applicable** (check after build)

### High impact

6. Add tests for `enumerateDBPaths()` with 0, 1, and 2+ project databases
7. Add tests for `loadProjectDBs` with a mock registry
8. Add test for `openDBForPath` routing with a populated `dbIndex`
9. Add test for `projectPathForDB` with `.crush/` directory inference
10. Add test for `listAllProjectSessions` merging two databases
11. Enrich `testdata/crush/crush.db` with `read`/`write` tool calls (exercise path normalization)
12. Add `slices.ContainsFunc` to `allProjectDBs` global-DB dedup (was done but needs verification)
13. Fix `worktreeRootCache` race condition (package-level map, no mutex)
14. Fix `projectPathCache`/`projectPathInit` to be per-adapter instead of package-level

### CLI commands

15. Implement `mindwalk doctor` subcommand (adapter status, session counts, data-dir paths)
16. Implement `mindwalk sessions` subcommand (print rail without server)
17. Add schema coverage warning at startup (warn if Crush DB predates read-files migration)
18. Add `--crush-dir` to `doctor` output

### Performance

19. Cache `crush.db` reads across requests (connection pool or read cache)
20. Persist agent-graph cache to disk (`~/.mindwalk/agent-graphs/`)
21. Filter `allSessionsQuery` to `WHERE parent_session_id IS NOT NULL` in agent-graph builder
22. Store project path in `dbIndex` to avoid `projectPathForDB` per-row lookup

### Frontend

23. Add frontend warning when trace has 0 targets but non-zero events
24. Show session Cwd in the HUD/inspector panel
25. Verify web UI renders Crush sessions in a browser (load `verify` skill)
26. Add `/api/adapters` response to the frontend (already served, not consumed?)
27. Add a loading spinner for long agent-graph builds

### CI / tooling

28. Add `golangci-lint` to CI workflow (run alongside `go test`)
29. Add `go vet` to CI
30. Add frontend lint/typecheck to CI (`tsc --noEmit`)
31. Add `errcheck` as a dedicated CI step
32. Add race detector to CI (`go test -race ./...`)

### Code quality

33. Extract a `dbEnumerator` interface from the Crush adapter to decouple agent-graph from DB specifics
34. Move `sqlHandle` to a dedicated file (it's defined in `sessions.go` but used everywhere)
35. Add GoDoc examples to `NewAdapter`, `enumerateDBPaths`, `openDBForPath`
36. Add a `Close()` method on `Adapter` for lifecycle management (close cached DB connections)
37. Consider a `DBCache` struct that wraps `*sql.DB` with TTL-based invalidation

### Documentation

38. Update `CHANGELOG.md` with all completed tasks
39. Update `docs/crush.md` with the multi-DB routing changes
40. Document the `NewAdapter()` vs `Adapter{}` distinction in GoDoc
41. Add `--host` documentation to `docs/crush.md`
42. Update `AGENTS.md` with the `dbIndex` field and `NewAdapter()` constructor

### Testing

43. Add a test that two `NewAdapter()` instances have isolated `dbIndex` maps
44. Add a benchmark for `enumerateDBPaths()` with many project DBs
45. Add a test for `allProjectDBs()` de-duplication when global DB appears in registry
46. Add a test for the `summaryPath` function after the `strings.Cut` refactor
47. Add a test for `fingerprintAgentGraphInputs` with mixed real + synthetic paths
48. Add a test for `loadAgentChildren` iterating multiple databases
49. Add a property test: `enumerateDBPaths` always returns de-duplicated paths
50. Add a test that `TestMain` isolation actually works (verify no host FS access)

---

## g) Questions I CANNOT answer myself

1. **Should `NewAdapter()` become the ONLY way to construct an `Adapter`?** Right now `Adapter{Dir: dir}` still works (with a nil `dbIndex`). Making `NewAdapter` the sole constructor would be safer but breaks the zero-value adapter pattern used in tests (`Adapter{Dir: dir}`, `Adapter{WorkingDir: tmp}`). The server's `crushAdapter()` is the other construction site. This is a design decision, not a mechanical fix.

2. **Should I commit the work done so far as one commit, or split into logical chunks?** The auto-git daemon may commit everything as one blob. If you want clean history (one commit per task, or at least one per impact tier), I should commit now before continuing. The working tree has changes across: `agents.go`, `sessions.go`, `adapter.go`, `server.go`, `server_test.go`, `main_test.go`, `analyze_test.go`, `main.go`, `builder.go`, `fixture_test.go`, `README.md`, `AGENTS.md`, `adapter_test.go`.

3. **Should the `verify` skill (browser verification) be attempted in this session?** It requires building the frontend (`make setup && make build`), starting the server, and driving a browser. It's the only TODO item that needs external tooling I haven't verified is installed. I don't know if `pnpm`/`node` are available in this environment.

---

## Resolution (2026-08-03 → 2026-08-04)

9 of 20 tasks shipped this session; the remaining 11 shipped across the
subsequent hardening and superb sprints. Task 17 (`sessionDBIndex` →
per-Adapter `dbIndex`) was completed and verified in the next session
(`NewAdapter` wired into `server.go`). All CLI subcommands, the disk cache,
and the schema warning landed (CHANGELOG `[Unreleased] > Added`). Open
bounded items are in `TODO_LIST.md`.
