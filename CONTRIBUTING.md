# Contributing

Thanks for your interest in contributing!

## How to Contribute

1. Fork the repository
2. Create a feature branch
3. Make your changes
4. Submit a pull request

Before opening a PR, walk through [`docs/MERGE_CHECKLIST.md`](docs/MERGE_CHECKLIST.md).
The three-tier review (parity, lint, runtime) catches the regressions
that most often sneak into this repo: schema/frontend drift, missing
race coverage, and runtime breakage on the committed fixture.

## Fork-only vs upstream

This repository is a fork of [`cosmtrek/mindwalk`](https://github.com/cosmtrek/mindwalk).
It adds the Crush adapter, the `go-crush-data` SDK integration, and
several follow-on patches. When contributing:

- **Upstream-applicable changes** (e.g. small refactors in
  `internal/server`, schema or citymap fixes that don't reference
  Crush) should target `cosmtrek/mindwalk:master` via a focused PR.
- **Fork-only changes** (anything in `internal/adapter/crush`,
  `internal/judge/cli.go:crush`, or that consumes a fork-only SDK)
  should target this repository.

The post-merge status report (`docs/status/2026-08-16_09-28_pareto-plan-executed-end-to-end.md`)
calls out which fixes are upstream-applicable (T06+T07) and which
are fork-only by definition.

## Development Setup

Run the following commands to set up your development environment:

    go test ./... -race
    golangci-lint run ./...

The `-race` flag is required; race regressions are easy to introduce
in the agent-graph cache and the SSE handlers.

## Reporting Issues

Please use GitHub Issues to report bugs or request features.
