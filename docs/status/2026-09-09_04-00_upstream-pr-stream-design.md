# Status Report: Upstream PR Stream Design + Verified jj Slice Stack

- **Date:** 2026-09-09 04:00 CEST
- **Scope:** Everything since the last report
  (`2026-09-07_21-51_itermessages-streaming-todo-closeout.md`) — the T24
  upstream research, jj verification and rehearsals, the PR-split design, and
  the three test-verified slices. No unrelated research was done.
- **Headline:** The upstream PR stream is designed and its first three PRs are
  **built, tested, and chain-verified** in a sandbox. Nothing has left this
  machine. One real fork bug was discovered and fixed in the sandbox, not yet
  in the real repo.

---

## Headline numbers

| Metric                                  | Value                                                        |
| --------------------------------------- | ------------------------------------------------------------ |
| Real-repo commits authored this period  | 0 (repo history was rewritten by the user; my `54d95d7` folded into `98d291b`..`ad33cd9`) |
| Sandbox slice stacks built              | 2 (`/tmp/jj-rehearsal` demo, `/tmp/jj-stack` the real one)   |
| PR slices built + full-suite-verified   | 3 of 9 (+1 bonus)                                            |
| Upstream PRs opened / pushes to GitHub  | 0 / 0                                                        |
| Real bugs found in existing fork code   | 1 (`TestSummarizeMissingDatabase` fails in every clean checkout) |
| Upstream interactions found (all-time)  | 1 comment on issue #15 — no PRs, no issues authored          |

---

## a) FULLY DONE

1. **Upstream landscape research (all claims source-verified).**
   - T06 (OutcomeKnown) is **superseded upstream** by PR #16 (merged
     2026-08-10; `outcomeKnown` for Claude Code + Codex).
   - T07 (`ToolResult.ToolCallID` by-ID pairing) is genuinely absent upstream
     (`internal/adapter/adapter.go:48` — `OutcomeKnown` present, no
     `ToolCallID`). Viable.
   - T12 (s.mu order) likely invalidated by upstream #23 (server component
     boundaries refactor).
   - Upstream interaction history: exactly one comment by Lars on issue #15
     ("Live tailing…", 2026-08-12). Thread shows cosmtrek endorses library
     extraction (`stump-wtf/agent-trace` was blessed) — good signal for
     depending on published `go-crush-data`.
   - GitHub limitation verified from docs: **PRs from a fork must base on an
     upstream branch** — true cross-fork stacked PRs are impossible; the
     workflow is ordered PRs against `master` + mechanical restacking.
2. **jj 0.45.1 verified by running it, not reading about it.** Colocation
   (now the default), `split` by fileset with automatic descendant rebase,
   `git push --named` bookmarks, `rebase --skip-emptied`, `undo`, push
   safety being force-with-lease-like. No `jj git sync` and no `mergemerge`
   in 0.45.1 — stated and corrected.
3. **Keep-PRs-current loop proven live.** Simulated an upstream squash-merge
   of PR 1 in the sandbox: fetch → `rebase --skip-emptied` (landed slice
   auto-abandoned: "Abandoned 1 newly emptied commits") → bookmark delete →
   push. Verified on the bare remote: ancestry chain intact and **PR 2's
   diff no longer contains any landed crush-core lines**.
4. **Fix/feature question answered with evidence.** All 18 fork "Fixed"
   changelog items were premise-checked: every one targets fork-added code
   (`parseAdapterFlags`, `worktreeRootCache`, `gitDiffPaths`, `finishData` —
   none exist upstream). The upstreamable delta is refactor+feature only.
5. **PR stream designed (9 PRs + 1 bonus) — first three BUILT and verified:**
   - **PR1 `feat(model)`** — observability signals, `ProviderExecuted`, agent
     metadata, `trace.schema.json`, 7 mechanical `ComputeStats` call-site
     updates (4 prod, 3 test). 18 files, +592/−41. Full suite green.
   - **PR2 `refactor(adapter)`** — shared helpers, monolith→topic-file split,
     `ToolCallID`/`Closer`/`DiagnosticsSource` contract, go-humanize dep,
     go 1.26.5 directive. 26 files, +2509/−362. Full suite green.
   - **PR3 `feat(crush)`** — crush package + fixture + go-crush-data dep
     (package-atomic). 22 files, +5749/−1. Full suite green, **including the
     sandbox fix for the discovered bug**.
   - Chain pushed to `/tmp/jj-stack/remote.git`; `merge-base --is-ancestor`
     verified; per-PR diff sizes measured.
