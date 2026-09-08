# Status Report: IterMessages Streaming Adoption + TODO Closeout

- **Date:** 2026-09-07 21:51 CEST
- **Scope:** This session only — executed the two actionable TODO_LIST items
  (Adopt `DB.IterMessages`, close out the `DecodeTodos` spike), verified, and
  closed the docs loop. No other codebase research was done.
- **Verdict:** The TODO list's executable work is done. Two items remain
  blocked by design (guided tour, upstream-PR decision). Zero test, lint, or
  build regressions introduced.

> **Correction 2026-09-07 ~22:05 (post-write, owner decision):** guided tours
> are a **never-do** — the owner hates them and deleted them before on
> purpose. Section c.1 and next-step f.7 are voided; the blocked count drops
> to one (T24). The leftover tour CSS block was purged from `web/src/styles.css`
> in the same change, and AGENTS.md now records the ban.

---

## Headline numbers

| Metric                                | Value                                            |
| ------------------------------------- | ------------------------------------------------ |
| Go files changed                      | 2 (`sessions.go`, `agents.go` in crush adapter)  |
| Docs changed                          | 4 (`AGENTS.md`, `CHANGELOG.md`, `ROADMAP.md`, `TODO_LIST.md`) |
| Full Go suite (12 packages)           | PASS                                             |
| Crush adapter with `-race`            | PASS                                             |
| golangci-lint warnings                | 211 before == 211 after (A/B via git stash)      |
| `nix develop -c make test`            | exit 0 (Go + frontend build)                     |
| Items removed from TODO_LIST.md       | 2 (one was stale-shipped, one shipped today)     |

---

## a) FULLY DONE

1. **`Adapter.Parse` streams via `go-crush-data.IterMessages`**
   (`internal/adapter/crush/sessions.go:280`). No longer materializes one
   slice per session. Removed the comment that claimed streaming "requires
   restructuring" — that claim was false: the cross-message tool_call/result
   pairing already resolves through the `pending`/`results` maps, so no
   earlier message is ever revisited. Replaced with a comment stating why
   streaming is safe, so the wrong belief does not regress.
2. **`readAgentLaunches` streams too** (`internal/adapter/crush/agents.go:284`).
   Beyond the TODO's literal scope (it named only `sessions.go`), but the
   identical materialize-then-scan pattern on the agent-graph path; same
   one-pass accumulator structure.
3. **SDK error semantics verified from source before editing** (module cache,
   `messages.go:49`): errors are yielded as `(Message{}, err)` mid-iteration
   and stop it; a missing session yields zero messages; `Parse` pre-verifies
   the session via `Session()` anyway. Error contract preserved
   (`"read crush messages: %w"` wrapping).
4. **TODO_LIST.md closed out.** Removed the `IterMessages` row (shipped
   today) and the `DecodeTodos` spike row (shipped earlier in `e2b1ce8` but
   never removed — a prior-session miss). Fixed the stale
   "Backlog (T25–T32) parked below" note.
5. **CHANGELOG.md entry added** under Unreleased → Changed for the streaming
   adoption (the spike already had an entry).
6. **ROADMAP.md** gained the todo-state UI raw idea (DecodeTodos data path is
   proven; only a UI home is missing) and the stale "Set up Vitest" bullet is
   marked done (Vitest has been live since the SUPERB sprint).
7. **AGENTS.md** v0.3.0 passage rewritten: it previously said the APIs were
   exposed-but-unadopted in garbled prose; now states Parse and the launch
   reader stream, the spike test pins DecodeTodos, and the OutcomeKnown
   contract stays as-is. Also recorded the npm-only-in-devShell gotcha.
8. **Verification ladder, in order:** `go build ./...` immediately after the
   edit (LSP was already lying about `Messages` being called — build proved
   it), `gofmt`, crush adapter tests, full suite, `-race` on the touched
   package, lint A/B (211 == 211 through a stash/pop round trip), then
   `nix develop -c make test` exit 0.
9. **Caught and corrected my own pipeline masking** mid-session: the first
   full-suite run piped through `grep -v | head` and printed `EXIT=$?` from
   `head`, not `go test`. Re-ran with explicit exit capture
   (`GO_TEST_EXIT=0`, 12 `ok` lines, zero `FAIL`). This was exactly the trap
   recorded in the global AGENTS.md memory.

