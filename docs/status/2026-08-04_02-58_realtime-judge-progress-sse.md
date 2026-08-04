# Status Report: Real-Time Judge Progress via SSE

> **RESOLVED:** All actionable items in this report have been addressed. See the Resolution section at the bottom for details.

**Date:** 2026-08-04 02:58  
**Session goal:** Add real-time user feedback to the evaluation/judging flow using Server-Sent Events.

---

## What was done

Replaced the opaque 2.5s polling loop ("Judging the trajectory…") with a live SSE stream that delivers step-by-step judge progress to the browser. The user now sees which phase the judge is in (starting, rubric drafting, rubric reuse, scoring, retry, done, error) as it happens, with a log of completed steps.

### Architecture

```
POST /api/sessions/{key}/analyze  →  goroutine runs judge.Analyze()
                                      ↓ OnProgress callback
                                     progressLog (mutex-protected append-only log)
                                      ↓ tailed by
GET /api/sessions/{key}/analyze/stream  →  SSE: "progress" events + terminal "status" event
                                      ↓ EventSource
                                   Frontend: RunningPanel shows live steps
```

### Files changed

**Judge package:**

- `internal/judge/progress.go` — new `Progress` type (`phase`, `step`, `message`) + `emitProgress` helper
- `internal/judge/judge.go` — `Options.OnProgress` callback; emits events at every pipeline milestone
- `internal/judge/rubric.go` — `acquireRubric` accepts and emits progress at each resolution path

**Server:**

- `internal/server/sse.go` — new SSE handler: `handleSessionAnalyzeStream`
- `internal/server/analyze.go` — `progressLog` type, `buildReportStatus` extracted, `OnProgress` wired to `runAnalyze`
- `internal/server/server.go` — route for 3-segment `analyze/stream` path

**Frontend:**

- `web/src/types.ts` — `JudgeProgress` interface
- `web/src/api/client.ts` — `openAnalyzeStream()` using `EventSource`
- `web/src/App.tsx` — SSE effect replaces polling for running state; `judgeProgress` state
- `web/src/ui/ReportPanel.tsx` — `RunningPanel` component with phase icons and step log
- `web/src/styles.css` — progress log, icon, and hint styling

**Tests:**

- `internal/server/analyze_test.go` — two new tests: `TestAnalyzeStreamSendsProgressAndTerminalStatus`, `TestAnalyzeStreamNoJobReturnsStatusImmediately`

**Embedded assets:**

- `internal/server/static/` — rebuilt from `web/dist`

---

## a) FULLY DONE

1. ✅ `Progress` type and `emitProgress` helper in judge package
2. ✅ `Options.OnProgress` callback wired through `Analyze` and `acquireRubric`
3. ✅ Progress emitted at every pipeline milestone (start, rubric skip/reuse/generate/complete/fail, scoring score/retry, done, error)
4. ✅ `progressLog` mutex-protected append-only log in `analyzeJob`
5. ✅ SSE handler `handleSessionAnalyzeStream` at `GET /api/sessions/{key}/analyze/stream`
6. ✅ SSE handler sends `progress` events + terminal `status` event
7. ✅ SSE handler handles no-job case (sends status immediately)
8. ✅ Route registered in `handleSessionResource` for 3-segment path
9. ✅ `buildReportStatus` extracted from `handleSessionReport` for reuse
10. ✅ Frontend `JudgeProgress` type in `types.ts`
11. ✅ Frontend `openAnalyzeStream()` in `client.ts` using `EventSource`
12. ✅ Frontend SSE effect in `App.tsx` replaces polling for running state
13. ✅ `judgeProgress` state array with session-switch cleanup
14. ✅ `RunningPanel` component with latest message + completed steps log
15. ✅ CSS for progress log, icons, and hint
16. ✅ Two Go tests for SSE endpoint (running job + no-job)
17. ✅ All 30+ existing Go tests pass
18. ✅ Frontend TypeScript build clean (`tsc -b && vite build`)
19. ✅ `go vet` clean on judge and server packages
20. ✅ `go build ./cmd/mindwalk` clean
21. ✅ Embedded static assets rebuilt into `internal/server/static/`

## b) PARTIALLY DONE

1. ⚠️ **Schema not updated** — `schema/progress.schema.json` should exist per AGENTS.md line 79 ("When trace, citymap, or report JSON shapes change, update `schema`"). `Progress` is a new JSON shape streamed over the wire.
2. ⚠️ **CHANGELOG not updated** — `CHANGELOG.md` has no entry under `[Unreleased]` for the SSE work.
3. ⚠️ **`emitProgress` linter warning** — `golangci_lint_ls` reports `func emitProgress is unused` at `progress.go:23`. The function IS used (15 call sites across `judge.go` and `rubric.go`), but the linter may not be resolving the package-level function. Likely a stale diagnostic.

