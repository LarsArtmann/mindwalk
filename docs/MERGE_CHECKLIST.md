# Merge Checklist

Mindwalk is a downstream fork of `cosmtrek/mindwalk` that adds the Crush
adapter and a small set of agent-graph and routing changes. Every branch
that lands on `master` eventually has to be reconciled with `upstream` —
this checklist codifies what to do so a fork drop does not drag in old
behaviour, and a fork-only change does not break upstream's invariants.

## Tier 0 — before you push anything

- `go build ./... && go vet ./... && go test ./...` clean.
- `go test -race -count=1 ./internal/adapter/... ./internal/server/...`
  clean (race trips over the s.mu refactor if you regress it).
- `grep -rn "database/sql\|openSQLite" internal/adapter/crush/ | grep -v _test`
  returns nothing. The Crush adapter reads only through the SDK; a
  re-introduction of a hand-written SQLite layer means a fork-only
  refactor drifted from the proxy.
- `nix flake check --no-build` reports `all checks passed!`.
- `git log upstream/master..HEAD --oneline` is intentional and reviewed.
- The branch was force-pushed with `--force-with-lease` (never `--force`),
  or was pushed cleanly.

## Tier 1 — during merge

- Always use `git merge --no-ff` so the merge commit carries the fork
  relationship in the graph.
- When merging a fork-only branch into `master`:
  - expect conflicts in `go.mod`/`go.sum`, resolve to keep the higher
    module version (the SDK is published).
  - expect conflicts in `web/package.json`, resolve by running `pnpm
    install` from a clean checkout and committing the lockfile diff.
  - expect conflicts in `flake.nix`/`flake.lock`. Prefer `nix flake
    update` to a hand-merge so the lock entries stay self-consistent.
- When pulling `upstream` into the fork:
  - read the upstream release notes before merging; an evaluator change
    affects the rubric layer and T20 (OutcomeKnown sweep) may need to
    re-run.
  - rerun T03 plus T13 after merging — the upstream lock discipline on
    `s.mu` is stricter than the fork's pre-merge state.

## Tier 2 — after merge

- Push with `git push origin master` and verify the remote branch is
  at the merge commit.
- Update `CHANGELOG.md` only if the merge changed a user-visible
  behaviour (a dependency bump alone does not).
- If you merged upstream, file a PR upstream only if the change you
  carried matches upstream's direction (T24). Don't push the Crush
  adapter itself upstream unless asked — it depends on the fork's
  per-project `crush.db` discovery the upstream does not have.

## Invariants protected across every merge

- The judge subprocess stays sealed (`internal/judge/cli.go`).
- `cmd/mindwalk/main.go` still wires every adapter registered in
  `internal/server/server.go`'s adapter list.
- `internal/adapter/crush/parts.go` folds `ToolResultPart.IsError`
  into `OutcomeKnown: true` — never silently reverts to Estimated.
- `web/dist` matches the build output of `make build` after a
  dependency change in `web/`.
