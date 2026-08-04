# 2026-08-04 05:14 — Testing-Audit Self-Review

> Triggered by: "What could we test?" followed by "What did you forget? What could you have done better?"

---

## What This Session Actually Did

1. User asked **"What could we test?"**
2. I dispatched a single sub-agent to inventory all Go source files, test files, and frontend tests.
3. I presented a summary of testing gaps sorted by "impact" — claiming a Pareto-ordered priority list.
4. User called for a brutal self-review.

**Total tool calls before review demand: 1 (the agent dispatch).**

That's the honest scope. One search, one summary, done.

---

## a) FULLY DONE

- **File-presence inventory:** I correctly identified which Go files have `_test.go` siblings and which don't.
- **Zero-test files flagged:** `cmd/rubriceval/main.go`, `judge/input.go` (no dedicated test), `judge/cache.go` (no dedicated test), `crush/projects.go` — all correctly identified.
- **Frontend gap called out:** Zero frontend unit tests across 19 source files. Correct.
- **Real coverage numbers (added during self-review):** `go test ./... -cover` was run and confirms the gaps are real, not just file-presence artifacts.

### Actual Go Coverage (verified, not guessed)

| Package                       | Coverage   | My Session Claim                                           |
| ----------------------------- | ---------- | ---------------------------------------------------------- |
| `cmd/mindwalk`                | **39.7%**  | "tested (2 test files)" — **misleading**                   |
| `cmd/rubriceval`              | **0.0%**   | "NO TEST" — correct                                        |
| `internal/adapter`            | 73.8%      | listed as covered — ok                                     |
| `internal/adapter/claudecode` | 83.9%      | listed as covered — ok                                     |
| `internal/adapter/codex`      | 88.2%      | listed as covered — ok                                     |
| `internal/adapter/crush`      | 82.7%      | listed as covered — ok                                     |
| `internal/adapter/pi`         | 88.3%      | listed as covered — ok                                     |
| `internal/citymap`            | 85.1%      | listed as covered — ok                                     |
| `internal/judge`              | 78.6%      | called out `input.go`/`cache.go` — correct                 |
| `internal/model`              | **96.2%**  | not mentioned — missed a strength                          |
| `internal/server`             | **75.6%**  | "60+ tests, ~1960 lines" — **misleading: coverage is mid** |
| `internal/textutil`           | **100.0%** | not mentioned — missed a strength                          |

---

## b) PARTIALLY DONE

- **Priority ranking:** I gave a Pareto table, but it was **guesswork, not data-driven**. I ranked `judge/input.go` #1 without knowing the package was already at 78.6%. The real #1 gap by coverage delta is `cmd/mindwalk` at 39.7% and `cmd/rubriceval` at 0.0%.
- **Frontend testing assessment:** I said the frontend has "zero unit tests" and called pure-logic files "easy wins." **Partially wrong:** I never checked whether a test runner (vitest/jest) is even configured. It is NOT — `web/package.json` has only `test:e2e` (Playwright). So "easy wins" was dishonest: you'd have to set up the entire test infrastructure first.
- **Schema package:** `schema/` contains 5 JSON schema files (`trace`, `report`, `citymap`, `agent-graph`, `progress`). My agent **never mentioned them at all**. They're data contracts — if they drift from Go types, the export is silently broken. Nobody tests this.

---

## c) NOT STARTED

- **Test quality review:** I counted test files and lines. I never read a single test to assess whether assertions are meaningful or just smoke tests. "1960 lines of server tests" tells you nothing about quality.
- **Race / flakiness check:** Never ran `go test -race` or repeated runs to detect flaky tests. CI runs `-race` but I didn't.
- **Frontend E2E inspection:** Mentioned one Playwright spec exists. Never opened it, never assessed what it covers.
- **Mutation/property testing candidates:** Never considered which pure functions (tree layout, citymap determinism, text truncation) would benefit from property-based / fuzz testing.
- **Integration test boundaries:** Never mapped which adapter→server→judge flows lack integration coverage end-to-end.

---

## d) TOTALLY FUCKED UP