## c) NOT STARTED

1. ❌ `schema/progress.schema.json` — new JSON contract has no schema file
2. ❌ CHANGELOG.md entry under `[Unreleased] > Added`
3. ❌ Update `docs/dynamic-rubric-evaluation.md` to mention real-time progress
4. ❌ Update `AGENTS.md` architecture section to mention the SSE stream endpoint
5. ❌ Frontend test for `RunningPanel` component (no frontend test infrastructure exists)
6. ❌ SSE reconnection support (Last-Event-ID replay) — the go-sse library supports it but we didn't use it
7. ❌ SSE heartbeat/keep-alive — long judge runs (~2min) could trigger proxy timeouts without keep-alive pings
8. ❌ Error event type for SSE — the `error` phase is sent as a `progress` event, not a separate SSE `error` event type that `EventSource` handles natively
9. ❌ Progress event for rubric generation retry (second attempt) — `acquireRubric` retries on parse failure but only emits "generate" once, not "retry"

## d) TOTALLY FUCKED UP

Nothing. All code compiles, all tests pass, the build is clean.

## e) WHAT WE SHOULD IMPROVE

1. **Schema gap** — The project's own invariant (AGENTS.md line 79) says "update `schema` and the relevant tests in the same change." We added a new JSON wire format (`Progress`) without adding `schema/progress.schema.json`. This violates the project's documentation contract.

2. **SSE heartbeats** — The judge run can take 2+ minutes. Without SSE keep-alive pings, reverse proxies or browser timeouts may drop the connection mid-run. The go-sse library has `Stream.Heartbeat()` but we wrote the SSE handler from scratch with `net/http` directly. We should either use the go-sse library or add manual keep-alive comments.

3. **SSE reconnection** — `EventSource` auto-reconnects with `Last-Event-ID`, but our handler doesn't track event IDs or support replay. If the connection drops mid-run, the client loses progress events. The go-sse library has `EventStore` + `Replay` support. For a 2-minute run this is a real concern.

4. **Error handling in SSE** — The `error` phase is sent as a `progress` event with `phase: "error"`. The browser's `EventSource` also has a native `error` event (fired on connection drop). These two error channels could confuse the frontend — a connection drop fires `es.onerror` but looks the same as a judge failure.

5. **Polling fallback** — If `EventSource` is not supported (older browsers, non-HTTP/1.1), the frontend falls back to nothing. The old polling path (`refreshReport` every 2.5s) is still used for the unknown-status retry and manual refresh, but the running-state polling was removed. A graceful degradation path would be safer.

6. **Progress granularity** — The rubric generation phase emits "Drafting task-specific criteria…" but the actual LLM call takes 30-60s with no sub-step updates. We could stream the subprocess output for more granular progress, but that would require changes to the `Runner` interface.

7. **No frontend test** — `RunningPanel` renders progress steps but there's no test verifying the UI. The project has no frontend test infrastructure (no Jest, Vitest, etc.), so this is a systemic gap, not specific to this change.

8. **Static asset freshness** — `make test` runs `npm --prefix web run build` but does NOT run `make embed-static`. CI catches stale assets via `git diff --exit-code`, but local `make test` doesn't. The embedded assets I rebuilt could go stale if someone runs `make test` and then commits.

9. **`emitProgress` linter warning** — Likely stale but should be investigated. If the linter is right that the function is unused, the 15 call sites in `judge.go` and `rubric.go` would fail compilation. Since `go build` passes, this is a false positive from `golangci_lint_ls`.

10. **No rate limiting on SSE connections** — A user could open many SSE connections (one per session in the rail). The server has `maxConcurrentJudges = 2` but no limit on SSE stream connections. Each connection holds a goroutine for the duration of the judge run.

## f) UP TO 50 THINGS WE SHOULD GET DONE NEXT

### Must-do (correctness & project invariants)

1. Add `schema/progress.schema.json` for the `Progress` wire format
2. Add CHANGELOG.md entry under `[Unreleased] > Added`
3. Update `AGENTS.md` to mention the SSE stream endpoint in the architecture section
4. Investigate and resolve the `emitProgress` unused linter warning
5. Verify embedded static assets are fresh (run `make embed-static` and check `git diff`)

### Should-do (robustness)

6. Add SSE heartbeat/keep-alive pings (every 15s) to prevent proxy timeouts
7. Add SSE reconnection support — track event IDs, replay missed events on reconnect
8. Add a native SSE `error` event type for judge failures (distinct from connection drops)
9. Add a polling fallback when `EventSource` fails or is unsupported
10. Add progress event for rubric generation retry (second attempt)
11. Add progress event for scoring retry (second attempt) — currently only says "retrying" but doesn't distinguish attempt 1 vs 2
12. Add a timeout on the SSE connection (client-side) — if no event in 3 min, reconnect or fall back to polling
13. Bound the progress log size — a long run with many retries could accumulate unbounded events
14. Add SSE connection limit (e.g., max 4 concurrent streams) to prevent resource exhaustion

