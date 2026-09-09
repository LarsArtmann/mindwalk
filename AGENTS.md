# AGENTS.md

`mindwalk` is a local visualizer for coding-agent sessions. It supports Claude Code, Codex, pi, and Crush, turning agent session logs plus repository structure into a deterministic 3D "code city" that can be explored in a browser.

## Design

The project has three primary artifacts:

- A normalized trace of what happened during a supported coding-agent session.
- A deterministic citymap of the repository being edited or inspected.
- An evaluation report: an LLM judge's findings about one session — four fixed process dimensions plus a task-specific rubric layer — generated on explicit request only.

The UI combines those artifacts so users can see how a coding agent moved through a codebase over time — and, when asked, how well. Keep the separation clear: source-specific parsing should not know about rendering, citymap generation should not depend on session playback, the judge reads only the normalized trace (never raw session logs), and the server should mainly connect data sources to the web client.

See [`docs/DOMAIN_LANGUAGE.md`](docs/DOMAIN_LANGUAGE.md) for the glossary of domain terms (trace, session, harness, adapter, mark, target, event, citymap, agent graph, report, rubric, finding, dimension, verdict).

## Architecture

- `cmd/mindwalk` provides the CLI commands: serve a local UI, open a session, build a citymap, export a trace, or evaluate a session.
- `internal/adapter` converts supported agent session formats into the shared model. Claude Code, Codex, pi, and Crush each have an adapter; keep every source, current and future, behind its adapter boundary.
- `internal/model` owns the trace, citymap, and report data contracts.
- `internal/citymap` builds deterministic layouts from repository contents.
- `internal/judge` renders a trace into an evidence document and runs a sealed local agent CLI (claude, codex, or crush) over it in up to two calls: the first drafts a task rubric — task-grouped criteria derived from the session's user messages — and the second is one unified scoring pass over the four fixed dimensions plus any rubric criteria. The rubric phase can skip (no events, no or too-little task text), reuse the cached report's rubric when the task wording is unchanged, or degrade to a dimensions-only report when generation fails; it never blocks the fixed layer. The judge subprocess gets no tools; verdicts — per dimension and per criterion — are always derived mechanically from finding severities and coverage, never decided by the LLM. Reports are cached in `~/.mindwalk/reports`; `docs/dynamic-rubric-evaluation.md` explains the rubric layer.
- `internal/server` exposes local APIs and serves the web app. `internal/server/static` holds the embedded frontend assets generated from `web/dist`.
- `web` contains the React, Vite, and Three.js frontend.
- `schema` mirrors the exported JSON contracts.

The normal flow is:

```text
Agent session log (Claude Code, Codex, pi, or Crush) + repository path
  -> Go adapters and citymap builder
  -> local Go server APIs
  -> React/Three.js playback UI
       └─ evaluate (explicit request) -> internal/judge -> report panel
```

Crush is a database-backed source: each project keeps its own
`crush.db` SQLite file (per-project `.crush/` or global
`~/.local/share/crush/`), with message parts JSON-encoded in the
`messages.parts` column. When no `--crush-dir` is set, the adapter
reads Crush's `~/.local/share/crush/projects.json` registry and
queries every project database, merging all sessions; a per-Adapter
`sessionDBIndex` (`sync.Map`) routes each session id to its source
database so `Parse`/`Summarize` open the right file. The adapter
uses synthetic `crush://session/<id>` paths so the rest of
the server can route to it. The server's `scanSessions` short-circuits
the directory walk for adapters whose paths are not real files, and
`fingerprintPath` synthesises a stable zero fingerprint for `crush://`
paths so the trace cache still works. Crush sessions have no `cwd`
column, so the adapter derives the project working directory from the
database path via `projectPathForDB` (`projects.json`, then path
inference) and stamps `trace.Session.Cwd` so absolute tool-call paths
relativize correctly. Subagent sessions are recorded by Crush with
`parent_session_id` set and use the `messageID$$toolCallID` id
format; the adapter normalises those into the same `Agent` metadata
shape that the codex adapter emits, so the Agent Lens panel
displays them without a new code path. The agent-graph builders in
`internal/adapter/crush/agents.go` use `enumerateDBPaths()` to
iterate every known project database, and `openDBForPath()` to route
launch reads to the correct database in auto-discover mode.

