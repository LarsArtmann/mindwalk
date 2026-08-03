# Status: Crush Cwd Fix — Zero Targets / All-Unvisited Bug

**Date:** 2026-08-03 23:14  
**Session scope:** Single bug investigation and fix  
**Commit:** `72f91e2` (auto-committed alongside pre-existing staged work)

---

## The Bug

The 3D scene and HUD top bar showed **0** for edited/read/seen counts. Only the "unvisited" bucket had a non-zero count. The bottom rail (session list) was correct.

### Root Cause

`trace.Session.Cwd` was **never set** for Crush sessions. The `applySessionMeta` function in `internal/adapter/crush/sessions.go` explicitly left it empty with a comment saying "Parse [fills] it from individual message rows" — but **no code ever did**.

Without `Cwd`, the shared `normalizePath` function (`internal/adapter/adapter.go:736`) could not relativize the **absolute paths** that Crush tool calls use (e.g. `/home/lars/forks/mindwalk/internal/server/server.go`). Every absolute file path fell through to the "outside the repo" branch and was classified as an `OutsideTouch` instead of a `Target`.

Result: zero targets → `stats.fovea = 0`, `stats.parafovea = 0`, `stats.edited = 0` → HUD shows 0/0/0, all files counted as "unvisited", 3D scene shows no colored buildings.

### The Fix

Added `projectPathForDB(dbPath)` in `internal/adapter/crush/projects.go` — resolves the project working directory from the crush.db path by:
1. Consulting the `projects.json` registry (cached via `sync.Once` + `sync.Map`)
2. Falling back to path derivation (`<project>/.crush/crush.db` → `<project>`)
3. Guarding against returning the global data dir

Set `Cwd` in three places:
- **`Parse`**: `trace.Session.Cwd = projectPathForDB(db.path)` — before events are built
- **`Summarize`**: `meta.Cwd = projectPathForDB(db.path)`
- **`listAllProjectSessions` / `listSingleDB`**: `meta.Cwd = cwd` on every session

### Before / After (real session `crush-5bf66712dc6d6b0bc1f337da`)

| Metric       | Before | After |
| ------------ | ------ | ----- |
| fovea        | 0      | 15    |
| parafovea    | 0      | 7     |
| edited       | 0      | 3     |
| targets      | 0      | 42    |
| outside      | all    | 10    |
| targets w/ fileId | 0 | 34   |

---

## a) FULLY DONE

1. **Root cause identified** — traced the data flow from Crush DB → adapter → `BuildEvent` → `normalizePath` → `assignFileIDs` → `ComputeStats` → frontend reducer → HUD, and found the missing `Cwd`.
2. **Fix implemented** — `projectPathForDB` function + Cwd set in Parse/Summarize/ListSessions.
3. **Regression tests added** — `TestParseRelativizesAbsolutePathsFromCwd` (absolute path relativization) and `TestProjectPathForDBDerivation` (path derivation logic).
4. **All tests pass** — `go test ./internal/adapter/crush/...` and full `go test ./...` (including 124s server test suite).
5. **End-to-end verified** — built binary, served real Crush sessions from this machine, confirmed non-zero fovea/parafovea/edited counts and proper fileId assignment via the API.
6. **gofmt clean** — no formatting issues in changed files.

---

## b) PARTIALLY DONE

1. **Test fixture coverage gap** — The committed `testdata/crush/crush.db` fixture lives at `testdata/crush/crush.db` (NOT inside a `.crush` subdirectory), so `projectPathForDB` returns `""` for it. The fixture-based server test (`TestServerLoadsCrushFixtureSession`) passes but cannot verify the Cwd fix. The fixture's only tool call is an `agent` tool (no file paths), so it would not exercise path normalization even with a Cwd set.
2. **Global data-dir session Cwd** — Sessions from the global `~/.local/share/crush/.crush/crush.db` get `Cwd = ""` because `projectPathForDB` explicitly rejects the global dir. This is intentional (global sessions belong to Crush itself, not a user repo) but means those sessions still show 0 targets. This is correct behavior, but there is no test asserting it.

---

## c) NOT STARTED