## b) PARTIALLY DONE

1. **The memory win is structural, not measured.** No benchmark was written
   or run to prove allocations/peak heap actually flattened for huge
   sessions. `TestParseLargeMessageHistory` passes (correctness), but the
   TODO item's core claim ("memory peak") has no number attached. A
   `benchstat` before/after or an allocs-pinned benchmark is missing.
2. **Mid-stream error path is untested.** No test forces `IterMessages` to
   yield an error after N messages (e.g. canceled context), so the
   `return nil, fmt.Errorf(...)` inside the loop body runs only in
   query-level failure scenarios at fixture scale.
3. **Frontend unit tests were not individually confirmed.** `make test` ended
   in the Vite build output and exited 0; I did not verify whether the Vitest
   suites (44 tests) run inside that target or only the build. My changes
   were Go-only, so risk is nil, but the "standard validation pass" coverage
   claim is unverified.
4. **TODO_LIST structure is hollowing out.** Medium Impact now holds only
   blocked items and Low Impact holds only a struck-through done row. The
   file needs a `docs-health` HARVEST/VERIFY pass rather than another row
   edit.
5. **This self-review** — by definition partial until you've read it.

## c) NOT STARTED

1. **Guided tour (T16)** — `CheatSheet.tsx:6` stub, no `GuidedTour.tsx`.
   Blocked on frontend design iteration; untouched.
2. **T24 upstream-PR decision** — T06+T07 (OutcomeKnown + cross-message
   pairing) are upstream-applicable; the choice to PR to `cosmtrek/mindwalk`
   is yours. Untouched.
3. **Todo-state UI surface** — parked as a ROADMAP raw idea this session;
   no UI work started (deliberately: needs a UI-home decision first).
4. **Everything else in ROADMAP themes 1–5** (adapter ecosystem, perf at
   scale, real-time streaming, test infra, frontend UX) — not researched
   this session per your instruction.
5. **Committing this session's work** — the working tree holds the 6-file
   diff uncommitted (committing without your explicit say-so is against my
   rules; the auto-commit daemon may pick it up).

## d) TOTALLY FUCKED UP

Nothing is broken. Honest list of what *did* go wrong, ranked:

1. **I briefly trusted a masked exit code.** The `… | grep … ; EXIT=$?`
   pattern reported success regardless of `go test`'s real status. Caught it
   one step later (my own memory file warns about exactly this), re-verified
   properly. Self-inflicted, zero damage, but it is the failure mode that
   produces false green banners.
2. **Stale-comment drift was shipped by an earlier session, not by me — but
   I executed against a TODO list whose sibling item (DecodeTodos spike) had
   silently shipped without its TODO row being removed.** I closed that row
   only because it happened to sit in the list I was working. If it had been
   elsewhere in the file, it would still be lying. The fork's own rule
   ("when an item ships, remove it here") was violated upstream of me.
3. **I suspected the auto-commit daemon when AGENTS.md "changed since read" —
   it was my own edit's mod-time update.** One wasted round trip; I checked
   `git log` before touching anything, so no harm done.
4. **The LSP reported a `Messages` wrapcheck warning on `agents.go:281` after
   the call no longer existed.** Stale cache. I cross-checked with a real
   `golangci-lint` run before believing anything — the right call, and the
   reason the A/B lint count is trustworthy.

## e) WHAT WE SHOULD IMPROVE

1. **Pin the streaming win with numbers.** Add a huge-session benchmark
   (allocs/op, peak heap) next to `BenchmarkFixtureBuildAgentGraph`, or run
   a one-off `benchstat` old-vs-new via a worktree. "Flat in memory" should
   be a measured sentence, not a confident one.
2. **Test the mid-stream error return.** Cancel a context after N messages
   and assert `Parse` returns the wrapped error, not a partial trace.
3. **Split `Parse`.** gocognit 78 (limit 30) — it applies session meta,
   emits five kinds of marks, and does pairing in one body. Extracting the
   mark emitters would make the streaming loop readable and drop the warning.
4. **Same treatment for `readAgentLaunches` (cyclop 15) and
   `BuildAgentGraph` (gocognit 39).**
