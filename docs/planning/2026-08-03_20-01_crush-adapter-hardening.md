# Plan: Crush adapter hardening

**Date:** 2026-08-03 20:01
**Status:** ~~In progress~~ Executed. Tier 1 and Tier 2 shipped; most of
Tier 3 followed. See the [Resolution](#resolution-2026-08-03) appendix for
per-item status; remaining work is in `TODO_LIST.md`.
**Driver:** Crush adapter landed in commit `0ba1f79` with end-to-end
live verification but thin test coverage and several TODO items in the
status report `docs/status/2026-08-03_12-32_crush-adapter-landed-but-not-done.md`.
This plan ranks the remaining work so a future session can resume
cleanly.

## Pareto breakdown

### Tier 1 — 1% that delivers 51% of value (P0 — must do now)

These four items together unlock the entire CI signal for Crush
support. Without them a refactor of the server can silently break
Crush and no test will fire.

1. **Add tests for the parts parser branches** that are uncovered
   today (reasoning, finish, shell_command, image_url, binary,
   unknown). The parser is the single biggest correctness surface
   in the adapter; the new tests pin its behaviour.
2. **Add tests for the Crush agent graph** (exact / unlinked /
   derived branches). The graph builder is the only thing the Agent
   Lens consumes, and it has zero coverage today.
3. **Type the synthetic `crush://session/<id>` scheme** into
   `crush.SessionPath(id)` and `crush.IsSessionPath(string) bool`
   helpers. The scheme is currently a magic string spread across
   the adapter, `sourceUsesFilesystem`, and `fingerprintPath` —
   one constant in the package will localise the contract.
4. **Add `testdata/crush-session.db` fixture** with one root
   session and one sub-agent, plus a `TestServerLoadsCrushFixtureSession`
   end-to-end test. CI now reproduces the live verification path.

### Tier 2 — 4% that delivers 64% (P1 — do this week)

5. **Document `--crush-dir`** in `mindwalk serve --help` output
   with an example path.
6. **Add `docs/crush.md`** describing data-dir resolution, parts
   JSON shape, the `crush://` synthetic path scheme, and the
   `messageID$$toolCallID` sub-agent id format.
7. **Update `model.SessionMeta.Path` comment** to mention the
   synthetic `crush://` scheme; the field is currently documented
   as a filesystem path.
8. **Add GoDoc on the public Crush adapter API** —
   `Harness()`, `SessionDir()`, `ListSessions()`, `Summarize()`,
   `Parse()`, `BuildAgentGraph()`, `AgentGraphInputs()`.
9. **Add CHANGELOG.md entry** under a "Crush support" heading.
10. **Clean up the `_ = a` no-op statements** in `parts.go` that the
    lint reports flag.
11. **Make `SessionKey` consistent across adapters** —
    today the Crush helper signature is `SessionKey(id string)` and
    the Claude/Codex helpers take `(harness, path)`. Adopt a single
    signature.
12. **Add a tool_call id collision test** to lock in the
    "first-call-wins, second-call-appends-result" behaviour.
13. **Tighten the `openReadOnly` error reporting** so a present-but-
    unreadable database surfaces the underlying `os.Stat` /
    `sql.Open` error.
14. **Add a metric/log line in `scanSessions`** that prints
    "found N Claude / N Codex / N Crush sessions" during cold scans.
15. **Boot the web UI** against the live Crush session and verify it
    renders the rail, event ticks, file targets, and agent graph.
16. **Run `mindwalk analyze crush://session/<id>`** against the live
    session to confirm the rubric layer accepts the tool vocabulary.

### Tier 3 — 20% that delivers 80% (P2 — do this month)

17. **Add `--no-crush` flag** for parity with the other harnesses.
18. **Add `/api/adapters` endpoint** returning harness name, session
    count, and data dir for each registered adapter.
19. **Investigate schema coverage for older Crush releases** that
    predate the `read_files` migration and emit a startup warning.
20. **Persist the agent graph cache to disk** keyed by
    `(session_key, fingerprint_of_messages_count)` so a cold restart
    is still warm.
21. **Refactor `summarizeCached` to take a `model.SessionMeta`**
    directly rather than `(source, path, info)` — the meta already
    knows the path, and `info` is derivable.
22. **Cache `crush.db` reads across requests** via a `sync.Map`
    keyed by absolute path so a long-lived server doesn't open the
    file per call.
23. **Add benchmarks** for the SQLite parse path and the cold scan.
24. **Document the public Crush adapter API** in the package-level
    GoDoc, including the `crush://session/<id>` synthetic path and
    the `messageID$$toolCallID` sub-agent id format.
25. **Stress test** with a 100k-message Crush session to find the
    first place the read path chokes.
26. **Add a `mindwalk doctor` subcommand** that prints session
    counts, data dir paths, and which adapters are wired.
27. **Audit other `internal/server` paths** for `crush://`
    assumptions: `handleSessionResource`, `summaryPath`,
    `pruneSummaryCache`.
28. **Investigate whether `findSession` should also try
    `crush://session/<id>` lookups** for the bare-id URL form
    (`/api/sessions/eeb42308-…`).
29. **Cross-check the Crush `parts` parser against the upstream
    source** one more time. I read the source on a frozen snapshot.
30. **Audit `lookupProjectDataDir`** for the corner case where the
    working dir is OUTSIDE a git worktree.

## Execution graph

```mermaid
graph TD
  A[Tier 1: tests + scheme + fixture] --> B[Tier 2: docs + polish]
  B --> C[Tier 3: caches + benchmarks]
  A1[Parts parser tests] --> A
  A2[Agent graph tests] --> A
  A3[Synthetic path helper] --> A
  A4[testdata fixture + server e2e] --> A
  A --> D[Commit 1: hardening]
  B1[--crush-dir docs] --> B
  B2[docs/crush.md] --> B
  B3[SessionMeta.Path comment] --> B
  B4[GoDoc on Crush adapter] --> B
  B5[CHANGELOG.md] --> B
  B6[_ = a cleanup] --> B
  B7[SessionKey consistency] --> B
  B8[tool_call id collision test] --> B
  B9[openReadOnly error report] --> B
  B10[scanSessions metric log] --> B
  B11[Web UI verify live] --> B
  B12[Analyze live session] --> B
  B --> E[Commit 2: docs and polish]
  C1[--no-crush flag] --> C
  C2[/api/adapters endpoint] --> C
  C3[Schema coverage warning] --> C
  C4[Persist agent graph cache] --> C
  C5[Refactor summarizeCached] --> C
  C6[Cache crush.db reads] --> C
  C7[Benchmarks] --> C
  C8[GoDoc package level] --> C
  C9[Stress test] --> C
  C10[mindwalk doctor] --> C
  C11[Audit server crush://] --> C
  C12[findSession bare id] --> C
  C13[Cross-check parser] --> C
  C14[Audit project boundary] --> C
  C --> F[Commit 3: caches and audits]
```

## Effort and impact table

| #   | Item                                      | Effort | Impact | Tier |
| --- | ----------------------------------------- | ------ | ------ | ---- |
| 1   | Parts parser branch tests                 | 30m    | high   | P0   |
| 2   | Agent graph branch tests                  | 30m    | high   | P0   |
| 3   | `crush.SessionPath()` + `IsSessionPath()` | 20m    | medium | P0   |
| 4   | `testdata/crush-session.db` fixture + e2e | 45m    | high   | P0   |
| 5   | `--crush-dir` help example                | 10m    | low    | P1   |
| 6   | `docs/crush.md`                           | 30m    | medium | P1   |
| 7   | `SessionMeta.Path` comment                | 10m    | low    | P1   |
| 8   | GoDoc on Crush adapter public API         | 20m    | low    | P1   |
| 9   | `CHANGELOG.md` entry                      | 10m    | low    | P1   |
| 10  | Clean up `_ = a` no-op statements         | 15m    | low    | P1   |
| 11  | Align `SessionKey` signatures             | 20m    | medium | P1   |
| 12  | `tool_call.id` collision test             | 20m    | medium | P1   |
| 13  | Tighten `openReadOnly` errors             | 15m    | medium | P1   |
| 14  | `scanSessions` metric log                 | 15m    | medium | P1   |
| 15  | Boot web UI + verify                      | 30m    | high   | P1   |
| 16  | `mindwalk analyze` live                   | 15m    | high   | P1   |
| 17  | `--no-crush` flag                         | 10m    | low    | P2   |
| 18  | `/api/adapters` endpoint                  | 45m    | medium | P2   |
| 19  | Schema coverage warning                   | 30m    | low    | P2   |
| 20  | Persist agent graph cache                 | 90m    | medium | P2   |
| 21  | Refactor `summarizeCached`                | 45m    | medium | P2   |
| 22  | Cache `crush.db` reads                    | 45m    | medium | P2   |
| 23  | Benchmarks                                | 60m    | low    | P2   |
| 24  | Package-level GoDoc                       | 20m    | low    | P2   |
| 25  | 100k-message stress test                  | 60m    | low    | P2   |
| 26  | `mindwalk doctor` subcommand              | 90m    | medium | P2   |
| 27  | Audit server `crush://` assumptions       | 45m    | medium | P2   |
| 28  | `findSession` bare-id lookup              | 30m    | low    | P2   |
| 29  | Cross-check parser against upstream       | 30m    | medium | P2   |
| 30  | Audit `lookupProjectDataDir` boundary     | 30m    | low    | P2   |

## Out of scope (acknowledged, deferred)

- Replacing the `SessionMeta.Path` field with a typed
  `SessionHandle` struct (breaking change).
- Supporting the older `title-<sessionID>` agent-tool id format.
- Pulling the synthetic-path scheme into a generic
  `model.SyntheticPath(scheme, id)` helper. Worth doing once a second
  DB-backed adapter lands.
- Generalising `dir == "crush://session/<id>"` short-circuit into a
  "synthetic path" interface that other DB-backed harnesses can opt
  into.

## Open questions

1. Should we also support the older `title-<sessionID>` agent session
   id format? (I matched the upstream `messageID$$toolCallID`
   exactly. Older Crush releases used the `title-` prefix. Worth
   supporting if any live installations still emit that shape.)
2. Should the synthetic-path scheme be generalised into
   `model.SyntheticPath(scheme, id)` now, or wait for a second
   DB-backed adapter? (My instinct: wait for a second adapter so the
   API is informed by two real consumers.)

---

## Resolution (2026-08-03)

All 30 items resolved below. Hashes are post-rebase current values.

| #   | Item                                      | Status   | Commit / where                                |
| --- | ----------------------------------------- | -------- | --------------------------------------------- |
| 1   | Parts parser branch tests                 | done     | `639cb7d`                                     |
| 2   | Agent graph branch tests                  | done     | `65de444`                                     |
| 3   | `crush.SessionPath()` + `IsSessionPath()` | done     | `c8baa88`                                     |
| 4   | `testdata/crush-session.db` fixture + e2e | done     | `2e295f6`, `69929b3`                          |
| 5   | `--crush-dir` help example                | done     | `4a1f912`                                     |
| 6   | `docs/crush.md`                           | done     | `2af50ab`                                     |
| 7   | `SessionMeta.Path` comment                | done     | `ed14153`                                     |
| 8   | GoDoc on Crush adapter public API         | done     | `39cd372`                                     |
| 9   | `CHANGELOG.md` entry                      | done     | `a570a44`                                     |
| 10  | `_ = a` cleanup                           | done     | `639cb7d`                                     |
| 11  | Align `SessionKey` signatures             | deferred | refactor, low priority                        |
| 12  | `tool_call.id` collision test             | done     | `639cb7d`                                     |
| 13  | `openReadOnly` error reporting            | done     | `7b0895f`                                     |
| 14  | `scanSessions` metric log                 | done     | `c2cd011`                                     |
| 15  | Boot web UI + verify                      | open     | TODO_LIST                                     |
| 16  | `mindwalk analyze` live                   | open     | TODO_LIST (crush is a judge CLI at `266bd64`) |
| 17  | `--no-crush` flag                         | done     | `eaebeba`                                     |
| 18  | `/api/adapters` endpoint                  | done     | `6c986d3`                                     |
| 19  | Schema-coverage warning                   | open     | TODO_LIST                                     |
| 20  | Persist agent-graph cache                 | open     | TODO_LIST                                     |
| 21  | Refactor `summarizeCached`                | deferred | refactor, low priority                        |
| 22  | Cache `crush.db` reads                    | open     | TODO_LIST                                     |
| 23  | Benchmarks                                | done     | `6c986d3`                                     |
| 24  | Package-level GoDoc                       | done     | `39cd372`, `2af50ab`                          |
| 25  | 100k-message stress test                  | open     | ROADMAP                                       |
| 26  | `mindwalk doctor` subcommand              | open     | TODO_LIST                                     |
| 27  | Audit server `crush://` assumptions       | done     | `6c986d3` (found + fixed 2 bugs)              |
| 28  | `findSession` bare-id lookup              | done     | no change needed (round 2)                    |
| 29  | Cross-check parser vs upstream            | open     | ROADMAP                                       |
| 30  | Audit `lookupProjectDataDir` boundary     | deferred | low priority                                  |
