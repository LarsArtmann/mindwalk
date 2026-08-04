# Status Report: Crush Integration — Data Model & UI/UX

**Date:** 2026-08-04 03:18
**Session goal:** Implement the crush-integration-superb plan (44 tasks across 4 phases) and then critically self-review

---

## A) FULLY DONE

### Phase 1: Go Data Model (committed in `bed3e8e`)

- `model.TraceSession.Provider` field added (`internal/model/model.go`)
- `model.SessionMeta` gained `Provider`, `PromptTokens`, `CompletionTokens`, `Cost`
- `model.Event.ProviderExecuted` field added
- `model.AgentLinkMethodCrushAgentID = "crush-agent-id"` constant added (`internal/model/agent.go`)
- `adapter.ToolCall.ProviderExecuted` field threaded through to `BuildEvent`

### Phase 2: Crush Adapter Enrichment (committed in `bed3e8e`, `2c926b6`)

- **Provider tracking**: `applyMessageMeta` populates `trace.Session.Provider` (first non-null wins)
- **Model/provider switch marks**: `model-switch` marks emitted on mid-session model or provider changes
- **Token usage + cost**: `scanSessionMeta` populates `PromptTokens`, `CompletionTokens`, `Cost` from sessions table
- **Exact read observability**: `queryReadFiles()` queries `read_files` table, upgrades `Observability.Reads` to `exact`, clears `Weak` on matching targets; catches "no such table" and falls back gracefully
- **Finish reason marks**: `error`, `content_filter`, `canceled`, `max_tokens` → `finish-reason` marks with note
- **Thinking marks**: reasoning parts → `thinking` marks with duration from `started_at`/`finished_at` and truncated text
- **Shell command events**: bang-mode `shell_command` parts → deduplicated `bash` exec events (skips when a bash tool call with same command exists in same message)
- **Provider-executed flag**: `toolCallData.ProviderExecuted` → `adapter.ToolCall` → `BuildEvent` → `model.Event.ProviderExecuted`
- **Crush-specific link constant**: `exactCrushAgentNode` uses `AgentLinkMethodCrushAgentID` instead of misnomer `AgentLinkMethodCodexAgentID`

### Phase 3: Frontend (committed in `2c926b6`)

- TypeScript types: `provider`, `promptTokens`, `completionTokens`, `cost` on `SessionMeta`; `provider` on `Trace.session`; `providerExecuted` on `TraceEvent`; `thinking`/`finish-reason`/`model-switch` on `Mark.type`; `crush-agent-id` on `AgentLinkMethod`
- SessionRail: shows provider, token counts (`5k/12k tok`), and cost (`$0.42`) in session rows
- HUD: shows provider next to model — `claude-sonnet-4 (anthropic)`
- Timeline: `MARK_LABEL` entries + legend glyphs for `thinking` and `finish-reason`; CSS colors for all new mark types
- CSS: `--mark-thinking`, `--mark-finish-reason`, `--mark-model-switch` color variables + strip-mark and legend-glyph styles

### Phase 4: Schema & Tests (committed in `bed3e8e`)

- `schema/trace.schema.json`: `provider` on session, `providerExecuted` on events, new mark type enum values
- `schema/agent-graph.schema.json`: `crush-agent-id` in linkMethod enum
- 8 new adapter tests: provider populated, model-switch marks, read_files observability (exact + fallback), finish-reason marks (4 reasons), thinking marks with duration, usage+cost populated
- Updated shell_command test from "no events" to "emits exec event" + dedup test

### Validation (all green at time of commit)

- `go test ./... -count=1` — all packages pass
- `tsc --noEmit` — TypeScript compiles clean
- `go vet` — no issues
- `gofmt` — all files formatted

---

## B) PARTIALLY DONE

### `finished_at` column — scanned but NOT wired to user-visible value

- The query and `messageRow` struct include `finished_at` and scan it correctly
- But the value is never used after scanning — no per-message duration is computed or surfaced
- The plan called for per-message latency ("the agent spent 45 seconds thinking, then 3 seconds executing tools")
- **What's missing**: A `Duration` field on either `model.Event` or as enrichment to thinking/finish marks

### HUD provider-executed warning improvement

- `model.Event.ProviderExecuted` is populated in Go and typed in TypeScript
- But the HUD's `noTargetsIsMisconfigured` warning still says "check that the session's working directory matches the loaded repository" even when events are provider-executed
- The plan called for: "the HUD's 'no file targets' warning can then say 'provider-executed tool' instead"
- **What's missing**: The HUD doesn't check `providerExecuted` on events at all

### Frontend CSS for `model-switch` mark glyph

- The CSS class `.strip-mark.model-switch` exists but was not added to the Timeline legend UI
- The glyph exists in CSS but is not shown in the legend bar

---

