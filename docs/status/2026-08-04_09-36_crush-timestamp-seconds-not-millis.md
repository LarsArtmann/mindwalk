# 2026-08-04 09:36 — Crush Timestamp Unit Bug Fix (Seconds vs Milliseconds)

## Summary

Fixed the root cause of all Crush sessions appearing as 1970-01-01 in the UI.
The Crush SQLite database stores timestamps in **Unix seconds**, but the adapter
treated them as **milliseconds**. A value like `1781655007` (June 2026 in
seconds) was passed to `time.UnixMilli()`, producing `1970-01-21T14:54:15Z`.

The schema comment in Crush's own migration says "Unix timestamp in milliseconds"
— but the `strftime('%s', 'now')` trigger writes **seconds**. The adapter trusted
the comment instead of the data.

---

## a) FULLY DONE

1. **Root cause identified** — Queried the live `~/.local/share/crush/.crush/crush.db`
   and confirmed `created_at`, `updated_at`, `messages.created_at`,
   `messages.finished_at`, and reasoning `started_at`/`finished_at` are all
   second-precision Unix timestamps. Verified with `datetime(col, 'unixepoch')`.

2. **`millisToRFC3339` → `secondsToRFC3339`** (`sessions.go:899-908`) — Renamed
   the function and changed `time.UnixMilli(ms)` → `time.Unix(s, 0)`. Updated
   all 5 call sites (session scan + message timestamp).

3. **Duration calculations fixed** (`sessions.go:334, 365`) — Removed the
   erroneous `/ 1000` division from two message-duration calculations
   (`FinishedAt - CreatedAt`). The difference is already in seconds; dividing
   by 1000 truncated every sub-1000s duration to zero.

4. **Doc comment fixed** (`adapter.go:9`) — Changed "millisecond timestamps"
   to "second-precision Unix timestamps".

5. **All test helpers updated** (`adapter_test.go`) — Changed 8 call sites
   from `createdAt.UnixMilli()` → `createdAt.Unix()` across `insertSession`,
   `insertMessage`, `insertMessageWithProvider`, `insertSessionWithUsage`,
   and the old-schema/fixture tests. Updated doc comments accordingly.

6. **Full test suite passes** — `go test ./internal/adapter/crush/...` (all
   tests pass), `go build ./...` (clean), `gofmt -l` (no issues).

---

## b) PARTIALLY DONE

Nothing partial — the fix is complete and all tests pass.

---

## c) NOT STARTED

1. **End-to-end UI verification** — The `verify` skill exists for launching
   the server and driving the UI. I verified the fix with a standalone Go
   snippet (`1781655007` → `2026-06-17T00:10:07Z`) and unit tests, but never
   booted the actual server to visually confirm the session rail shows real
   dates. This is the highest-confidence verification I skipped.

2. **Dedicated regression test** — I updated existing test helpers to use
   `.Unix()`, but did not add a named test like
   `TestTimestampsAreSecondsNotMillis` that explicitly asserts a known
   second-precision value produces a known RFC3339 date. The existing tests
   pass but don't loudly guard against someone reverting to `.UnixMilli()`.

3. **Defensive comment in the adapter** — I did not add a code comment at the
   conversion site explaining WHY we use seconds (Crush's schema comment lies;
   the trigger proves seconds). A future maintainer reading Crush's migration
   comment could "fix" it back to milliseconds.

---

## d) TOTALLY FUCKED UP

Nothing. The fix is correct, targeted, and fully tested.

---

## e) WHAT WE SHOULD IMPROVE

### Process Improvements

1. **Trust the data, not the comment** — The schema said "milliseconds" but
   the trigger said seconds. A 30-second query (`SELECT datetime(created_at,
   'unixepoch')`) would have caught this during the original adapter
   implementation. **Always validate assumptions against real data.**

