# Status Report: Hardening Sprint — Race Fixes, Lifecycle, Tests, and a Critical Bug Discovery

**Date:** 2026-08-04 01:37
**Session goal:** Execute the 50-item improvement plan from the previous self-assessment
**Outcome:** 8 of 47 planned tasks completed; 1 critical pre-existing bug discovered; CLI tests blocked

---

## a) FULLY DONE (verified this session)

### Tier 1: Critical correctness fixes (all 4 items)

1. **`worktreeRootCache` race condition fixed** — Changed from `map[string]string` (no mutex, data-race under concurrent access) to `sync.Map`. The old plain map was a latent race bug that `-race` would flag. `worktreeRoot()` and `worktreeRootCache` in `adapter.go` now use `Load`/`Store`. Test `TestSessionDirPrefersProjectFixture` updated to use `worktreeRootCache.Clear()`. Verified with `go test -race`.

2. **`Close()` method added to crush Adapter** — `Adapter.Close()` iterates `dbCache` via `Range` and closes every cached `*sql.DB` handle. Safe to call multiple times; nil-safe for zero-value Adapters. This prevents the connection pool leak that was leaking 90+ `*sql.DB` handles on every server shutdown.

3. **`Server.Close()` added** — Iterates `s.adapters`, type-asserts each to `adapter.Closer`, calls `Close()`. Adapters that don't implement `Closer` (claudecode, codex, pi) are skipped. Returns the first error encountered. Defined at `server.go` after `New()`.

4. **`projectPathCache`/`projectPathInit` moved to Adapter struct** — The package-level `sync.Map` + `sync.Once` globals in `projects.go` are replaced by `projectPathStore` (a struct with its own `cache` and `once`), stored as `Adapter.projects *projectPathStore`. `NewAdapter` initializes it. `projectPathForDB` is now a method `(a Adapter) projectPathForDB(dbPath string)` that checks `a.projects` when non-nil, then falls back to `inferProjectPath()`. All 4 call sites in `sessions.go` updated. All 6 test call sites updated. Zero-value `Adapter{}` falls back to path inference only (backward compatible).

### Tier 2: Testing gaps (T2.01 + T6.03 + T6.04 done in one pass)

5. **`warnIfOldSchema` fully tested and improved** — Two new tests: `TestWarnIfOldSchemaDetectsMissingColumns` (creates a DB missing all expected columns, asserts warning fires and path is recorded for deduplication) and `TestWarnIfOldSchemaSkipsGoodSchema` (creates a DB with all columns, asserts no warning). The function was also fixed and improved:
   - **Fixed `QueryRow` bug** — The old code called `h.db.QueryRowContext(...)` and then looped with `for row.Scan(&col) == nil`, but `QueryRow` returns a single `*Row`, not `*Rows`. A `QueryRow` can only be scanned once. Changed to `QueryContext` + `rows.Next()` loop.
   - **Expanded column checks (T6.03)** — Now checks for `model`, `provider`, AND `parent_session_id` (was only `model`). Missing columns are listed in the warning message.
   - **Deduplication (T6.04)** — `warnedOldSchema *sync.Map` field on Adapter; `LoadOrStore` ensures each database path is warned about at most once per adapter instance.

---

## b) PARTIALLY DONE

### CLI tests for `sessions` and `doctor` (T2.02 + T2.03)

- **Test file created** (`cmd/mindwalk/cli_test.go`) — 5 tests: `TestRunDispatchesSessions`, `TestRunDispatchesDoctor`, `TestListSessionsPrintsHeaders`, `TestDoctorPrintsDataDirectories`, `TestRunUnknownCommand`.
- **Tests HANG and then TIMEOUT** — The test binary ran for 600 seconds (Go's default timeout) before being killed. The goroutine dump shows 800+ `database/sql.(*DB).connectionOpener` goroutines.
- **Root cause discovered:** The `parseAdapterFlags` function in `main.go` has a **critical pre-existing bug** that silently ignores ALL flags it parses. See section d) below.

### Flag consolidation (T3.01)

- `serve` and `open` were refactored to use `bindServeFlags` and `openSingle` helpers, eliminating the inline flag duplication. The `adapterFlags` + `parseAdapterFlags` pattern now backs all four commands (`serve`, `open`, `sessions`, `doctor`).
- **But** `parseAdapterFlags` itself is broken (see section d), so the consolidation propagates the bug.

### Shared adapter helpers extracted

- `adapter.HomePath()`, `adapter.UserHomeDir()`, `adapter.ReadableDir()`, `adapter.OpenFile()`, `adapter.NotRecognizedErr()` added to `internal/adapter/adapter.go`.
- `claudecode`, `codex`, and `pi` adapters updated to use these helpers, removing duplicated `os.UserHomeDir()` / `os.Stat()` / `fmt.Errorf(...)` patterns.
- **But** these changes are mixed into the same working tree as the broken CLI tests, so they can't ship independently.

---

## c) NOT STARTED

37 of the 47 planned tasks were never started because the session was consumed by the CLI test hang investigation and the `parseAdapterFlags` bug discovery. The full list is in the todo list.