1. **Frontend rebuild** — Did not run `make build` to regenerate `internal/server/static` embedded assets. Not needed (no frontend changes), but worth noting if someone tests via `make serve` without `--dev`.
2. **AGENTS.md update** — The AGENTS.md describes the Crush adapter but does not mention the Cwd derivation path or the `projects.json` registry dependency. Should document the project-path discovery chain.
3. **Fixture improvement** — The test fixture should be enhanced with file-reading tool calls (e.g. a `view` call with an absolute path) to prevent this class of regression.
4. **`schema/` update** — No schema shapes changed, but the `TraceSession.Cwd` field is now actually populated for Crush, which changes observable behavior.

---

## d) TOTALLY FUCKED UP

Nothing. The fix is correct, tested, and verified.

However — **one design smell to flag**: the `projectPathCache` uses `sync.Once` for initialization, meaning it loads `projects.json` exactly once per process lifetime. If a new Crush project is registered after mindwalk starts, its sessions will still resolve correctly via the path-based fallback (`<project>/.crush/crush.db` derivation), so this is not a correctness bug — but it means the registry is stale for the lifetime of a long-running `mindwalk serve`. The fallback makes this acceptable.

---

## e) WHAT WE SHOULD IMPROVE

### Code Quality (observed during this session)

1. **8 errcheck warnings** in `internal/adapter/crush/sessions.go` — unchecked `h.close()` returns in error paths (lines 78, 85, 92). These are fire-and-forget cleanup, but `errcheck` flags them. Should wrap with `_ = h.close()` or handle properly.
2. **2 errcheck warnings** in `internal/adapter/crush/adapter_test.go` — unchecked `handle.Close()` in test cleanup (lines 57, 63).
3. **2 errcheck warnings** in `internal/citymap/builder.go` — unchecked `f.Close()` in `isBinaryLike` and `countLines` (lines 171, 185).
4. **`b.Loop()` modernization** — `internal/adapter/crush/fixture_test.go` benchmarks use deprecated `b.N` pattern instead of Go 1.24+'s `b.Loop()`.
5. **`strings.Cut` simplification** — `internal/server/server.go:1121` uses `strings.IndexByte` where `strings.Cut` is cleaner (gopls hint).
6. **`min()` modernization** — `internal/server/server.go:571` uses an if-statement where Go 1.21+'s `min()` builtin works.
7. **`WaitGroup.Go`** — `internal/server/server.go:579` uses the old `wg.Add(1); go func() { ... wg.Done() }()` pattern instead of Go 1.25+'s `wg.Go(func() { ... })`.
8. **`slices.Contains`** — `internal/adapter/crush/sessions.go:57` uses a manual loop where `slices.Contains` is cleaner.
9. **Auto-commit message quality** — The commit `72f91e2` has a verbose, AI-generated message that bundles unrelated changes (LAN serving, multi-DB discovery, Cwd fix) into one commit. The Cwd fix should have been its own commit with a focused message like "fix: set trace.Session.Cwd for Crush sessions so file targets resolve."

### Architecture (observed during this session)

10. **Cwd discovery is adapter-internal knowledge leaking into multiple call sites** — `projectPathForDB` is called in Parse, Summarize, and both ListSessions variants. If the discovery logic changes, all four sites need updating. Consider having `scanSessionMeta` or `openDBForPath` stamp Cwd once.
11. **`normalizePath` silently drops targets when Cwd is empty** — For absolute paths with no Cwd, the path becomes an `OutsideTouch`. There is no warning, no metric, no way for a user to know their adapter is misconfigured. A debug-level log when `cwd == ""` and an absolute path is seen would have caught this bug immediately.
12. **The fixture cannot test path normalization** — The test fixture has no file-touching tool calls. Every regression test for path handling requires a synthetic in-memory DB, which means the committed fixture is only useful for agent-graph testing.

### Testing

13. **Server tests take 124 seconds** — `internal/server/server_test.go` is extremely slow. This discourages running the full suite during development. Consider splitting into fast/slow test groups or reducing I/O.
14. **No integration test for the "zero targets" symptom** — The regression test verifies the unit-level fix (absolute paths get relativized) but there is no test that loads a full trace through the server and asserts `stats.fovea > 0`.