5. **Decide the lint-debt policy for the crush package:** 211 warnings
   (varnamelen 47, testpackage 8, wrapcheck 8, unparam 4, err113, goconst,
   wsl_v5). Either fix or configure exclusions — `h`/`db` for handles is
   idiomatic Go; varnamelen fighting it is noise. A wrapcheck allowlist for
   the sealed SDK would remove recurring false positives.
6. **Close the TODO↔CHANGELOG loop in the same change.** The DecodeTodos
   drift shows the loop opens when code and list are updated in different
   commits. Make "remove the TODO row" part of the shipping commit's
   checklist.
7. **Confirm what `make test` actually gates.** If Vitest is not in the
   target, wire it in; if it is, document it (I could not tell from the tail
   of the log).
8. **`resultFor` is a linear scan per call** — O(calls × results). Fine at
   fixture scale; for huge sessions, index `parsed.results` by ToolCallID
   per message. Cheap fix, noticed while reading.
9. **Thread `context` through `Parse`/`readAgentLaunches`** instead of
   `context.Background()` — server-originated calls lose cancellation.
10. **Fixture gap:** the committed `crush.db` has zero todo rows, so the
    DecodeTodos spike test exercises only the negative path. A fixture
    session carrying todos would prove the positive path end-to-end.

## f) Up to 50 things to get done next

> Brainstorm, not commitment — ROADMAP/TODO fuel, mostly sourced from what
> this session touched or saw. Sorted roughly by impact.

