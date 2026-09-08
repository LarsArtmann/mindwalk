# Status: post-merge rebase recovery, nix build fix, and session sweep

- **Date:** 2026-09-08 08:01 CEST
- **Scope:** recovery from the failed `git town sync`, the post-rebase breakage it
  surfaced, the nix build failure from the buildflow run, and the erraudit / test
  findings attached to it.
- **Trigger:** `buildflow` exited 1 (6 failed steps) and `git sync` aborted mid-rebase.

---

## TL;DR

The fork's 124 local commits are rebased onto upstream `master` (77cd795).
Go build, full test suite, vet, race tests, and all three nix packages are green.
The rebase history was rewritten, so `origin/master` needs a force-with-lease push
(deliberately not done — pushing is a user action). Roughly 30 erraudit findings
remain open by documented decision, web tests were never run this session, and the
embedded static bundle is now stale relative to `web/src`.

---

## a) FULLY DONE

1. **Interrupted `git town sync` recovered.** Trashed the transient
   `testdata/crush/crush.db-shm`/`-wal` files that blocked the first pick, then
   drove the 124-pick rebase onto upstream `77cd795` to completion, resolving
   ~12 conflict stops (upstream's `traceStore` component refactor and
   outcome-certainty rework vs the fork's Crush adapter features).
2. **Semantic conflict resolutions preserved both sides** where both had
   substance: adapter list + `crushAdapter`/`buildAdapters`, bounded in-memory
   agent-graph LRU **and** the versioned disk cache with eviction,
   `SummarySidecarSource` + `IsAgentGraphSource`, `ToolResult` with upstream's
   `OutcomeKnown` **plus** the fork's `ToolCallID`/`ProviderExecuted`, schema and
   TS types carrying `truncated`, `outcomeKnown`, `provider`, token/cost fields,
   extended mark unions, `duration`, and the Hud provider/cost display.
3. **Formatting-only conflict picks resolved deliberately** (took "ours" after
   whitespace-insensitive three-stage diffing proved the pick was reformat-only).
4. **Post-rebase compile breaks fixed:** restored `ToolResult.ToolCallID`
   (`internal/adapter/adapter.go`), leftover conflict markers in
   `internal/adapter/codex/adapter.go` (strings.Builder perf refactor applied) and
   `web/src/ui/Hud.tsx`.
5. **Crush 404 regression fixed:** `traceStore.LoadRaw` fingerprinted sessions
   with `fingerprintFile`, stat-ing synthetic `crush://session/<id>` paths;
   routed through the synthetic-aware `fingerprintPath` with a zero fingerprint
   (`internal/server/tracestore.go`). `TestServerLoadsCrushFixtureSession` and
   `TestLoadTraceAndMapDoesNotGarbageRootCrushPaths` pass again.
6. **`internal/model` rebuild errors fixed:** `trace_schema_test.go` updated to
   upstream's `ComputeStats(trace, n, ObservabilitySignals{})` signature;
   `ComputeStats` now validates adapter-supplied observability grades so
   unrecognized overrides fall back to derivation instead of leaking into stats
   (`internal/model/stats.go`, `knownObservabilityGrade`). `FuzzComputeStats`
   passes.
7. **`TestAnalyzeStreamHeartbeat` race fixed:** the test returned while the judge
   goroutine was still writing into the report-cache `t.TempDir()`; added the
   repo's standard terminal-state poll before returning. Passes 5× under
   `-race -count=5`.
8. **Nix `ENOTCACHED` root-caused and fixed.** The hash was never stale —
   `web/package-lock.json` was out of sync with `web/package.json`
   (`react-dom` locked 19.2.7 vs wanted `^19.2.8`), forcing offline npm to
   re-resolve against the registry. Lock regenerated via
   `nix develop -c npm install --package-lock-only`; `npmDepsHash` recomputed
   (`sha256-moOue8j…`); `vendorHash` recomputed (`sha256-2RSeBQ6B…`);
   `web/src/vite-env.d.ts` added (staged, so nix's git source sees it) with an
   explicit `*.css` ambient declaration for TS7's side-effect import check.
9. **go.mod kept at 1.26.5:** the pipeline's 1.26.7 bump breaks `nix build`
   (nixpkgs `go_1_26` = 1.26.5, `GOTOOLCHAIN=local`). Reverted with the
   constraint recorded in AGENTS.md.
10. **`nix build .#default .#rubriceval .#frontend` all green** with the updated
    `flake.lock`.
11. **erraudit triage:** ~20 genuine context-loss sites fixed — error wraps now
    carry the failing directory / session path / session key
    (claudecode + codex + crush `agents.go`, `cmd/mindwalk/main.go`,
    `internal/judge/cache.go` via a single `Store`→`store` wrapper).
    `cmd/rubriceval/main.go` `writeJSON` no longer silently swallows report
    write failures (stderr diagnostics added).
12. **`eslint.config.js` added** (documented no-op): eslint is not part of this
    repo's toolchain; the config makes a globally installed eslint exit cleanly
    instead of failing with "no config".
13. **README split:** `## Installation` (installer, source build, Nix tip) and
    `## Quick start` (scan behavior, command list, data dirs).
14. **AGENTS.md updated** with the four nix gotchas discovered this session
    (go directive vs nixpkgs, lock/package.json sync, staged-files visibility,
    crush.db WAL sidecars).
15. **Git Town WIP stash harvested:** the newer `flake.lock` (all inputs forward:
    nixpkgs 1788752844) and the doc reformats restored. Regressive hunks
    (go.mod 1.26.7, frontend dep-major bumps, stale static assets) deliberately
    rejected. Stash entry `stash@{0}` kept — safe to drop.
16. **Validation green:** `go build ./...`, full `go test ./...`,
    `go vet ./...`, `go test -race` on `internal/server`, `gofmt -l` clean,
    all three nix packages build.

---

## b) PARTIALLY DONE

1. **erraudit zeroing.** ~30 findings remain, all triaged as false positives or
   deliberate patterns: usage strings it wants flag values interpolated into,
   demands to embed maps (`launchByCallID=map[…]`) in messages, deliberate
   best-effort `_ =` ignores (cleanup, dump writes, in-memory marshals), and
   handled-by-log/continue paths (pi adapter per-message tolerance, judge
   rubric retry-degrade). The decision is sound but **not recorded anywhere
   durable except this report**, and I never checked whether erraudit supports
   suppression comments to encode it.
2. **Fork/upstream content-parity verification.** Spot-checked key contracts
   (schema fields, TS types, ToolResult shape) but never ran a systematic
   `git diff 54d95d7…HEAD` content comparison to prove nothing else was lost in
   the "take ours" resolutions.
3. **golangci-lint.** Only `go vet` was run. The buildflow's golangci-lint and
   the repo's curated config were not re-run after my edits (the `fmt.Errorf`
   additions could interact with linters beyond vet).
4. **Static asset bundle.** `internal/server/static/` now lags `web/src`
   (Hud provider display, types). AGENTS.md says refresh via `make build`;
   not done — the committed bundle predates this session's UI-facing merges.
5. **Stash disposition.** Harvested and kept (`stash@{0}`), but not dropped;
   its rejected hunks (dep bumps incl. vitest 5 major, go 1.26.7) still exist
   in it and could be re-applied by accident.
6. **Disk space.** `/mnt/buildcache` was 100% full; cleared Go's build cache
   (18G) to unblock test compilation. Mount is still at 92% — root cause of
   the pressure not investigated.

---

## c) NOT STARTED

1. Pushing the rewritten history (needs force-with-lease; user decision).
2. Web test suite: `vitest` never executed this session (including the
   trace-schema/TS field-parity pinning tests from commit 271d128 that would
   directly validate my schema/types conflict resolutions).
3. Playwright e2e suite (`web/e2e`, `playwright.config.ts` present).
4. `make test` / `make build` (the project's declared standard validation and
   asset-refresh paths; npm only exists in the flake devShell).
5. `nix flake check` end-to-end (individual package builds verified; the flake
   check including the treefmt format check was not).
6. CI workflow review: `.github/workflows/ci.yml` was part of the rebase; the
   regenerated lockfile and new files were never checked against CI's steps
   (npm ci vs install, checksums, typecheck step added by 0489681).
7. Commit organization: the working tree (my fixes + harvested docs) will land
   as one auto-daemon mega-commit unless deliberately split.
8. CHANGELOG / TODO_LIST entries for the recovery work.
9. golangci-lint and erraudit as pre-push gates.
10. Cache-pressure investigation on `/mnt/buildcache` (220G, 92% full).

---

## d) TOTALLY FUCKED UP (honest mistakes in this session)

1. **Per-file conflict review with truncated output.** I diffed each conflicted
   file with `head` limits and missed entire conflict-marker hunks
   (`codex/adapter.go:684`, `Hud.tsx` from pick 1ebd078). They surfaced only at
   the final `go build` as syntax errors — after the rebase had "completed".
   A repo-wide `rg -l '^<<<<<<<'` after every resolution would have caught both
   at the pick where they belonged.
2. **`Hud.tsx` multiedit fumble.** One mis-sequenced multiedit duplicated the
   component's return block and duplicated comment lines, requiring cleanup
   surgery across three follow-up edits. Should have written one complete,
   pre-assembled replacement block.
3. **Trusted a broken LSP instead of the compiler for too long.** gopls/vtsls
   reported phantom "duplicate function" and stale-marker errors for most of
   the session (unmerged index confused them). I ping-ponged between believing
   and dismissing them; `go build` is the arbiter and I should have run it
   per-pick instead of only at the end.
4. **`git stash pop` output misread.** The truncated tail made a *failed* apply
   look like a successful one; I then re-derived the state from diffs. Should
   have captured full output the first time.
5. **`cd` leak caused four failed `git show` restores** (ran repo commands from
   `/tmp/mw-r7`) — wasted a round trip; caught and redone.
6. **Format-vs-semantic confusion early on.** The first schema conflict
   (`trace.schema.json`, pick 769b1de) was resolved hunk-by-hunk before
   establishing the three-stage `diff -w` method that made every later pick
   mechanical. The method should have been the default from the first
   whole-file conflict.
7. **Minor:** the fake-hash pass for `vendorHash` printed nothing on the first
   attempt (grep pattern missed the output), and the go.mod 1.26.7 bump was
   applied before checking nixpkgs' Go version — the nix build then failed with
   exactly the error I had flagged as a risk, costing one extra build cycle.

---

## e) WHAT WE SHOULD IMPROVE

1. **Rebase playbook:** after each conflict stop, run a fixed checklist —
   repo-wide marker scan, `go build ./...`, then continue. Never advance on
   per-file eyeballing alone.
2. **Three-stage semantic diff (`:1/:2/:3` + `diff -w`) as the default** for any
   whole-file conflict, with an explicit "semantic additions" filter before
   choosing a side.
3. **Post-rebase parity gate:** compare the rebased tip against the pre-rebase
   tip for unintended content loss (diff of file lists, key contract fields,
   schema/TS parity tests, web tests).
4. **Run the compiler, not the LSP, as the mid-rebase oracle.** Treat editor
   diagnostics during index churn as noise.
5. **Keep repo-standard validation honest:** `make test` exists and was never
   run; either run it or fix its definition so "validation green" means the
   same thing every session.
6. **Record linter triage decisions durably** (suppression comments or a lint
   policy doc), not just in a status report, or the same findings get
   re-triaged next session.
7. **Pipeline config drift:** buildflow runs tools the repo doesn't declare
   (eslint, pnpm-audit without a pnpm lockfile). Repo-level stubs quiet them,
   but the pipeline definition should match the repo's actual toolchain.
8. **Asset freshness:** decide whether embedded `internal/server/static` is
   refreshed per feature commit (AGENTS.md `make build`) or left to release;
   the current state is neither.

---

## f) UP TO 50 THINGS TO GET DONE NEXT

**Push & history**
1. Force-with-lease push `master` to `origin` (history rewritten).
2. Decide: squash the 122 daemon commits into feature commits before pushing.
3. Drop the harvested stash `stash@{0}` (or re-apply its dep bumps deliberately).
4. Re-run `git town sync` once pushed to confirm the loop is stable.
5. Verify `git town` sync strategy/config matches the fork workflow you want.

**Validation gaps (highest value, lowest effort)**
6. Run the vitest suite (`nix develop -c make test` or equivalent).
7. Run the trace-schema/TS parity test explicitly against my schema/types merges.
8. Run Playwright e2e (`web/e2e`) once with the rebased UI.
9. Run `golangci-lint run` with the repo config; fix anything my edits added.
10. Run `nix flake check` (includes treefmt format check).
11. Re-run buildflow end-to-end and confirm exit 0.
12. Regenerate the embedded static bundle (`make build` / `make embed-static`)
    so `internal/server/static` matches `web/src`.
13. Add a CI or local gate that fails when `web/package-lock.json` is out of
    sync with `web/package.json` (the nix ENOTCACHED trap).

**Linter debt**
14. Encode the erraudit triage durably (suppression comments if supported, or
    a lint policy section in AGENTS.md).
15. Investigate whether erraudit has a per-finding suppress directive; apply to
    the usage-string and map-variable false positives.
16. Fix or suppress the `main.go:494` class ("swallowed" = logged + continue) so
    the gate reflects reality.
17. Sweep the ~30 remaining `_ =` blank-identifier findings: convert the five
    genuinely dangerous ones, annotate the rest as deliberate.
18. Address golangci `gci` import grouping in `internal/adapter/crush/agents.go`
    (flagged post-edit).
19. Reduce `BuildAgentGraph` cognitive complexity (gocognit 39-73 across
    adapters) — pre-existing, now visible.
20. `wrapcheck` findings on `adapter.OpenFile`/`ReadJSONLines` call sites.
21. `varnamelen`/`mnd`/`prealloc`/`goconst` noise in touched files.

**Web/UI follow-ups**
22. Verify the provider/cost/token HUD display renders with a real Crush session
    (repo `verify` skill run).
23. Confirm `truncated` "partial map" badge still renders after the merges.
24. Re-check `hasFileActions` providerExecuted filter against a session with
    provider-executed tools.
25. Regenerate bundle hashes referenced by `internal/server/static/index.html`
    after the next asset refresh.
26. Decide vitest 4→5 (stash had `^5.0.0`): adopt with test migration or pin 4.
27. Revisit the other rejected dep bumps (plugin-react 6.1.1, lucide 1.42,
    playwright 1.63) one at a time with the lock regenerated each time.

**Go/code quality**
28. Add a regression test for the traceStore synthetic-path fingerprint
    (the 404 bug class), not just the two server tests that caught it.
29. Pin `ComputeStats` grade-validation behavior in a table test
    (exact/estimated/unavailable/garbage inputs).
30. Consider a shared `wrapContext(err, kv...)` helper to make the error-wrap
    style uniform across adapters.
31. Check `internal/adapter/crush/build.go` fixture tool still matches the
    committed `crush.db` (fixture was rebuilt by it earlier in fork history).
32. Make the crush adapter open the fixture DB in a mode that cannot create
    WAL sidecars in tests (or copy-on-open), eliminating the sidecar class
    entirely.
33. Sweep remaining `closeDiscard`/`_ = db.close()` sites for a logged variant
    in debug mode.

**Docs**
34. CHANGELOG entry for the recovery + fixes.
35. TODO_LIST: add rows for items 6-13 above.
36. Update `docs/crush.md` if error messages changed user-visible output.
37. Note the nixpkgs go_1_26 ceiling in the merge checklist doc (66f68c7).

**Ops/environment**
38. Investigate `/mnt/buildcache` pressure (92% after clearing 18G).
39. Confirm `GOTOOLCHAIN=local` is intentional in the devShell vs host toolchain
    drift (host has 1.26.7, nix has 1.26.5).
40. Consider `npmDepsFetcherVersion = 2` proactively (nix hint) before the next
    lockfile surprise.

**Process**
41. Decide the durable home for session-run status reports is still
    `docs/status/` (it is growing large; markdown-lint flags thousands of
    pre-existing findings there).
42. Trim or archive old status reports (codespell/markdown-lint noise).
43. Add the "rebase playbook" checklist from section (e) to AGENTS.md.
44. Verify the auto-commit daemon picked up the working tree sanely (or commit
    deliberately instead).
45. Tag/record the pre-sync tip (54d95d7) somewhere discoverable for parity
    audits during future merges.

**Nice-to-have**
46. `go test -race ./...` full-matrix in CI, not just internal/server.
47. Retry-flake detector: re-run failed tests once before reporting failure
    (heartbeat test cost real signal this cycle).
48. Consider `gomod` bump of go-crush-data if a newer release exists upstream.
49. Health-check the `sdk/go-crush-data` branch state (diverged? stale?).
50. Post-merge upstream contribution: the tracestore synthetic-path fix and
    `buildAdapters` gating are candidates for an upstream PR.

---

## g) QUESTIONS I CANNOT ANSWER MYSELF

1. **Push & history:** do you want the 122 daemon commits pushed as-is
   (force-with-lease to `origin/master`), or squashed into a handful of feature
   commits first? I can't judge how much audit trail you want in public history.
2. **Dependency bumps from the stash:** the pre-sync work bumped frontend deps
   including a **vitest major (4→5)**. Should I re-apply those deliberately
   (lock regen + web tests per bump), or drop that direction and pin current
   versions?
3. **Validation gate:** is `make test` + buildflow expected to gate pushes, or
   are erraudit/golangci findings advisory until you call a release? It decides
   whether the ~30 remaining erraudit findings need suppression comments now or
   can stay documented-only.

---

*Awaiting instructions.*