**Crush reads go through github.com/LarsArtmann/go-crush-data**
(published module, pinned in go.mod — never a replace directive).
`internal/adapter/crush/handle.go` wraps `crushdata.DB`: `openAt`
keeps the adapter's error contract (missing database → nil handle
with no error so "no Crush installed" reads as an empty catalog;
empty file / directory-in-the-way → distinctive errors naming the
path), and the adapter's `dbCache` stores `*crushdata.DB` handles
keyed by database path. The SDK owns: read-only DSN construction,
schema capability probing (table-qualified), sessions/messages/
read_files queries, and parts JSON decoding into sealed `Part`
types; `parts.go` only folds decoded parts into trace events/marks
(`decodeParts(raw, ts)` composes `crushdata.DecodeParts` + fold for
raw-column callers). Schema-drift warnings come from
`Schema().MissingColumns()` — the old probe checked
`parent_session_id` against the messages table where it never
exists, so every real database warned spuriously; the SDK checks
each column against its real table. `trace <session>` from the CLI
only routes correctly inside the adapter's own data dir (no
`sessionDBIndex` without a prior `ListSessions` scan) — pre-existing
limitation, unchanged.

The Crush adapter pins go-crush-data at v0.3.0. `Adapter.Parse`
and the agent-launch reader stream messages one at a time via
`crushdata.IterMessages` — the cross-message tool_call /
tool_result pairing resolves through the pending/results maps, so
no earlier message is revisited and huge sessions stay flat in
memory. `DecodeTodos` is proven against the committed fixture by
`todo_spike_test.go`; a UI surface for todo state remains a
roadmap idea. The SDK's `ToolResultPart.IsError` reaches the trace
through the `OutcomeKnown` model field — every Crush tool result the
SDK surfaces must be marked `OutcomeKnown: true` in
`internal/adapter/crush/parts.go`, otherwise `model.ComputeStats`
auto-degrades the error observability grade from Exact to
Estimated on every session with deferred tool outputs (Crush
splits a tool_call and its tool_result across messages; the
adapter must pair them by `ToolCallID`, not array index).

Computed agent graphs are persisted to `~/.mindwalk/agent-graphs/`
as versioned JSON files keyed by a stable digest of the session's
input file paths, sizes, and modification times. The cache auto-evicts
oldest files when the directory exceeds 100 MB. Override the base
directory with `MINDWALK_HOME` (used by tests and CI). The crush
adapter also implements `Diagnostics()` — the `mindwalk doctor`
command type-asserts to `adapter.DiagnosticsSource` and runs deeper
health checks (data-dir readability, projects.json validity, schema
column coverage) beyond the session-count summary.

## Development

- Use `make setup` to install frontend dependencies.
- Use `make test` for the standard validation pass. `npm` comes from
  the flake devShell, so run it as `nix develop -c make test` when
  npm is not on the host PATH.
- Use `make serve` for local development.
- Use `make build` when refreshing the distributable binary and embedded frontend assets.

Nix build constraints worth remembering:

- `go.mod`'s `go` directive must stay at or below nixpkgs' `go_1_26`
  (1.26.5 at the time of writing); the build runs with
  `GOTOOLCHAIN=local`, so a higher directive breaks `nix build`.
- `web/package-lock.json` must be regenerated (`npm install
  --package-lock-only`) whenever `web/package.json` changes; an
  out-of-sync lock makes the sandboxed frontend build fail with
  npm `ENOTCACHED`.
- Nix only sees git-tracked (or staged) files, so a newly added web
  source file must be `git add`ed before `nix build .#frontend` picks
  it up.