---

## d) TOTALLY FUCKED UP

### 1. CRITICAL: `parseAdapterFlags` dereferences pointers before `Parse` — ALL CLI flags silently ignored

This is a **pre-existing bug from the previous session** that I discovered while writing CLI tests. The function looks correct but is fundamentally broken:

```go
func parseAdapterFlags(fs *flag.FlagSet) adapterFlags {
    return adapterFlags{
        claudeDir: *fs.String("claude-dir", claudecode.DefaultDir(), "..."),
        noCrush:   *fs.Bool("no-crush", false, "..."),
        // ...
    }
}
```

`fs.String(...)` registers the flag and returns a `*string`. The `*` dereferences it **immediately**, capturing the **default value** into the struct. Then `fs.Parse(args)` runs and updates the flag's internal value — but the struct already holds the old default.

**Consequence:** `--no-crush` is ALWAYS `false`. `--crush-dir` is ALWAYS `""`. `--claude-dir` is ALWAYS the default. Every `mindwalk sessions` and `mindwalk doctor` invocation silently auto-discovers and scans every Crush database on the host, ignoring the user's flags. The `--no-crush` flag has never worked for `sessions` or `doctor`.

**Why the test hangs:** My CLI tests pass `--no-crush`, but the flag is ignored, so the crush adapter scans 90+ real project databases, opening a cached `*sql.DB` for each (via `dbCache`), spawning 800+ connection-opener goroutines. The test never completes because `listSessions` iterates all those databases synchronously while the goroutine count climbs.

**Fix:** `parseAdapterFlags` must return a struct of `*string` / `*bool` pointers (or use `fs.StringVar` / `fs.BoolVar` to write into pre-allocated fields). Then the caller dereferences AFTER `fs.Parse`.

### 2. My CLI test should have set `CRUSH_GLOBAL_DATA` to a temp dir

Even if `parseAdapterFlags` worked correctly, my test didn't isolate the Crush global data directory via `CRUSH_GLOBAL_DATA` env var (the way `TestMain` in `internal/server` does). A robust CLI test needs both flag correctness AND environment isolation.

### 3. I didn't verify the flag consolidation actually worked before writing tests against it

I refactored `serve`/`open` to use `bindServeFlags` and `openSingle`, but I only ran `go build` — never actually invoked the commands with flags to verify they parse correctly. The tests would have caught this if the `parseAdapterFlags` bug weren't masking the issue.

### 4. Mixed unrelated refactoring into the same working tree

The shared adapter helpers (`HomePath`, `ReadableDir`, `OpenFile`, `NotRecognizedErr`) are good changes but are mixed into the same uncommitted diff as the broken CLI tests and the `parseAdapterFlags` bug. These should have been separate commits.

---

## e) WHAT WE SHOULD IMPROVE

### Immediate (blocking)

- **Fix `parseAdapterFlags`** — Change to return pointer-based struct or use `Var` methods. This is a user-facing correctness bug: `--no-crush`, `--crush-dir`, `--claude-dir`, `--codex-dir`, `--pi-dir` have never worked for `sessions` and `doctor`.
- **Fix CLI test isolation** — Set `CRUSH_GLOBAL_DATA`, `XDG_DATA_HOME`, and `MINDWALK_HOME` to temp dirs in `TestMain` for `cmd/mindwalk` tests, same pattern as `internal/server/main_test.go`.
- **Split the working tree** — Separate the adapter helper extraction from the flag consolidation from the lifecycle fixes so each can be reviewed and committed independently.

### Architectural

- **Stop calling `*fs.String()` inline** — The Go `flag` package's API invites this bug. Adopt a project convention: always use `fs.StringVar(&target, ...)` or always return pointers from helper functions. Document this in AGENTS.md.
- **CLI commands need lifecycle management** — `listSessions` and `doctor` create Adapter instances via `sources()` but never call `Close()`. The new `Adapter.Close()` exists but isn't called from CLI paths. Add `defer` cleanup.
- **Test infrastructure for CLI commands** — The `cmd/mindwalk` package has no `TestMain`. Every test that constructs an Adapter risks scanning the host filesystem. Need the same env-var isolation pattern as `internal/server`.

### Process

- **Run `go test -race` on new tests before declaring done** — The race fix for `worktreeRootCache` was verified with `-race`, but the CLI tests were never run with `-race` before the timeout masked the issue.
- **Test with a realistic flag before writing extensive tests** — A single `TestNoCrushFlagActuallyWorks` smoke test would have caught the `parseAdapterFlags` bug in 2 minutes instead of discovering it through a 10-minute goroutine dump.

---

## f) Up to 50 things to get done next

### Critical (must fix before anything else ships)