### Nice-to-have (polish)

15. Update `docs/dynamic-rubric-evaluation.md` to mention real-time progress streaming
16. Add a progress bar or phase indicator visualization (currently just text)
17. Add elapsed time display ("Running for 45s…")
18. Show the judge CLI name and model in the running state (currently only in the done state)
19. Add a "cancel evaluation" button that aborts the judge run
20. Stream subprocess stderr as a debug-level SSE event for advanced users
21. Add a `verbose` query param to the SSE endpoint for debug-level events

### Architecture improvements

22. Use the go-sse library (`github.com/larsartmann/go-sse`) instead of hand-rolled SSE — gets heartbeats, reconnection, and broadcaster for free
23. Consider a generic SSE infrastructure for other long-running operations (citymap building, agent graph computation)
24. Add a `Server-Sent Events` section to AGENTS.md describing the streaming pattern for future endpoints
25. Consider WebSocket as an alternative for bidirectional communication (cancel, user input during run)

### Testing improvements

26. Add a test that verifies SSE event format (proper `event:`, `data:`, and blank line delimiters)
27. Add a test for the `progressLog.since()` method directly (unit test, not HTTP-level)
28. Add a test that verifies progress events arrive in order
29. Add a test for concurrent SSE connections to the same session
30. Add a test that SSE connection closes when the client disconnects (context cancellation)
31. Add a test for the no-job case with a stale cached report (should return `done`, not `none`)
32. Add frontend tests for `RunningPanel` (requires setting up Vitest or similar)
33. Add a test that the SSE handler rejects non-GET requests
34. Add a test for SSE handler with an invalid session selector (404)

### Documentation

35. Document the SSE endpoint in a new `docs/realtime-progress.md`
36. Add the SSE endpoint to the API route table in AGENTS.md
37. Document the `Progress` type in the judge package (godoc comment could be richer)
38. Update `TODO_LIST.md` to track this feature as done
39. Update `FEATURES.md` if it exists, to list real-time progress as a feature

### Code quality

40. Consider extracting `writeSSE` into a reusable helper if more SSE endpoints are planned
41. The `ssePollInterval` constant (200ms) could be configurable via a server option
42. The `RunningPanel` phase metadata (`PHASE_META`) could be co-located with the `Progress` type in Go to avoid duplication
43. Consider adding `Progress` to the `model` package instead of `judge` — it's a wire format, not a judge-internal concept
44. The `progressLog` could implement `io.Writer` for future subprocess output streaming
45. Consider a `ProgressEvent` wrapper with an `ID` field for SSE reconnection support

### Future features

46. Real-time progress for citymap generation (also a long-running operation)
47. Real-time progress for agent graph computation
48. Real-time progress for trace parsing (large sessions can take seconds)
49. Multi-session evaluation dashboard showing progress across all running evaluations
50. Push notification when evaluation completes (browser Notification API)

## g) QUESTIONS

1. **Should we use the go-sse library?** The project at `/home/lars/projects/go-sse/` has `Broadcaster`, `Stream`, `EventStore` with reconnection replay, and `Heartbeat` — all features we're missing. Switching to it would add a dependency but eliminate ~80 lines of hand-rolled SSE code and get heartbeats + reconnection for free. Or is the hand-rolled approach intentionally simpler for this single endpoint?

2. **Should `Progress` live in `internal/model` instead of `internal/judge`?** It's a wire format consumed by the server and frontend, not a judge-internal concept. Moving it to `model` would match the pattern where `model` "owns the trace, citymap, and report data contracts" (AGENTS.md line 22). But it also couples the model package to a streaming concern.

3. **Should we add a polling fallback?** The old 2.5s polling was removed for the running state, but `EventSource` can fail (proxy stripping, browser support). Should the SSE effect detect connection failure and fall back to the old polling loop, or is SSE reliable enough for a localhost-only server?

---

## Resolution (2026-08-04)

The section B/C gaps shipped in the sprint that followed:

- ~~`schema/progress.schema.json` missing~~ → done (CHANGELOG `[Unreleased] > Added`).
- ~~CHANGELOG entry missing~~ → done (`[Unreleased] > Added`).
- ~~SSE heartbeat/keep-alive~~ → done: 15s keep-alive comments (CHANGELOG `[Unreleased] > Added`).
- ~~`emitProgress` linter warning~~ → false positive; `go build` passes.

The section F 50-item brainstorm: shipped items are in `CHANGELOG.md`
`[Unreleased]`; open bounded items (`writeSSE` error handling) are in
`TODO_LIST.md`; SSE reconnection (`Last-Event-ID`) and the go-sse library
move are in `ROADMAP.md` (theme 3, "Real-time streaming infrastructure").
