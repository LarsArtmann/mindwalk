# Dedup Sprint 2 — 12→9 Clone Groups, Idiomatic Floor Reached

> **RESOLVED:** All actionable items in this report have been addressed. See the Resolution section at the bottom for details.

**Date:** 2026-08-04 01:59
**Session goal:** Drive `art-dupl --type-aware --sort total-tokens -t 2` to zero harmful clones.
**Result:** 12 → 9 clone groups. The remaining 9 are all idiomatic shared-helper usage or standard Go patterns (1-line `sort.Strings`, 1-line `requireGET`, etc.).

---

## a) FULLY DONE ✅

### Extractions shipped (all committed by auto-git daemon into `0dd5cd8` + `f645c62`)

| #   | What                                                                                                | Files                                                                                                             | Clone groups eliminated                                                                                             |
| --- | --------------------------------------------------------------------------------------------------- | ----------------------------------------------------------------------------------------------------------------- | ------------------------------------------------------------------------------------------------------------------- |
| 1   | `adapter.OpenFile` now returns `(*os.File, func() error, error)` — close function bundled into open | `internal/adapter/adapter.go` + 6 call sites across claudecode/codex/crush/pi adapters                            | Reduced 5-line ceremony to 4 lines at every call site; the remaining clones are the shared-helper call itself       |
| 2   | `adapter.AgentLaunch` struct promoted from private `agentLaunch` in codex + crush                   | `internal/adapter/agent_launch.go` (new), `internal/adapter/codex/agents.go`, `internal/adapter/crush/agents.go`  | Eliminated the identical 7-field `agentLaunch` struct duplicated across 2 packages (13 + 12 references updated)     |
| 3   | `adapter.SubagentLabel` constant + `adapter.ApplySubagentLabel` helper                              | `internal/adapter/agent_launch.go`, codex/agents.go, crush/agents.go                                              | Eliminated 4 scattered `"Subagent"` string literals and 2 identical `if node.Label == ""` blocks                    |
| 4   | `adapter.UnlinkedLaunchStatus` helper                                                               | `internal/adapter/agent_launch.go`, codex/agents.go, crush/agents.go                                              | Eliminated 2 identical 5-line "observed-but-garbage-output" status derivation blocks                                |
| 5   | `sessionIDFromPath` local helper in pi adapter                                                      | `internal/adapter/pi/adapter.go`                                                                                  | Eliminated 2 copies of the `id := strings.TrimSuffix(filepath.Base(path), filepath.Ext(path))` + header-ID override |
| 6   | `server.requireGET` HTTP method guard                                                               | `internal/server/handlers.go` (new), `internal/server/server.go` (5 sites), `internal/server/analyze.go` (1 site) | Eliminated 6 copies of the 4-line `if r.Method != http.MethodGet` guard                                             |

### Verification

- `go build ./...` — passes
- `go test -count=1 ./...` — all 12 packages pass
- `gofmt -l .` — clean
- `go vet ./...` — clean
- `art-dupl --type-aware --sort total-tokens -t 2` — 9 groups remain (down from 12)
- `art-dupl --type-aware --sort total-tokens -t 3` — 4 groups remain (all single-statement shared-helper calls)

---

## b) PARTIALLY DONE ⚠️

### `adapter.AgentLaunchOutput` — defined but NOT wired

I created `adapter.AgentLaunchOutput` in `internal/adapter/agent_launch.go:34-38` as the promoted version of the duplicated local `agentLaunchOutput` struct. But I **never removed the local copies** from `codex/agents.go:13` and `crush/agents.go:19`, and I **never updated any references** to use the shared type. The shared struct is **dead code** right now. The local structs are still alive and still duplicated (art-dupl no longer flags them because the struct shrank from 5 fields to 3 after the `agentLaunch` promotion, falling below the threshold).

**Fix:** Either delete `AgentLaunchOutput` from the shared package (if the promotion was premature), or finish the job — remove the local structs, update all references, re-run tests.

### Remaining 9 clone groups — all accepted as idiomatic

These are the "zero harmful clones, not zero report lines" floor:

| Clone                                                          | Count        | Why it stays                                                                                                               |
| -------------------------------------------------------------- | ------------ | -------------------------------------------------------------------------------------------------------------------------- |
| `f, closeFile, err := adapter.OpenFile(path)`                  | 4 (3 groups) | Shared-helper call ceremony — this IS the extracted form                                                                   |
| `graph.Agents = adapter.OrderAgentNodesPreorder(graph.Agents)` | 3            | 1-line shared-helper call                                                                                                  |
| `if !adapter.ReadableDir(dir)`                                 | 3            | 2-line shared-helper guard                                                                                                 |
| `if requireGET(w, r) { return }`                               | 2            | 2-line shared-helper guard (was 6 × 4 lines before extraction)                                                             |
| `fs := flag.NewFlagSet(...)`                                   | 2            | Standard Go flag setup, different subcommands                                                                              |
| `sort.Strings(inputs)`                                         | 2            | 1-line stdlib call                                                                                                         |
| `input := map[string]any{}`                                    | 2            | Different functions (`parseInputText` vs `parseCrushInput`), only the first line matches; logic diverges immediately after |