---

## f) Up to 50 Things to Get Done Next

### Crush adapter hardening (high priority)
1. Add a `view` tool call with an absolute file path to `testdata/crush/crush.db` fixture so path normalization is covered end-to-end
2. Fix the 3 unchecked `h.close()` calls in `listAllProjectSessions` error paths
3. Fix the 2 unchecked `handle.Close()` calls in `newFixtureDB` test helper
4. Consider making `projectPathForDB` a method on `Adapter` so it can use `a.Dir` for explicit-dir mode
5. Add a debug log when `normalizePath` receives an absolute path with empty `cwd` — this is the smoke signal for misconfigured adapters
6. Write an integration test: load a Crush trace through the server, assert `stats.fovea > 0` and `stats.edited > 0` when the session has file-touching events
7. Document the Cwd discovery chain in AGENTS.md (projects.json → path derivation → empty for global)
8. Add a test for the global-data-dir rejection in `projectPathForDB`
9. Consider adding `cwd` as a column to Crush's sessions table schema (upstream feature request)

### Codebase-wide lint cleanup (medium priority)
10. Fix `errcheck` warnings in `internal/citymap/builder.go` (2 unchecked `f.Close()`)
11. Modernize benchmarks in `fixture_test.go` to use `b.Loop()`
12. Replace `strings.IndexByte` with `strings.Cut` in `server.go:1121`
13. Use `min()` builtin in `server.go:571`
14. Modernize `WaitGroup.Go` in `server.go:579`
15. Replace manual loop with `slices.Contains` in `sessions.go:57`
16. Fix `fmt.Sscanf` errcheck in `adapter.go:798` (`parsePathHits`)
17. Audit all other `errcheck` warnings across the codebase

### Server improvements (medium priority)
18. Split slow server tests into a separate `test_slow` tag or package
19. Add a `/api/debug/health` endpoint that reports adapter status, cache sizes, and scan timing
20. Consider warming the project-path cache on `New()` instead of lazy `sync.Once`

### Frontend (lower priority)
21. Add a console warning when a trace loads with 0 targets but non-zero events — surface misconfigured adapters in the UI
22. Show the session Cwd somewhere in the HUD or inspector so users can verify the adapter resolved the right project root

### Testing infrastructure
23. Add a CI matrix that runs tests with and without real Crush/Claude/Codex data
24. Create a richer test fixture with multiple tool types (read, edit, bash, grep) covering path normalization edge cases
25. Add property-based tests for `normalizePath` (absolute, relative, with/without cwd, symlinks)
26. Add a test that verifies `assignFileIDs` produces non-nil FileIDs for targets whose paths match citymap files

### Documentation
27. Update AGENTS.md with the `projects.json` registry dependency
28. Add a troubleshooting section: "If everything shows as unvisited, check that the adapter resolved the project Cwd"
29. Document the `projectPathForDB` resolution order in the crush adapter package doc comment

### Process
30. Request that the auto-commit daemon create separate commits for logically separate changes (the Cwd fix was bundled with unrelated LAN-serving work)
31. Add a pre-commit check that runs `go test ./internal/adapter/...` (fast subset) before allowing commits

---

## g) Questions I Cannot Answer Myself

1. **Should the `testdata/crush/crush.db` fixture be regenerated to include file-touching tool calls?** I can add rows to it, but modifying a committed binary fixture without your explicit approval feels risky — it could mask regressions in the fixture-generation process. Is there a `gencrushfixture` helper I should use, or should I hand-craft the SQL inserts?

2. **The auto-commit bundled my Cwd fix with pre-existing staged work (LAN serving, multi-DB discovery, pnpm lockfile). Should I create a separate commit for just the Cwd fix?** I did not author the other staged changes and am not sure if they are ready. I also was instructed never to use `git reset` or `git checkout`, so I cannot unstage them without your input.

3. **Crush's sessions table has no `cwd` column. Should we derive Cwd purely from `projects.json` + path inference (current approach), or should we push for an upstream schema change?** The current approach works for typical projects but breaks for sessions whose working directory moved or was renamed since the session ran.