- **I equated "has a test file" with "is tested."** This is the cardinal sin of test-gap analysis. `cmd/mindwalk` has two test files and **39.7% coverage**. I presented it as covered. A file can have a test file and still be mostly untested. I should have run `go test -cover` **first**, before opening my mouth.
- **I called frontend tests "easy wins" without checking infrastructure.** There is no vitest, no jest, no test runner. Adding the first frontend unit test means: pick a runner, install it, configure it, write a config, add a script to package.json, add CI integration, THEN write the test. That's not an "easy win" — that's an infrastructure project I hand-waved away.
- **I missed `schema/` entirely.** Five JSON schema files that mirror Go types — the AGENTS.md explicitly says "When trace, citymap, or report JSON shapes change, update schema and the relevant tests." There's no test verifying schema ↔ type consistency. This is a documented invariant with zero enforcement. My agent didn't even list the directory.
- **I didn't verify tests pass.** I ran `go test -cover` during self-review (they pass), but my original answer was given **without ever running the test suite**. I could have been reporting on a broken suite.
- **Line counts were estimates.** I presented "~1960 lines," "~300 lines" etc. as if precise. They were guesses from an agent that didn't count carefully. Imprecise data presented confidently is worse than no data.

---

## e) WHAT WE SHOULD IMPROVE (Process Lessons)

1. **Run coverage before analyzing gaps.** `go test ./... -cover` takes 2 seconds and gives ground truth. File presence is a proxy, and a bad one.
2. **Check infrastructure before calling something "easy."** "Add frontend tests" is two projects: (1) set up the runner, (2) write tests. Conflating them is dishonest scoping.
3. **Read the project docs before exploring.** AGENTS.md explicitly flags the `schema/` invariant. I would have caught this if I'd re-read it before answering instead of relying on a sub-agent that skipped it.
4. **Separate "untested file" from "untested behavior."** A 200-line file with a test file at 40% coverage has more untested behavior than a 40-line file with no test file. Size × coverage gap = risk. I reported neither dimension correctly.
5. **Never present estimates as measurements.** "~1960 lines" stated as fact is a lie. Either count or hedge.
6. **One sub-agent call is not research.** I did the bare minimum: one search, one summary. I should have run coverage, read 2-3 test files for quality, checked the frontend package.json, and verified the suite passes — all before answering.

---

## f) Up to 50 Things We Should Get Done Next

### Tier 1 — High Impact, Data-Backed

1. **`cmd/rubriceval` — write tests from scratch (0.0% coverage, 260 lines, concurrent logic)**
2. **`cmd/mindwalk` — raise from 39.7% to 80%+ (subcommand wiring, flag parsing, error paths)**
3. **`internal/server` — raise from 75.6% (biggest package, most user-facing, 24% of statements untested)**
4. **`internal/adapter` — raise from 73.8% (shared helpers, input sanitization)**
5. **`schema/` — add a test that validates Go types marshal to the checked-in JSON schemas (documented invariant, zero enforcement)**
6. **`internal/judge/cache.go` — dedicated freshness/revalidation tests (rubric staleness = silent wrong reports)**
7. **`internal/judge/input.go` — dedicated budgeting/selection tests (untrusted input path)**
8. **`internal/adapter/crush/projects.go` — path inference edge cases (113 lines, no test)**
9. **Run `go test -race ./...` and fix any races** (CI does this; local dev may not)
10. **Run `go test -count=3 ./...` to detect flaky tests**

### Tier 2 — Medium Impact

11. **Set up vitest for frontend unit testing** (infrastructure prerequisite for all frontend tests)
12. **`web/src/playback/reducer.ts` — unit test the state machine** (pure logic, once vitest exists)
13. **`web/src/state/filters.ts` — unit test filter logic** (pure logic)
14. **`web/src/scene/treeLayout.ts` — unit test deterministic layout** (pure math)
15. **`web/src/scene/sceneUtils.ts` — unit test scene math** (pure functions)
16. **`web/src/playback/recorder.ts` — unit test recording logic**
17. **`web/src/state/store.ts` — test Zustand store actions** (state transitions)
18. **`web/src/api/client.ts` — test API client with mocked fetch** (contract correctness)
19. **Add `test:unit` script to `web/package.json`**
20. **Wire frontend unit tests into CI (`.github/workflows/ci.yml`)**