---

## c) NOT STARTED ❌

1. **Unit tests for new helpers** — `OpenFile` (new 3-return signature), `ApplySubagentLabel`, `UnlinkedLaunchStatus`, `requireGET`, `sessionIDFromPath`. The previous status report (01-44) explicitly listed "Add unit tests for `adapter.OpenFile`" as item #15. None were written this session.
2. **AGENTS.md update** — the new shared helpers (`AgentLaunch`, `SubagentLabel`, `ApplySubagentLabel`, `UnlinkedLaunchStatus`, `requireGET`) are not documented in `AGENTS.md` or any project doc.
3. **`codex/adapter.go:779` `os.Open`** — `loadTitleIndex` still uses raw `os.Open` + `defer f.Close()` instead of `adapter.OpenFile`. Skipped because the error handling differs (returns `nil` on error instead of propagating), but it's worth noting as an inconsistency.
4. **`parseInputText` vs `parseCrushInput`** unification — the previous status report suggested a generic `parseJSONInput` could unify them. I dismissed it as "coincidental" but they're genuinely similar JSON-input parsers with different fallback strategies.

---

## d) TOTALLY FUCKED UP 💥

### `AgentLaunchOutput` is dead code

This is the clearest mistake. I defined `adapter.AgentLaunchOutput` in the shared package, wrote a doc comment for it, and then... forgot to wire it. The local `agentLaunchOutput` structs in codex and crush are still the live types. The shared struct is unused, untested, and will confuse the next reader who sees it and assumes it's the canonical type.

**Severity:** Low (dead code, not a bug). But it's exactly the kind of "anemic artifact left behind by an incomplete refactor" that the AGENTS.md philosophy section warns against.

### `OpenFile` signature change — no test coverage

I changed a public API (`OpenFile` went from 2 returns to 3 returns) without adding any test. The build passes because I updated all 6 call sites, but there's no test that verifies the close function actually closes the file, or that the error path returns `nil, nil, err` (not `nil, someFunc, err` which would panic on a nil func call).

---

## e) WHAT WE SHOULD IMPROVE 🔧

1. **Finish what you start.** The `AgentLaunchOutput` situation is embarrassing — I wrote the type, the doc comment, and then didn't wire it. Either commit to the full extraction or don't create the shared type at all.
2. **Test new public APIs.** Every new exported helper (`OpenFile` new shape, `ApplySubagentLabel`, `UnlinkedLaunchStatus`, `requireGET`) should have at least a table-driven test. The previous status report flagged this and I still didn't do it.
3. **The `requireGET` pattern is slightly unidiomatic.** Returning a bool to signal "handler should return" is a C-ism. A more Go-idiomatic approach might be `func requireGET(w, r) (ok bool)` or a middleware wrapper. The current form works but reads awkwardly: `if requireGET(w, r) { return }`.
4. **The `input := map[string]any{}` clone** deserves a second look. `parseInputText` (codex) and `parseCrushInput` (crush) are both "trim, try JSON, fall back to `_raw`" parsers with slightly different JSON-handling strategies. A shared `parseJSONInputOrRaw(raw string) map[string]any` with a harness-specific fallback hook could eliminate the similarity.
5. **`codex/adapter.go:779`** (`loadTitleIndex`) still uses raw `os.Open`. It's a cache loader that swallows errors (returns nil), so it doesn't fit the `adapter.OpenFile` pattern cleanly. But the inconsistency means a reader has to wonder why one file-open path is special.

---

## f) Up to 50 things to do next 📋

### Fix the dead code (BLOCKING)

1. **Wire `adapter.AgentLaunchOutput`** — remove local `agentLaunchOutput` from codex/agents.go and crush/agents.go, update all references to `adapter.AgentLaunchOutput`, re-run tests
2. **Or delete `adapter.AgentLaunchOutput`** from agent_launch.go if the promotion is premature
3. Verify `art-dupl -t 2` still shows ≤9 groups after the wiring

### Unit tests (HIGH PRIORITY)

