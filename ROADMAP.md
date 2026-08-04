# Roadmap

> Long-term direction and raw ideas for the mindwalk fork
> (`LarsArtmann/mindwalk`). Items here are NOT actionable tasks. When an
> idea is refined into bounded work with a clear scope and effort estimate,
> it moves to [TODO_LIST.md](TODO_LIST.md).

## Themes

### 1. Adapter ecosystem

mindwalk currently supports Claude Code, Codex, pi, and Crush. Each adapter
is a self-contained package behind the `internal/adapter` boundary, and
DB-backed sources (Crush today) use a synthetic `crush://session/<id>` handle
so the server's filesystem code works unchanged. The natural next step is
more agent formats and a cleaner shared contract for non-filesystem sources.

Raw ideas:

- Support more agent formats — Aider, Goose, Cursor, Continue — each behind
  its own adapter package.
- Generalize the synthetic-path scheme into a `model.SyntheticPath(scheme, id)`
  helper once a second DB-backed adapter lands. The typed helpers
  (`crush.SessionPath`, `IsSessionPath`, `SessionIDFromPath`) are localised
  today; extraction should be informed by two real consumers, not one.
- Cross-check the Crush `parts` parser against the latest upstream source on
  each Crush release. The parser was built from a frozen snapshot; new part
  types or renamed discriminators would be silently swallowed by the
  "unknown part type ignored" path.
- Surface the Crush `files` table as a before/after diff viewer. The data
  (versioned file content) is rich, but the UX is a separate project.

### 2. Performance at scale

The read path works at fixture scale (~280μs/parse) and the DB connection
cache keeps `*sql.DB` handles open across requests, but the system is
untested beyond a 20KB database and ~200 real sessions.

Raw ideas:

- Stress test with a 100k-message Crush session to find the first bottleneck
  (likely the per-row `parts` JSON decode).
- Lazy-load project databases: only open a project DB when a session from it
  is requested, not during the full listing scan.
- Connection-pool limits and WAL-safe reads across 100+ simultaneous
  read-only connections.
- Cache the `projects.json` parse with a TTL instead of re-reading it on
  every `ListSessions` call.

### 3. Real-time streaming infrastructure

The SSE judge-progress stream works but was built from scratch with
`net/http`. It has no heartbeat, no reconnection support, and no rate
limiting.

Raw ideas:

- Add SSE reconnection support — track event IDs, replay missed events on
  reconnect via `Last-Event-ID`.
- Use a dedicated SSE library (e.g. `github.com/larsartmann/go-sse`) instead
  of hand-rolled SSE — gets heartbeats, reconnection, and broadcaster for
  free.
- Generalize SSE infrastructure for other long-running operations (citymap
  building, agent graph computation, trace parsing).

### 4. Test infrastructure

Server tests now run in ~0.3s after isolation fixes (`TestMain` redirects
data dirs). The fixture has file-touching tool calls. But there is no CI
matrix, no property-based path-normalization tests, and no E2E browser test
beyond a single agent-lens spec.

Raw ideas:

- CI matrix that runs tests with and without real Crush/Claude/Codex data.
- Property-based tests for `normalizePath` (absolute, relative, with/without
  cwd, symlinks).
- A richer fixture with multiple tool types (read, edit, bash, grep) covering
  path-normalization edge cases and cross-project agent graphs.
- Split server tests into fast and slow groups (build tag or separate
  package) if the suite grows significantly.

### 5. Frontend observability

The web UI trusts the API. When an adapter is misconfigured, the only signals
are the HUD's 0-target warning and the Cwd display. Adapter health is not
surfaced.

Raw ideas:

- Surface adapter health in the UI — a status panel backed by `/api/adapters`
  showing which adapters are wired, their data directories, and session
  counts.
- Group sessions by project in the rail sidebar (derived from `projects.json`).
- Add a thinking lane in the Timeline for visual duration bars (requires
  per-message duration wiring).

## Open questions

Decisions that need the maintainer's input. These are NOT tasks — they are
blockers that, once answered, resolve into TODO items or non-goals.

1. **Open a PR upstream (`cosmtrek/mindwalk`) for the Crush adapter, or keep
   the fork divergent?** The Crush adapter touches shared code
   (`adapter.go` switch cases, `server.go` Config), and upstream has its own
   adapter architecture (pi was just merged). Contributing back vs.
   maintaining a fork is a direction question.
2. **Should the Crush `projects.json` scan be opt-in (a flag) or always-on?**
   Always-on "just works" (196 sessions appear) but reads a file outside the
   project directory, which some users may not expect.
3. **Should `git diff` output classify as "read" or "search" in the action
   trail?** It is semantically reading file contents (the changes) but also
   searching the tree for modifications. This affects trail classification
   and fovea/parafovea stats.
4. **Should diff-extracted touches be weak or non-weak?** git diff headers
   are structurally deterministic, not heuristic scraping — an argument for
   non-weak. But non-weak touches carry stronger semantic weight.
5. **Push for an upstream Crush schema change to add a `cwd` column?** The
   current Cwd derivation (from `projects.json` + path inference) breaks for
   sessions whose working directory moved or was renamed since the session
   ran.
6. **Should `web/pnpm-lock.yaml` be committed or gitignored?** The project
   uses npm conventionally, but this machine used pnpm. Committing the
   pnpm lockfile changes the project's package-manager convention.

## Non-goals

Things this fork is deliberately NOT pursuing and why:

- **Replacing `SessionMeta.Path` with a typed `SessionHandle` struct** — a
  breaking API change with no concrete payoff yet; the synthetic-path
  helpers already localise the contract.
- **Supporting the older `title-<sessionID>` agent-tool id format** — Crush
  no longer emits it; the `messageID$$toolCallID` format is current.
- **Generalizing the synthetic-path scheme before a second DB-backed
  adapter exists** — YAGNI; one consumer and four guarded call sites do not
  justify a generic abstraction yet.