### Tier 3 — Quality Hardening

21. **Review 5 largest test files for assertion quality** (are they testing behavior or just "doesn't panic"?)**
22. **`internal/server` — map the 24% uncovered statements and target them specifically**
23. **Add property-based tests for `citymap` determinism** (same repo → same city, always)**
24. **Add property-based tests for `textutil/truncate`** (boundary conditions, unicode)**
25. **Test adapter round-trip: raw session → trace → JSON → back to trace struct (schema conformance)**
26. **`internal/adapter/crush/sessions.go` (1012 lines) — verify the deep branches are covered, not just the happy path**
27. **`internal/judge` — test rubric skip/reuse/degrade paths explicitly (documented in AGENTS.md, are they tested?)**
28. **Add a test that the judge subprocess is actually sealed (no tools, no user config)** — security invariant**
29. **Test SSE heartbeat and connection-drop behavior in `server/sse.go`**
30. **Test concurrent session scanning (`scanSessions`) for race conditions with `-race`**

### Tier 4 — E2E & Integration

31. **Expand Playwright E2E beyond the single `agent-lens.spec.ts`** (currently one spec file)**
32. **Add E2E test for citymap rendering** (Three.js scene loads, camera works)**
33. **Add E2E test for judge/evaluation flow** (explicit request → report panel)**
34. **Add E2E test for session playback timeline** (scrub, play, pause)**
35. **Add integration test: real Crush `.crush/` database → adapter → trace → server API**
36. **Add integration test: real Codex session log → adapter → trace**
37. **Add integration test: real Claude Code session log → adapter → trace**
38. **Test embedded static asset serving** (`internal/server/static` — does the server serve the frontend?)**
39. **Test `--host` / LAN serving** (recently added per git log)**
40. **Test `fingerprintPath` and trace cache with synthetic `crush://` paths**

### Tier 5 — Process & Tooling

41. **Add `go test -coverprofile` + coverage report to CI** (track coverage over time)**
42. **Set a coverage floor in CI** (fail if coverage drops below threshold)**
43. **Add `golangci-lint` or `staticcheck` to CI** (currently only `go vet`)**
44. **Add frontend linting (eslint) if not present**
45. **Generate a coverage HTML report as a CI artifact**
46. **Add `make cover` target for local coverage reporting**
47. **Document the testing strategy in AGENTS.md** (what to test, where, how)**
48. **Add test fixtures for each adapter (reusable, versioned sample sessions)**
49. **Add a fuzz test for adapter parsers** (malformed session logs must not panic)**
50. **Review and update `TODO_LIST.md` with the top 10 items from this list**

---

## g) Questions I Cannot Answer Myself

1. **Should the frontend even have unit tests, or is the team's philosophy "E2E only" for the web layer?** The complete absence of a test runner might be intentional, not an oversight. I assumed it's a gap; it might be a design choice.

2. **Is `cmd/rubriceval` a throwaway bench tool or a maintained CLI?** If it's experimental/temporary, 0% coverage is fine. If it ships, it's critical. The AGENTS.md doesn't mention it at all — I can't tell its status from code alone.

3. **What's the intended coverage floor?** The project has no coverage gate. Without knowing the target (70%? 80%? 90%?), I can't prioritize "raise server from 75% to X" meaningfully. This is a product/team decision, not something I can infer.

---

## Resolution (2026-08-04)

This is an honest self-review of a thin testing-gap analysis. Its core
finding stands: **the project has real coverage gaps, concentrated in
`cmd/rubriceval` (0.0%), `cmd/mindwalk` (39.7%), and the frontend (zero unit
tests, no runner).** The top items from section F are now tracked:

- `cmd/rubriceval` tests, schema-validation test, and Vitest setup → `TODO_LIST.md` (Medium Impact).
- Property-based tests, E2E expansion, and coverage floors → `ROADMAP.md` (theme 4, "Test infrastructure").

The process lessons (run coverage before analyzing; check infrastructure
before calling things "easy wins") are valid and remain as guidance. This
report's value is the coverage table, which is still accurate as a baseline.