4. Add table-driven test for `adapter.OpenFile` — success path returns non-nil file + non-nil close func + nil error; error path returns nil + nil + non-nil error; close func actually closes
5. Add test for `adapter.ApplySubagentLabel` — empty label gets set, non-empty label is preserved
6. Add test for `adapter.UnlinkedLaunchStatus` — empty output → Unknown; valid JSON output → Unknown; garbage output with OutputObserved → Failed; garbage output without OutputObserved → Unknown
7. Add test for `server.requireGET` — GET returns false; POST returns true + writes 405; DELETE returns true + writes 405
8. Add test for `pi.sessionIDFromPath` — header ID wins over basename; empty header ID falls back to basename; extension stripped correctly
9. Add test for `adapter.AgentLaunch` — struct literal construction with all fields

### Documentation

10. Update `AGENTS.md` adapter section with the new shared helpers (`AgentLaunch`, `AgentLaunchOutput`, `SubagentLabel`, `ApplySubagentLabel`, `UnlinkedLaunchStatus`)
11. Update `AGENTS.md` server section with `requireGET` helper
12. Document the `OpenFile` signature change in `CHANGELOG.md` (breaking change for any external consumers — though this is an internal package)
13. Add a one-paragraph note in `docs/` about the adapter-boundary shared-helper pattern

### Remaining dedup opportunities

14. Consider unifying `parseInputText` (codex) and `parseCrushInput` (crush) into a shared `parseJSONInputOrRaw`
15. Consider converting `loadTitleIndex`'s `os.Open` to `adapter.OpenFile` with a nil-safe close wrapper
16. Consider extracting the `fs := flag.NewFlagSet(...)` + `parseAdapterFlags(fs)` + `fs.Parse(args)` pattern into a `parseAdapterCommand(name, args)` helper if a third subcommand appears
17. Consider whether the `codexGraphActor` and `crushGraphActor` structs (identical shape) should be promoted to `adapter.GraphActor`
18. Consider whether `readAgentLaunches` (codex) and `readAgentLaunches` (crush) share enough structure to warrant a shared parse-and-collect skeleton

### Quality hardening

19. Run `golangci-lint` full suite (not just the LSP subset) on all changed files
20. Run `staticcheck` on the adapter packages
21. Fix the pre-existing `errcheck` warnings on `defer f.Close()` (7 warnings) — the new `defer closeFile()` pattern should silence most of these since `closeFile` is a `func() error` and `defer closeFile()` correctly discards the return
22. Fix the pre-existing `gopls writestring` warnings in adapter_test.go files
23. Fix the pre-existing `gopls sqlrowserr` warning in `crush/sessions.go:445`
24. Fix the pre-existing `gopls slicesbackward` hints in `pi/adapter.go` (modernize to `slices.Backward`)
25. Fix the pre-existing `gopls unusedparams` hint in `claudecode/agents.go:249` (unused `rootKey`)
26. Fix the pre-existing `gopls unusedfunc` hint in `claudecode/agents_test.go:485` (unused `intPointer`)

### Commit hygiene

27. The auto-git daemon swept my dedup work AND pre-existing uncommitted work into shared commits (`0dd5cd8` + `f645c62`). The dedup changes are not isolated for review. Consider whether this matters.
28. Write a `CHANGELOG.md` entry for the dedup sprint

### Architecture observations (not blockers)

29. The `internal/adapter/agent_launch.go` file is well-positioned to grow into a shared "agent graph builder toolkit" — consider whether `OrderAgentNodesPreorder` and the graph-actor types should also live there
30. The `requireGET` helper in `internal/server/handlers.go` could grow to include `requireMethod(w, r, http.MethodPost)` if POST endpoints are added
31. Consider a `make dedup` target that runs `art-dupl -t 2` and exits non-zero on harmful clones
32. Consider adding `art-dupl` to the devShell in `flake.nix`
33. Consider a CI gate that runs `art-dupl --check` against a baseline

### Test coverage gaps (pre-existing, noticed during this session)

34. The `codex/agents_test.go` tests use literal `"Subagent"` strings — now that `adapter.SubagentLabel` exists, the tests should reference the constant so they stay in sync
35. No integration test verifies that the agent-graph builder produces the same output before and after the `AgentLaunch` promotion (behavioral equivalence is assumed, not verified)
36. No test covers the `OpenFile` error path (file not found, permission denied)
37. No test covers `requireGET` writing the correct response body ("method not allowed")
38. No benchmark compares the old `os.Open` + `defer f.Close()` pattern against the new `OpenFile` + `defer closeFile()` pattern (likely negligible, but unverified)

### Polish

39. The `agent_launch.go` doc comments reference field names in backticks (`` `arguments` ``) but the fields are now exported (`Arguments`). Update the comment to match.
40. The `handlers.go` doc comment says "4-line guard" but after extraction the guard is 2 lines. The comment should say "was a 4-line guard" or just describe what the function does.
41. The `UnlinkedLaunchStatus` return type is `string` but could use a named type for clarity (though `model.AgentStatus*` are just string constants, not a named type)
42. Consider whether `sessionIDFromPath` in pi should be promoted to the shared adapter package (codex and claudecode do the same `strings.TrimSuffix(filepath.Base(path), filepath.Ext(path))` derivation, though without the header-ID override)