1. Fix `parseAdapterFlags` — return pointers or use `Var` methods so flags actually work
2. Add `TestMain` to `cmd/mindwalk` with `CRUSH_GLOBAL_DATA`/`XDG_DATA_HOME`/`MINDWALK_HOME` isolation
3. Call `Adapter.Close()` from CLI commands (`listSessions`, `doctor`) after scanning
4. Write `TestParseAdapterFlagsRespectsNoCrush` — a focused smoke test that the flag is parsed
5. Verify `bindServeFlags` / `openSingle` consolidation didn't break `serve`/`open`/`map` flag parsing
6. Split working tree into logical commits: lifecycle fixes, adapter helpers, flag consolidation, schema warning improvements

### High priority (correctness & robustness)

7. Commit fixture generation logic as test helper (T2.04 — still not done)
8. Add disk-cache eviction for agent graphs (T3.02)
9. Add error logging to `storeAgentGraphToDisk` (T3.03)
10. Add version header to disk cache files (T3.04)
11. Log cache hits/misses at debug level (T3.05)
12. Make `doctor` actually open each DB and verify schema (T4.01)
13. `doctor`: check read permissions on data dirs (T4.02)
14. `doctor`: validate `projects.json` integrity (T4.03)
15. Add `--json` output to `mindwalk sessions` (T5.01)
16. Add `--harness` filter to `mindwalk sessions` (T5.02)
17. Add `--limit` to `mindwalk sessions` (T5.03)

### Medium priority (UX & polish)

18. Frontend: path truncation for long Cwd (T6.01)
19. Frontend: improve 0-target warning to distinguish misconfigured vs no-file-ops (T6.02)
20. CI: add `go vet` step (T7.01)
21. CI: add `golangci-lint` step (T7.02)
22. CI: cache Go modules (T7.03)
23. CI: run frontend tests (T7.04)
24. CI: add `.editorconfig` check (T7.05)
25. Document `MINDWALK_HOME` env var in README (T8.01)
26. Document `~/.mindwalk/agent-graphs/` in AGENTS.md (T8.02)

### Lower priority (nice to have)

27. Add `mindwalk version` subcommand (T9.01)
28. Add `--verbose`/`--quiet` global flags (T9.02)
29. Add `make doctor` target (T9.03)
30. Add `mindwalk cache clear` subcommand (T9.04)
31. Add `mindwalk cache status` subcommand (T9.05)
32. Add `--fresh` flag for sessions (T9.06)
33. Add connection pool size limit to DB cache (T10.01)
34. Benchmark DB connection cache (T10.02)
35. Extract `agentGraphDiskDigest` to shared utility (T10.03)
36. Frontend: agent-graph cache status in HUD (T10.04)
37. Frontend: DB cache status in doctor panel (T10.05)
38. E2E test: full session load pipeline (T10.06)
39. Stress test: 100+ DBs without FD exhaustion (T10.07)
40. Document cache key design decision (T10.08)
41. Write ADR for disk cache design (T10.09)
42. Investigate server test slowdown (T10.10)
43. Investigate git commit hash in cache key (T10.11)

### Process improvements

44. Add a "flag smoke test" convention — every new flag gets a test that verifies it's actually parsed
45. Add `-race` to the default `go test` invocation in CI
46. Enforce a max-goroutine check in tests (leaked connection poolers = test failure)
47. Add a `go.uber.org/goleak` test sentinel to `cmd/mindwalk` to catch goroutine leaks
48. Document the `parseAdapterFlags` bug pattern in AGENTS.md as a "known footgun"
49. Consider using `pflag` or `spf13/cobra` for CLI — the stdlib `flag` package's pointer-returning API invites this class of bug
50. Add a CONTRIBUTING.md note: "Always test your flags before committing"

---

## g) Questions I cannot figure out myself

### 1. Should I revert the `bindServeFlags` / `openSingle` flag consolidation, or fix `parseAdapterFlags` first and keep the consolidation?

The flag consolidation (T3.01) refactored `serve`, `open`, and `map` to share `bindServeFlags` + `openSingle` helpers. But it's built on top of the broken `parseAdapterFlags`. The consolidation is architecturally cleaner but it spreads the bug to `serve` and `open` (which previously had correct inline flag definitions). Should I revert the consolidation and fix `parseAdapterFlags` independently, or fix the bug in-place and keep the consolidated structure?

### 2. Should the shared adapter helpers (`HomePath`, `ReadableDir`, `OpenFile`, `NotRecognizedErr`) be a separate commit, or kept with the lifecycle changes?

These helpers are in `internal/adapter/adapter.go` and are consumed by `claudecode`, `codex`, and `pi` adapters. They're logically independent of the crush Adapter lifecycle fixes and the flag consolidation. But they're all in the same working tree. Should I split them into a separate commit for cleaner history, or ship them together since they're all "adapter hygiene"?

### 3. Should `parseAdapterFlags` return a pointer-struct or should each command define flags inline with `fs.StringVar`?

Two approaches:
- **A:** `parseAdapterFlags` returns `*adapterFlagPtrs` (pointers), callers dereference after `Parse`
- **B:** Each command calls `fs.StringVar(&target, ...)` inline (no shared helper)

Option A keeps the DRY pattern but requires discipline. Option B is more verbose but eliminates the bug class entirely. The previous session chose A and got it wrong. Which do you prefer?