## C) NOT STARTED (from the plan, intentionally deferred)

- `files` table → diff visualization (deferred — separate project)
- `todos` column → task progress (deferred — no UI surface)
- `updated_at` on messages → retry detection (deferred — low value)
- `metadata` on tool_results → structured display (deferred — no UI surface)
- MCP/hooks/skills visibility (deferred — no citymap representation)

---

## D) TOTALLY FUCKED UP

### D1: CRITICAL — Backward compatibility bug with old Crush databases

**The queries `listSessionsQuery`, `sessionByIDQuery`, and `messagesBySessionQuery` now unconditionally SELECT `cost` and `finished_at`. Old Crush databases that predate the migrations adding these columns will CRASH with `SQL logic error: no such column`.**

Verified by testing with an in-memory DB simulating the old schema:

```
listSessionsQuery ERROR: SQL logic error: no such column: cost (1)
messagesBySessionQuery ERROR: SQL logic error: no such column: finished_at (1)
```

The existing `warnIfOldSchema` / `schemaMissingColumns` pattern only prints a warning — it does NOT prevent the query from running. The code checks for `model`, `provider`, `parent_session_id` but NOT for `cost` or `finished_at`.

**Impact**: Any user with a Crush database from before the `cost` column migration will see `ListSessions`, `Summarize`, and `Parse` all fail with SQL errors. This is a regression — before this change, those queries worked on old DBs.

**Status**: ~~Identified but NOT YET FIXED.~~ **FIXED** — dynamic
`build*Query()` functions now probe the schema once per handle and
substitute `0 AS cost` / `0 AS finished_at` when the columns are absent.
Logged in `CHANGELOG.md` `[Unreleased] > Fixed`. Covered by
`TestOldSchemaListSessionsDoesNotCrash` + `TestOldSchemaParseDoesNotCrash`.

### D2: Thinking mark duration uses reasoning part timestamps, not message-level `finished_at`

- The thinking mark duration comes from `reasoningData.StartedAt`/`FinishedAt` (seconds, from the reasoning content part)
- This is NOT the same as the `finished_at` column (milliseconds, from the messages table)
- The `finished_at` value is scanned and then discarded — wasted I/O
- Either use it or don't select it

### D3: Untracked files in working tree that I did not create

- `internal/adapter/helpers_test.go`, `internal/adapter/home.go`, `internal/adapter/input.go`, `internal/adapter/title.go`, `internal/server/handlers_test.go` are untracked
- Additional uncommitted changes on `cmd/mindwalk/main.go`, `cmd/rubriceval/main.go`, `internal/adapter/adapter.go`, `internal/adapter/agent_launch.go`, `internal/adapter/claudecode/adapter.go`, `internal/adapter/codex/adapter.go`, `internal/adapter/codex/agents.go`, `internal/server/server.go`
- These appear to be refactoring work (extracting shared adapter types) from another session or the auto-git daemon
- I have NOT touched them, per the "respect existing changes" rule

---

## E) WHAT WE SHOULD IMPROVE

1. **Fix the backward compat bug FIRST** — make queries resilient to missing `cost`/`finished_at` columns before any more work
2. **Actually USE `finished_at`** — compute per-message wall-clock duration and surface it in thinking marks or as event metadata
3. **Wire `providerExecuted` into HUD** — the warning message should change when events are provider-executed
4. **Add `model-switch` to the Timeline legend** — CSS exists but the legend row doesn't show it
5. **The `read_files` exact observability override is fragile** — it post-hoc overrides `ComputeStats` output instead of passing the grade through the computation. A future change to `ComputeStats` could silently undo it.
6. **The test fixture DB has no `read_files` table** — so the committed fixture can never test the exact observability path. The new tests use `newFixtureDB` with a custom seed, which is correct, but the committed `testdata/crush/crush.db` should be updated for integration coverage.
7. **The fixture has all-zero tokens/cost** — the committed fixture DB has `prompt_tokens=0, completion_tokens=0, cost=0.0` for all sessions. The rail will show `0/0 tok` for every fixture session, which is ugly. Either populate non-zero values in the fixture or suppress zero-value display.

---

## F) Next 50 Things To Do (prioritized)

### Critical (fix now)