6. **Hidden couplings discovered by compiler, not guesswork:** the model
   signature change drags call sites in adapters, server, *and* a test file;
   schema must ship with model (the repo's own AGENTS.md rule); the Go
   directive bump rides PR2 (`new(1)` syntax in tests); judge needs nothing
   from crush (`IsWorkDir` already exists upstream in `cli.go`).

## b) PARTIALLY DONE

1. **PR4–PR9 are designed but not built.** File/hunk-mapped from the delta
   (server wiring ~+300, agent-graph ~+250, doctor ~+200, judge crush-CLI
   ~+300, judge SSE ~+280, web crush-support ~+100, `--host` ~+40) — all
   estimates, none compiled or tested.
2. **PR9's size estimate is the weakest** — no research done on the actual
   crush-harness hunks inside the +4608 web delta.
3. **The `Summarize` bug fix exists only in the sandbox.** Real master still
   carries the broken-untested behavior; offered to port, awaiting answer.
4. **Upstream CI gates unknown.** I gated slices on `go build`/`go test`,
   but never looked at what `cosmtrek/mindwalk`'s CI actually runs — an
   upstream-PR readiness gap.
5. **jj not colocated into the real repo.** Deliberate (user's repo,
   user's call) — everything ran in `/tmp` clones.

## c) NOT STARTED

1. **Any actual upstream filing** — 0 PRs, 0 pushes (correctly gated on
   your explicit go).
2. **Fork CI has never run** (`gh run list` is empty) — discovered this
   period; no workflow ever executed on LarsArtmann/mindwalk.
3. **Porting the sandbox stack into the real repo** (colocate → replay
   slices → push branches → `gh pr create`).
4. **Carried over, still untouched:** streaming memory benchmark (the
   `IterMessages` win is still unmeasured), `Parse` complexity split,
   crush lint debt (211 warnings), release cutting, T24 formal decision.
5. **TODO_LIST/ROADMAP harvest of this report's section (f)** — pending
   your go, since you are actively rewriting the repo's history and I
   won't race that.

## d) TOTALLY FUCKED UP

1. **I checked the wrong file for `judge.IsWorkDir`** (judge.go instead of
   cli.go), concluded "judge delta needed for PR3," designed around it —
   then discovered upstream already has it. One design iteration wasted on
   a bad premise. Caught by refusing to trust my own summary.
2. **My first PR1 design was wrong.** I proposed `ToolCallID` pairing as a
   standalone upstream PR before realizing no upstream adapter would ever
   set the field — it'd be dead code. Corrected: it rides PR2 as contract,
   PR3 as consumer. The corrected design is better; the first one shipped
   to you in chat was not.
3. **Slice 0 initially shipped without `schema/trace.schema.json`** —
   violating the repo's own written rule — and my earlier "slice 0 green"
   claim was partly **cache-masked**; the schema failure surfaced only
   during the final full-suite pass. Fixed via `jj edit` into the right
   slice. Two lessons in one mistake.
4. **Pipeline exit-code masking tripped me again.** `UPSTREAM_HAS=$?`
   captured `head`'s exit code, not grep's, and earlier `go test | grep`
   chains printed misleading `EXIT=0`s. Caught every time before acting,
   but I keep writing the same footgun despite my own memory file.
5. **First `go.mod` handling was sloppy** — a wholesale restore would have
   dragged the go-crush-data dependency into PR2 as an unused dep;
   corrected to per-slice `go get` (PR2: go-humanize only; PR3:
   go-crush-data + modernc.org/sqlite).

## e) WHAT WE SHOULD IMPROVE

1. **Run the fork's CI at least once** before filing anything upstream —
   it has never executed; every "green" so far is local-only.
2. **Read upstream's CI workflow before finalizing PR content** — the
   review bar is what upstream runs, not what we run.
3. **Codify the exit-code footgun:** never `cmd | filter; echo $?` —
   always capture the command's own status. This bit me three times across
   two sessions.
4. **Verify premises at the FILE level before designing around them**
   (the `IsWorkDir` lesson): grep the whole package, not the file I
   assumed.
5. **Disable test caching for slice-boundary verification**
   (`-count=1` always) — cache-masked failures nearly slipped a broken
   slice through as "green."
6. **Estimate discipline:** PR4–9 sizes are labeled estimates; replace
   them with measured numbers when the slices are actually built.
7. **The upstreaming plan should live in the repo** (a
   `docs/planning/2026-09-09_upstream-pr-stream.md` capturing the 9-PR
   design + couplings + restack workflow), not only in chat and /tmp.

## f) Up to 50 things to get done next

> Brainstorm, not commitment. (N) = new this report; (C) = carried over.

| #   | Item                                                                             | Source |
| --- | -------------------------------------------------------------------------------- | ------ |
| 1   | Decide: file the upstream PR stream now? (the standing T24 question)              | (N) |
| 2   | Port the `Summarize` clean-checkout bug fix to real master + CHANGELOG entry      | (N) |
| 3   | Enable/trigger fork GitHub Actions once — get real CI signal                      | (N) |
| 4   | Read upstream CI workflow; align each PR's validation to it                       | (N) |
| 5   | Build PR4 (server wiring + `/api/adapters`) into the verified stack               | (N) |
| 6   | Build PR5 (agent-graph endpoint + cache)                                          | (N) |
| 7   | Build PR6 (doctor + `Closer` lifecycle)                                           | (N) |
| 8   | Build PR7 (judge crush CLI + rubric improvements)                                 | (N) |
| 9   | Build PR8 (judge progress SSE)                                                    | (N) |
| 10  | Research the actual crush hunks in web/src; size PR9 properly                     | (N) |
| 11  | Build PR9 (web crush support) + `--host` bonus PR                                 | (N) |
| 12  | Write `docs/planning/2026-09-09_upstream-pr-stream.md` capturing the design       | (N) |
| 13  | Colocate jj into the real repo once history work settles                          | (N) |
| 14  | Push PR branches to LarsArtmann/mindwalk, open PRs with merge-order labels        | (N) |
| 15  | After each upstream merge: fetch → `rebase --skip-emptied` → push restack         | (N) |
| 16  | In PR descriptions, cite issue #15 thread for the library-extraction signal       | (N) |
| 17  | Add fixture session with real todo rows (DecodeTodos positive path)               | (C) |
| 18  | Benchmark streaming Parse (allocs, peak heap) — still unmeasured                  | (C) |
| 19  | Mid-stream error-injection test for `Parse`                                       | (C) |
| 20  | Split `Parse` (gocognit 78) / `readAgentLaunches` (cyclop 15) / `BuildAgentGraph` | (C) |
| 21  | Crush lint debt: 211 warnings — fix or configure (varnamelen 47, wrapcheck 8…)    | (C) |
| 22  | Index `parsed.results` by ToolCallID (drop `resultFor` linear scan)               | (C) |
| 23  | Thread request context through adapter calls                                      | (C) |
| 24  | Confirm Vitest is inside `make test` gate                                         | (C) |
| 25  | `docs-health` HARVEST of this report into TODO_LIST/ROADMAP (after history settles)| (C) |
| 26  | Re-verify Pareto backlog T25–T32 against current code                             | (C) |
| 27  | 100k-message stress test → first bottleneck                                       | (C) |
| 28  | Lazy-load project DBs during listing scan                                         | (C) |
| 29  | Cross-check parts parser against latest upstream Crush release                    | (C) |
| 30  | `mindwalk trace <session>` outside adapter data dir (sessionDBIndex bootstrap)    | (C) |
| 31  | Cut a release — Unreleased CHANGELOG section is enormous                          | (C) |
| 32  | `Summarize` cyclop 13 + nestif refactor                                           | (C) |
| 33  | goconst/unparam/testpackage lint cleanups                                         | (C) |
| 34  | `errors.AsType` migration audit                                                   | (C) |
| 35  | Todo-state UI surface (roadmap idea; DecodeTodos proven)                          | (C) |
| 36  | Frontend: event summary card during playback ("core playback feedback loop")      | (C) |
| 37  | Frontend: command palette, adapter health panel, rail grouping, timestamps        | (C) |
| 38  | projects.json TTL cache                                                          | (C) |
| 39  | Connection-pool limits + WAL-safe concurrent reads                                | (C) |
| 40  | Crush `files` table → before/after diff viewer                                    | (C) |
| 41  | Surface sandbox stacks' findings in PR bodies (couplings, call-site blast radius) | (N) |
| 42  | Decide fate of `cmd/rubriceval` delta (upstream has the tool — PR7 or fork-only)  | (N) |
| 43  | Decide web UX overhaul: fork-only forever or staged upstream follow-ups           | (N) |
| 44  | Consider upstream `.golangci.yml` offer (fork config, 261 lines — separate PR?)   | (N) |
| 45  | Add per-PR `--dry-run` push checks before real pushes (jj supports it)            | (N) |
| 46  | Record jj restack loop as a repo script or AGENTS.md snippet                      | (N) |
| 47  | Verify whether upstream maintainer prefers commit-series PRs over squash          | (N) |
| 48  | Draft PR1/PR2/PR3 bodies now (context is fresh; verify-before-filing pass)        | (N) |
| 49  | Check sandbox stacks still exist before relying on them (`/tmp` is volatile)      | (N) |
| 50  | Ask maintainer (issue #15 thread) whether a crush-adapter PR is wanted at all     | (N) |

## g) Questions I cannot figure out myself

1. **File upstream now or finish building PR4–9 first?** I can open PR1–3
   immediately (they're verified), or hold until the whole stream exists so
   you review the complete picture once. Both defensible; your call.
2. **Port the `Summarize` bug fix to real master now** (one line + CHANGELOG,
   makes your local suite honest in clean checkouts), or let it ride inside
   PR3 when the slices are ported?
3. **Fork CI: turn it on?** It has never run. Enabling Actions on
   LarsArtmann/mindwalk changes the validation posture for everything above
   — but it may also fail on first run and add noise while you're
   restacking history.

---

*Point-in-time snapshot. Annotate, never rewrite, when bringing current
later. HARVEST of section (f) into TODO_LIST/ROADMAP is deliberately
deferred until your history rewrite settles — say the word.*
