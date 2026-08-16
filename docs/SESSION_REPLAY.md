# Replaying a session end-to-end

> For new contributors: a copy-pasteable walk-through that opens a
> real session, exercises the full adapter → server → UI → evaluation
> pipeline, and points at every command/file you'll touch along the
> way. Uses the committed `testdata/crush/crush.db` fixture so you
> don't need a live coding-agent session.

## What you'll see

The committed Crush fixture (`testdata/crush/crush.db`) contains one
root session (`fixture-root`) plus one auxiliary agent session (the
`agent` tool's child row). The root session has a `read` tool call, a
user-message mark, and an `agent` tool launch. Together they exercise
the most interesting cross-message plumbing:

- `crush://session/<id>` synthetic path routing (`crush.SessionPath`).
- Agent-graph discovery across the fixture's `projects.json` registry.
- Per-message `OutcomeKnown: true` (T06) and cross-message tool-result
  pairing (T07).
- Error observability grade = `exact` because every `tool_call` has a
  matching `tool_result` somewhere in the log.

## Open the session in the browser

```sh
make build      # refresh embedded UI assets if you've changed web/
make serve
# … or, to avoid rebuilding:
mindwalk serve --crush-dir testdata/crush
```

The browser opens on the session rail. Pick `fixture-root` under the
Crush heading. You should see:

- The HUD's `error observability: exact` chip (was `estimated` before
  T06/T07).
- The agent panel showing one child (`fixture-root$$call_agent_1`)
  linked with `linkQuality: exact`, `linkMethod: crush-agent-id`.
- The timeline histogram with a `user-message` mark on event 0 and
  an `agent-launch` mark where the `agent` tool fired.

If the chip reads `estimated` instead of `exact`, the cross-message
fold regressed — re-run `go test ./internal/adapter/crush/` to confirm
`TestFixtureErrorObservability` is green.

## Export the normalised trace

```sh
mindwalk trace crush://session/fixture-root --crush-dir testdata/crush \
    > /tmp/fixture-root.trace.json
```

Compare against the schema:

```sh
diff <(jq 'keys' /tmp/fixture-root.trace.json) \
     <(jq '.properties | keys' schema/trace.schema.json)
```

The keys must match. The CI parity test
(`internal/model/trace_schema_parity_test.go`) enforces the per-event
field shape; if you've added a new event field, this test fails
until the frontend `web/src/types.ts TraceEvent` declaration catches
up.

## Run the LLM judge

```sh
mindwalk analyze crush://session/fixture-root \
    --crush-dir testdata/crush \
    --judge crush \
    --model claude-haiku-4-5 \
    --no-rubric
```

If you omit `--no-rubric`, the rubric phase runs first and (because
the fixture has only one short task) returns a minimal rubric.
Reports land in `~/.mindwalk/reports/` keyed by session id and
content hash; running the same session twice does not re-run unless
you delete the cached report.

## Rebuild the fixture from scratch

If you're debugging the Crush adapter itself:

```sh
go run ./testdata/crush/build.go   # regenerates testdata/crush/crush.db
```

The build script is a tiny self-contained program that inserts the
exact rows the fixture test expectations depend on. Commit any
intentional changes to the resulting `crush.db` binary; the build
script is the source of truth.

## Where the code lives

| Layer            | Path                                                  |
|------------------|-------------------------------------------------------|
| Adapter          | `internal/adapter/crush/`                             |
| Schema           | `schema/trace.schema.json`, `schema/progress.schema.json` |
| Synth path       | `crush.SessionPath`, `crush.IsSessionPath`            |
| Server endpoints | `internal/server/handlers.go` (`/api/sessions`, `/api/sessions/<k>/trace`, `/api/sessions/<k>/agents`) |
| Frontend         | `web/src/api/client.ts`, `web/src/ui/AgentsPanel.tsx`, `web/src/ui/Hud.tsx` |
| Tests            | `internal/adapter/crush/fixture_test.go`, `internal/adapter/crush/parts_test.go`, `internal/server/server_test.go` (`TestServerLoadsCrushFixtureSession`) |
| Docs             | `docs/crush.md` (data-dir resolution + parts JSON shape) |

## Common regressions

- **HUD shows `error observability: estimated` on a Crush session
  whose `parts.go` was just edited.** Most likely the same-message
  fold lost `OutcomeKnown: true`; check `parts.go:114` and `:240`.
  If the test passes but the chip still flips, the cross-message
  fold loop in `sessions.go` is dropping tool_results whose
  `ToolCallID` lives in a later message — verify `resultFor` still
  indexes into the deferred `parsed.results` slice.
- **Agent panel shows `linkMethod: unavailable` for a child session
  whose id is `messageID$$callCallID`.** The synthetic `crush://`
  path scheme is mangled somewhere upstream; check that
  `crush.IsSessionPath` is the guard at every consumer.
- **`/api/sessions` returns the auxiliary child as a top-level
  session.** The root-only filter in the session listing handler
  regressed; `TestServerLoadsCrushFixtureSession` exercises this
  exact contract.