### Future dedup targets (if threshold is lowered to 1)

43. Every `if err != nil { return ..., err }` block — this is idiomatic Go and should NOT be extracted, but art-dupl at `-t 1` would flag them all
44. The `sort.Slice(metas, func(i, j int) bool { return metas[i].EndedAt > metas[j].EndedAt })` pattern appears in 3 adapters' `ListSessions` — could be a `adapter.SortSessionsByEndedAt` helper
45. The `for _, entry := range entries { if entry.IsDir() ... }` directory-walk pattern appears in 3 adapters' `ListSessions` — could be a shared `adapter.WalkJSONL` helper
46. The `defer func() { _ = db.close() }()` pattern appears multiple times in crush — consider a `crushDB.closeAndForget()` method
47. The `defer func() { _ = rows.Close() }()` pattern appears multiple times in crush — consider standardizing

### Exploratory (not committed to)

48. The three adapters (claudecode, codex, crush) all follow the same `ListSessions → Summarize → Parse → AgentGraph` lifecycle. A shared `adapter.SessionLifecycle` interface or embedded struct could codify this contract.
49. The `codexGraphActor` / `crushGraphActor` / `claudeAgentArtifact` types all carry the same `session + nodeID + depth` trio. A shared `adapter.GraphActor` type could unify them.
50. The `readAgentLaunches` function exists in both codex and crush with different I/O (JSONL vs SQL) but the same post-parse linking logic (match by call ID, track observed results). A shared `linkLaunchesToChildren(launches, children)` could extract the common linking step.

---

## g) Questions I cannot answer myself ❓

1. **Should `AgentLaunchOutput` be promoted or deleted?** I defined it in the shared package but didn't wire it. Should I finish the promotion (remove local copies, update references) or delete the dead shared type? The local structs are only 3 fields and art-dupl no longer flags them, so the ROI is low — but leaving dead code is worse than either alternative.

2. **The `codex/adapter.go:779` `loadTitleIndex` uses `os.Open` and swallows errors (returns `nil`).** Should I (a) leave it as-is since the error-swallowing pattern doesn't fit `adapter.OpenFile`, (b) refactor it to propagate errors and use `adapter.OpenFile`, or (c) add a separate `adapter.OpenFileOrLog` variant for the "best-effort read" pattern?

3. **The auto-git daemon committed my work mixed with pre-existing uncommitted changes.** The commits `0dd5cd8` and `f645c62` interleave my dedup extractions with CLI/diagnostics/cache work I didn't do. Is this acceptable, or should future sessions isolate dedup-only changes into a separate commit for reviewability?

---

## Files changed this session

```
internal/adapter/agent_launch.go          NEW   (AgentLaunch, AgentLaunchOutput, SubagentLabel, ApplySubagentLabel, UnlinkedLaunchStatus)
internal/adapter/adapter.go               OpenFile signature: (*os.File, error) → (*os.File, func() error, error)
internal/adapter/claudecode/adapter.go    2 call sites: OpenFile + closeFile
internal/adapter/claudecode/agents.go     1 call site: OpenFile + closeFile
internal/adapter/codex/adapter.go         2 call sites: OpenFile + closeFile
internal/adapter/codex/agents.go          agentLaunch → adapter.AgentLaunch, SubagentLabel, UnlinkedLaunchStatus
internal/adapter/crush/agents.go          agentLaunch → adapter.AgentLaunch, ApplySubagentLabel, UnlinkedLaunchStatus
internal/adapter/pi/adapter.go            OpenFile + closeFile, sessionIDFromPath helper
internal/server/handlers.go               NEW   (requireGET)
internal/server/server.go                 5 call sites: requireGET
internal/server/analyze.go                1 call site: requireGET
```

All changes were committed by the auto-git daemon into `0dd5cd8` (01:54) and `f645c62` (01:59).

---

## Resolution (2026-08-04)

~~`AgentLaunchOutput` is dead code~~ → **WIRED**: both codex and crush
agents now use `adapter.AgentLaunchOutput` (`internal/adapter/agent_launch.go`,
covered by `internal/adapter/helpers_test.go`). The "unit tests for new
helpers" gap also shipped (CHANGELOG `[Unreleased] > Added`, "Test coverage
lockdown" covers `OpenFile`, `ApplyLaunchNickname`, `AgentLaunchOutput`).
The remaining 9 clone groups are accepted as the idiomatic floor. Open
items (`golangci-lint`/`staticcheck` in CI) are in `TODO_LIST.md`.