1. Fix backward compat: old DBs without `cost`/`finished_at` crash on all queries
2. Wire `finished_at` into per-message duration for thinking marks
3. Add regression test: old schema (no cost, no finished_at) works end-to-end
4. Suppress zero token/cost display in SessionRail (don't show `0/0 tok · $0.00`)

### High value

5. Wire `providerExecuted` into HUD warning message
6. Add `model-switch` glyph to Timeline legend
7. Refactor read_files observability override to pass grade through `ComputeStats` instead of post-hoc override
8. Update committed test fixture DB with non-zero tokens, cost, and read_files table
9. Add test: shell command event appears in trace with correct exit code mapping
10. Add test: provider_executed flag set on events from provider-side tool calls
11. Add test: model-switch mark emitted on provider change (not just model change)

### Polish

12. Add test: deduplication of shell commands with bash tool calls across messages (not just within)
13. Add test: thinking mark duration is 0 when started_at/finished_at are missing or equal
14. Add test: finish-reason mark note includes the finish message when present
15. Add test: truncateNote helper handles edge cases (empty, exactly maxRunes, multi-byte)
16. Update AGENTS.md to document the new provider/usage/cost fields and mark types
17. Update ROADMAP.md to mark provider_executed and cross-check items as resolved
18. Add a `docs/dynamic-rubric-evaluation.md` note about the new mark types affecting rubric criteria
19. Consider whether `finish-reason` marks should affect the judge's evidence document
20. Consider whether thinking marks should affect the judge's evidence document

### Architecture

21. Extract shared query-building logic into a `queryBuilder` that adapts to schema version
22. Consider a `SchemaVersion` type that gates query construction cleanly
23. Move `truncateNote` to `internal/textutil` package where other truncation lives
24. Extract `formatTokens` from SessionRail into a shared `web/src/format.ts` utility
25. Consider whether `ProviderExecuted` belongs on `Event` or on a richer `ToolCall` event type

### Frontend

26. Show per-message duration in the event details panel (requires finished_at wiring)
27. Add a "thinking lane" in the Timeline for visual thinking duration bars
28. Add hover tooltip for thinking marks showing full truncated text
29. Add color differentiation between error (red) and content_filter (orange) finish reasons
30. Add cost badge in HUD (not just rail) when cost > 0
31. Add token economics panel in HUD (prompt/completion/total/cost)
32. Add provider icon/logo in SessionRail next to provider name
33. Consider grouping sessions by provider in the rail
34. Add a session-level "quality score" widget that uses finish-reason marks as input
35. Animate thinking marks with a subtle pulse (CSS keyframes)

### Testing

36. Add E2E test: full Parse → Trace → Frontend render with all new fields populated
37. Add E2E test: old schema DB produces a valid trace without errors
38. Add property test: mark seq numbers are monotonically non-decreasing
39. Add test: `queryReadFiles` handles database errors gracefully (returns nil)
40. Add benchmark: Parse performance with/without read_files query
41. Add test: concurrent Parse calls on the same database don't deadlock
42. Add test: shell command events get correct timestamps from parent message
43. Add test: provider_executed events have no file targets (server-side execution)
44. Add test: model-switch note format is stable for screenshot tests
45. Add test: the fixture DB parses with the exact observability path (after fixture update)

### Documentation

46. Document the new mark types in a `docs/mark-types.md` reference
47. Update `schema/README.md` (if exists) to explain the new optional fields
48. Add a CHANGELOG entry for the crush integration improvements
49. Document the backward compatibility approach for old Crush DBs
50. Add a `docs/crush-schema-mapping.md` table showing crush DB columns → mindwalk model fields

---

## G) Questions

1. **Should the queries be dynamically built based on schema detection, or should we use `try/catch` fallback queries?** The dynamic approach is more maintainable but touches more code; the try/catch is simpler but slower on old DBs (two queries per call). I lean dynamic but want your call.

2. **Should per-message `finished_at` duration go on `model.Event` (new `Duration` field), or should it enrich thinking/finish marks only?** Putting it on Event makes it visible in the event details panel but adds a field to a hot type; putting it on marks keeps Events lean but limits where duration appears.

3. **The uncommitted working tree has refactoring changes I didn't make (shared adapter types, renamed fields). Should I work around them, or should they be committed/stashed first?** I don't want to commit someone else's in-progress refactoring, but I also can't cleanly separate my backward-compat fix from their changes if they touch the same files.

---

## Resolution (2026-08-04)

Section D1 (backward-compat crash) is corrected inline above as **FIXED**.
The section B "partially done" items all shipped in the sprint that followed
(`bed3e8e` → `e4a1c22`):

- ~~`finished_at` scanned but not wired~~ → wired as `model.Mark.Duration` (CHANGELOG `[Unreleased] > Added`).
- ~~HUD `providerExecuted` warning~~ → fixed (CHANGELOG `[Unreleased] > Fixed`).
- ~~`model-switch` legend glyph~~ → fixed (CHANGELOG `[Unreleased] > Fixed`).

The section F 50-item brainstorm: shipped items are in `CHANGELOG.md`
`[Unreleased]`; genuinely-open bounded items (schema-validation test,
`finishData.Time` dead code, `queryReadFiles` rows.Err) are in
`TODO_LIST.md`; long-term items are in `ROADMAP.md`. Question 2 is settled
(duration lives on `Mark`, not `Event`).