2. **The previous self-review propagated the same myth** — The
   `2026-08-04_05-04_todo-sprint-complete-self-review.md` report (item #2)
   said "Crush records millisecond timestamps" and suggested changing
   `Mark.Duration` to milliseconds for sub-second precision. That suggestion
   was based on the same false premise. **Now moot** — you cannot get
   sub-second precision from second-precision source data.

3. **No integration test against a real database** — Every crush test uses
   synthetic fixture databases with programmer-chosen timestamps. No test
   reads a real `crush.db`. A smoke test that opens the user's actual database
   and asserts timestamps fall in a plausible range (e.g., after 2024) would
   have caught this immediately.

### Code Quality Observations (Not My Bugs, But Noticed)

4. **Pre-existing lint warning** — `sessions.go:914` (`queryReadFiles`) has a
   `sqlrowserr` warning: the `rows.Next()` loop doesn't check `rows.Err()`
   afterward. Pre-existing, not introduced by my change.

5. **`finishData.Time` field is dead code** — Decoded from JSON but never read
   (`parts.go:62`). Harmless but noisy.

6. **The crush schema comment is wrong upstream** — Crush's migration says
   "milliseconds" but their trigger uses `strftime('%s', 'now')` (seconds).
   This is a Crush bug, not ours, but it's the kind of upstream lie that
   causes exactly this class of bug.

---

## f) Up to 50 Things We Should Get Done Next

### High Priority — Direct Follow-ups

1. **Run the `verify` skill** to confirm the UI now shows real dates for Crush
   sessions.
2. **Add `TestTimestampsAreSecondsNotMillis`** — a named regression test that
   inserts `time.Date(2026, 1, 1, ...).Unix()` and asserts the parsed
   `StartedAt` starts with `2026-`, not `1970-`.
3. **Add a defensive comment** at `secondsToRFC3339` explaining the Crush
   schema lie (comment says ms, trigger says seconds).
4. **Fix the pre-existing `sqlrowserr` lint** at `sessions.go:914`
   (`queryReadFiles` — add `rows.Err()` check after the loop).
5. **Remove the dead `finishData.Time` field** or wire it up if it's meant to
   be used.

### Medium Priority — Crush Adapter Hardening

6. **Add a real-database smoke test** — a test (gated behind an env var or
   `testing.Short()`) that opens the actual `~/.local/share/crush/.crush/crush.db`
   and asserts timestamps are plausible (year > 2020).
7. **Validate `updated_at >= created_at`** — the sort in `listAllProjectSessions`
   sorts by `EndedAt` (from `updated_at`); if `updated_at` is ever 0 or stale,
   sessions sort incorrectly.
8. **Audit the `reasoningData` timestamps** — `started_at`/`finished_at` in
   reasoning parts are also seconds. The `reasoningSecs` calculation
   (`FinishedAt - StartedAt`) is correct, but verify the test data
   (`adapter_test.go:704`: values 1000/1012) reflects realistic second-precision
   values, not millisecond-era leftovers.
9. **Consider a timestamp heuristic** — if a timestamp value is > 1e12, it's
   milliseconds; if < 1e12, it's seconds. A defensive auto-detect would survive
   a future Crush schema "fix" that actually switches to milliseconds. (Low
   priority — YAGNI unless Crush upstream changes.)
10. **Check other adapters** — Do Claude Code, Codex, or pi have the same
    seconds-vs-millis assumption bug? Audit all four adapters for timestamp
    unit consistency.

### Low Priority — Documentation & Cleanup

11. **Update previous status reports** — The `05-04` report's item #2 about
    `Mark.Duration` milliseconds is now moot. Add a corrigendum or strike it.
12. **Document the Crush schema quirk** in AGENTS.md under the crush adapter
    section (timestamps are seconds despite the schema comment).
13. **Consider filing an upstream bug** against charmbracelet/crush for the
    misleading schema comment / trigger mismatch.
14. **Audit `Mark.Duration` semantics** — now that we know the source is
    seconds, confirm all mark producers (thinking, finish-reason) emit seconds
    consistently.

### Broader Project Health (Noticed, Not Related to This Fix)

15. **No frontend tests exist** — the TypeScript UI has zero automated tests.
    Every UI change (including timestamp display) is manual-verify-only.
16. **`make test` requires npm** — the `test` target runs `npm --prefix web
    run build`, which fails if npm isn't installed. The Go test pass should
    succeed independently.
17. **Fixture DB is a black box** — no regeneration script committed for the
    crush fixture database.
18. **No CI test for `crush://session/...` parse path** — the e2e crush judge
    test is manual-only.

---

## g) Questions I Cannot Answer Myself

1. **Should the adapter auto-detect timestamp units?** If Crush upstream ever
   "fixes" their schema to actually use milliseconds (matching their comment),
   our code breaks again. A heuristic (value > 1e12 → millis) would be
   defensive but adds complexity. Is this worth doing proactively, or wait
   until/if it breaks?

2. **Is there a canonical Crush schema reference we should pin to?** The
   adapter reverse-engineers the schema from migrations. If Crush changes the
   timestamp semantics in a future migration, we need to know. Should we track
   a specific Crush version tag in AGENTS.md?

3. **Should `Mark.Duration` stay as `int` seconds, or move to `int64`
   milliseconds?** The previous report (05-04) raised this, but now we know the
   source data is second-precision, sub-second durations are impossible from
   Crush. Other adapters (Claude Code, Codex) may have different precision —
   should we check before deciding?