- Reading the WAL-mode `testdata/crush/crush.db` recreates
  `crush.db-shm`/`-wal` sidecars; they are gitignored transients, not
  artifacts to commit or untracked blockers.

Keep Go code formatted with `gofmt`. Do not hand-edit `internal/server/static`; when bundled assets need to change, regenerate them with `make build` (or `make embed-static`). When trace, citymap, or report JSON shapes change, update `schema` and the relevant tests in the same change.

Guided tours are banned in the UI. The owner removed them deliberately (the tour component and its `onReplayTour` cheat-sheet hook are gone; leftover tour CSS was purged 2026-09-07). Never build or reintroduce a guided tour in any form.

## Upstream PR stream

The fork upstreams to `cosmtrek/mindwalk` as an ordered stream of small PRs against upstream `master` (GitHub forbids cross-fork stacked bases). Filed 2026-09-09, in merge order: #25 `feat(model)` (`model-observability-signals`), #26 `refactor(adapter)` (`adapter-shared-contract`), #27 `feat(crush)` (`crush-adapter-core`), #28 server crush wiring (`server-crush-wiring`), #29 agent-graph disk cache (`agent-graph-disk-cache`), #30 doctor (`doctor-command`), #31 judge crush CLI (`judge-crush-cli`), #32 judge progress SSE (`judge-progress-sse`), #33 web crush support (`web-crush-harness`). Each branch is upstream tip `77cd795` plus slices 1..N, so each PR's own delta is its last commit — GitHub's "Files changed" shows the cumulative stack. Full suite `-count=1` (plus `-race` for server-heavy slices) verified at every slice boundary. The full design lives in `docs/planning/2026-09-09_04-05_SUPERB-upstream-landing-stream.md`.

The repo is colocated with jj (`.jj/` is gitignored; `rm -rf .jj` reverses colocation). Slices are jj changes; publish with `jj bookmark set <branch> -r <change>` then `jj git push --remote origin --bookmark <branch>`. After any upstream merge: `jj git fetch --remote upstream && jj rebase -s <bottom-slice> -d upstream/master --skip-emptied` (landed slices auto-drop), check `jj bookmark list` for a bookmark snapped onto the upstream squash commit, delete it, then push the restacked branches.

Never force-push `master`; pushes of PR branches move sideways by design (jj pushes are force-with-lease safe). Do NOT track `master@upstream` — fork master intentionally leads upstream, and tracking would turn every upstream move into a bookmark conflict. Fork CI runs on master pushes and PRs; lint is `continue-on-error` until the ~211-warning debt sweep lands — do not widen that backlog.

jj snapshot gotchas (both hit this session): untracked-but-not-ignored files leak into working-copy snapshots, and slice trees carry upstream's `.gitignore` — park Nix `result*` symlinks in `/tmp/nix-links/` while editing slices, and note that running the suite regenerates `testdata/crush/crush.db-shm/-wal` (trash them before the next jj command if they are not meant to be in that tree).

`--host` (plan task T20) is deferred, not dropped: upstream's #23 loopback hardening rejects non-loopback `Host` headers, so a wildcard bind needs a designed allowance (which Host values to accept) agreed with the maintainer. The fork's existing flag has the same latent gap — LAN browsers get 403 despite the flag's help text promising LAN access; fix the fork side first, then propose upstream.

Evaluation invariants worth protecting: a judge run starts only from an explicit user action (never from scanning), the judge subprocess stays sealed (no tools, no user config, no session persistence — see `internal/judge/cli.go`), every finding must cite real trace events, and the trace content handed to the judge is untrusted input. The rubric layer inherits that stance: a rubric is derived from untrusted input and stays untrusted — hard shape and size caps, passed to the scoring call as data, never as instructions — the four fixed dimensions are enforced by Go regardless of what the rubric contains, and a criterion the log cannot verify loses coverage instead of gaining a warning.