| #   | Item                                                                                    | Impact | Source seen this session |
| --- | --------------------------------------------------------------------------------------- | ------ | ------------------------ |
| 1   | Decide T24: PR T06+T07 upstream or stay fork-only                                        | High   | TODO_LIST (blocked)      |
| 2   | Verify the "core playback feedback loop is broken" claim and fix the event summary card | High   | ROADMAP theme 5          |
| 3   | Benchmark streaming Parse on a synthetic huge session (allocs, peak heap)                | High   | This session's gap       |
| 4   | Mid-stream error-injection test for `Parse`                                              | High   | This session's gap       |
| 5   | Split `Parse` (gocognit 78 → under limit)                                                | Med    | LSP diagnostics          |
| 6   | Lint-debt policy for crush package (fix vs configure; 211 warnings)                      | Med    | golangci A/B run         |
| 7   | Guided tour T16 design + build                                                           | Med    | TODO_LIST (blocked)      |
| 8   | Todo-state UI surface (panel or timeline markers)                                        | Med    | ROADMAP idea added today |
| 9   | Fixture session with real todo rows (positive DecodeTodos path)                          | Med    | todo_spike_test.go       |
| 10  | Confirm/wire Vitest into `make test` gate                                                | Med    | make test log tail       |
| 11  | Index `parsed.results` by ToolCallID (drop `resultFor` linear scan)                      | Med    | sessions.go read         |
| 12  | Thread request context through adapter calls                                             | Med    | sessions.go read         |
| 13  | `docs-health` HARVEST of this report's section (f) into TODO_LIST/ROADMAP                | Med    | Status-report skill      |
| 14  | `docs-health` VERIFY sweep of AGENTS.md post-rewrite (catch remaining drift)             | Med    | AGENTS.md edit           |
| 15  | Re-verify Pareto backlog T25–T32 against current code (T29 already proved stale-prone)   | Med    | TODO_LIST note           |
| 16  | 100k-message stress test to find the first bottleneck                                    | Med    | ROADMAP theme 2          |
| 17  | Lazy-load project DBs during listing scan                                                | Med    | ROADMAP theme 2          |
| 18  | Cross-check parts parser against latest upstream Crush release                           | Med    | ROADMAP theme 1          |
| 19  | `mindwalk trace <session>` outside the adapter's own data dir (sessionDBIndex bootstrap) | Med    | AGENTS.md limitation     |
| 20  | Cut a release: Unreleased CHANGELOG section is ~400 lines since 0.0.0                    | Med    | CHANGELOG read           |
| 21  | Extract mark-emission helpers from Parse (model-switch, finish-reason, thinking)         | Low    | sessions.go read         |
| 22  | `Summarize` cyclop 13 refactor + nestif isAgent block                                    | Low    | LSP diagnostics          |
| 23  | `BuildAgentGraph` gocognit 39 refactor                                                   | Low    | LSP diagnostics          |
| 24  | goconst: `"error"` literal ×3 in sessions.go → constant                                  | Low    | golangci run             |
| 25  | unparam (4) + testpackage (8) resolution                                                 | Low    | golangci run             |
| 26  | errors.Is/As audit for `errors.AsType` migration candidates (Go 1.26)                    | Low    | err113/wrapcheck pattern |
| 27  | In-memory SQLite fixture copy so todo spike test can run parallel                        | Low    | spike test docstring     |
| 28  | Codify the stash/pop A/B lint-bench check as a script                                    | Low    | This session             |
| 29  | Frontend: command palette (Cmd+P), collapsible HUD                                       | Low    | ROADMAP theme 5          |
| 30  | Frontend: adapter health panel via `/api/adapters`                                       | Low    | ROADMAP theme 5          |
| 31  | Frontend: group sessions by project/date in rail                                         | Low    | ROADMAP theme 5          |
| 32  | Frontend: relative timestamps, harness colors, coverage gauge, error markers             | Low    | ROADMAP theme 5          |
| 33  | Lazy projects.json TTL cache                                                             | Low    | ROADMAP theme 2          |
| 34  | Connection-pool limits + WAL-safe concurrent reads                                       | Low    | ROADMAP theme 2          |
| 35  | Surface Crush `files` table as before/after diff viewer                                  | Low    | ROADMAP theme 1          |
| 36  | Generalize synthetic-path helper once a 2nd DB-backed adapter lands                      | Low    | ROADMAP theme 1          |
| 37  | Support another agent format (Aider/Goose/Cursor/Continue)                               | Low    | ROADMAP theme 1          |
| 38  | Real-time streaming infrastructure (theme 3 items)                                       | Low    | ROADMAP theme 3          |
| 39  | Test-infrastructure theme items (theme 4)                                                | Low    | ROADMAP theme 4          |
| 40  | Read remaining ROADMAP "Open questions" beyond #1 (unreviewed this session)              | Low    | ROADMAP structure        |
| 41  | Decide commit granularity for the current 6-file diff (code+docs together or split)      | Low    | Working tree state       |
| 42  | Allocs baseline assertion in CI for `BenchmarkFixtureParse`                              | Low    | CHANGELOG benchmark note |
| 43  | Fuzz-parity: same-message vs cross-message fold results                                  | Low    | fuzz_test.go existence   |
| 44  | Verify `docs/dynamic-rubric-evaluation.md` freshness at next docs pass                   | Low    | AGENTS.md reference      |
| 45  | Mark Seq semantics: marks use `len(pendingOrder)` — review intent                        | Low    | sessions.go read         |
| 46  | `make embed-static` regeneration discipline note after frontend changes                  | Low    | AGENTS.md dev section    |
| 47  | wrapcheck allowlist for sealed `go-crush-data` SDK errors                                | Low    | golangci run             |
| 48  | Consider `IterMessages` usage in `Stats`/other SDK paths if any materialize              | Low    | SDK API surface read     |
| 49  | Version the "streaming keeps memory flat" claim in docs once measured (#3)               | Low    | AGENTS.md edit           |
| 50  | Next-session review of this report: promote items 1–10, harvest 11–50                    | Low    | This report              |

## g) Questions I cannot figure out myself

1. **T24 (the standing blocker):** do you want T06+T07 PR'd upstream to
   `cosmtrek/mindwalk`, and does the Crush adapter go with it or stay
   fork-only? Everything upstream-applicable is staged on this decision.
2. **Is the memory peak a today-problem or a future-proofing problem?** I can
   measure synthetic sessions, but only you know whether real Crush databases
   on your machines are big enough that the streaming win needs a pinned
   benchmark now vs. backlog.
3. **Commit policy for this session's diff:** my rules forbid committing
   without your explicit say-so, the status-report skill's default says
   commit the report, and an auto-commit daemon runs in this repo. One
   combined commit, per-logical-change commits, or leave it to the daemon?

---

*Point-in-time snapshot. When bringing this current later, use
`docs-health` ANNOTATE mode — annotate inline, never rewrite.*
