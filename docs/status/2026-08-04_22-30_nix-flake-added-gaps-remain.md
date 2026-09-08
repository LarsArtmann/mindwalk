# Status: Nix Flake Added — Works, But Gaps Remain

**Date:** 2026-08-04 22:30
**Session goal:** Add a Nix flake to mindwalk
**Verdict:** Flake builds and passes `nix flake check`, but several rough edges and missing integrations remain

---

## a) FULLY DONE

1. **`flake.nix` created and verified** — `nix build .#default` produces a working `mindwalk` binary
2. **Frontend built from source** — `buildNpmPackage` compiles the React/Vite/Three.js app, output embedded into the Go binary via `preBuild`
3. **Both Go binaries packaged** — `packages.default` (mindwalk) and `packages.rubriceval`
4. **Hashes computed and pinned** — `npmDepsHash` and `vendorHash` both filled with real values
5. **`nix flake check` passes** — all 5 checks (build, format, formatter, nixfmt, gofmt) green
6. **`nix develop` works** — Go 1.26.5, Node 22.23.2, gopls, `GOTOOLCHAIN=local`
7. **Binary verified** — `mindwalk version` and `mindwalk help` produce correct output
8. **Formatter configured** — `nixfmt` (RFC 166 style) + `gofmt` via treefmt-nix
9. **`apps.serve`** — `nix run .#serve` launches `mindwalk serve`
10. **`.gitignore` updated** — `result` and `result-*` symlinks ignored
11. **`flake.lock` created and git-tracked** — pinned to `nixos-unstable` (2026-08-04)
12. **Source filtering** — `lib.fileset` precisely scopes both frontend and Go sources; committed `internal/server/static` excluded and regenerated at build time
13. **`meta` sections complete** — description, homepage, license (MIT), mainProgram, platforms on all packages

---

## b) PARTIALLY DONE

1. **pnpm question** — User asked "Can we do pnpm instead of npm?" I investigated, found `buildPnpmPackage` does not exist in nixpkgs (`nix eval nixpkgs#buildPnpmPackage` → "Did you mean buildNpmPackage?"), then continued with npm. I did NOT clearly communicate this back to the user or explore alternatives (manual pnpm derivation, checking if `pnpm-lock.yaml` is even maintained). The project has BOTH lock files but the Makefile and CI use npm canonically.

2. **Go test integration** — `buildGoModule` runs `go test` by default during its build phase, so tests execute as part of `nix build`. But there is no dedicated `checks.test` attribute that surfaces test failures independently from the build. The `make test` target also runs `npm --prefix web run build` (frontend verification) which the flake does not replicate as a check.

3. **CI integration** — The existing `.github/workflows/ci.yml` uses `setup-go` + `setup-node` and runs `make embed-static` with a `git diff --exit-code` guard. No Nix step was added. The flake and CI are two separate build paths that could drift.

---

## c) NOT STARTED

1. **`overlays.default`** — Not exported. Consumers cannot overlay mindwalk into their own pkgs.
2. **`GOWORK = "off"` in devShell** — Only `GOTOOLCHAIN = "local"` is set. No `go.work` exists currently, but the env var is defensive best practice.
3. **README/AGENTS.md documentation** — No mention of `nix build`, `nix develop`, or `nix run` added to project docs. AGENTS.md still says "Use `make build`".
4. **Determinate Nix / Cachix integration** — No binary cache configured for faster CI pulls.
5. **Cross-compilation** — The flake builds for the local system only. `.goreleaser.yaml` targets darwin/linux/windows × amd64/arm64; the flake does not expose cross-compile targets.
6. **NixOS / Home Manager module** — No `nixosModules` or `homeManagerModules` for system-level installation.

---

## d) TOTALLY FUCKED UP

Nothing is broken or non-functional. The flake works end-to-end. The closest thing to a mistake:

1. **Redundant `dontNpmBuild = false`** — Line 52 of `flake.nix`. This is the default; setting it explicitly is noise that a reviewer would flag.
2. **Initial `nixfmt-classic` attempt** — I started with `nixfmt-classic` which was removed from nixpkgs. Caught immediately by `nix flake check` and switched to `nixfmt`. Minor wasted cycle.
3. **Double-assets path bug** — First `preBuild` used `cp -R ${frontend}/assets internal/server/static/assets/` which created `assets/assets/`. Fixed by using `cp -R .../assets/. .../assets/`. Also added `chmod -R u+w` to allow `find -delete` on store-copied files.

---

## e) WHAT WE SHOULD IMPROVE

1. **Remove `dontNpmBuild = false`** — pure noise
2. **Add `GOWORK = "off"` to devShell** — defensive, prevents workspace interference
3. **Add `overlays.default`** — standard flake hygiene, enables downstream consumption
4. **Add a dedicated `checks.go-test`** — separate from the build, surfaces failures clearly
5. **Add frontend drift check** — mirror CI's `git diff --exit-code -- internal/server/static` to catch when committed assets diverge from source-built ones
6. **Document Nix commands in AGENTS.md** — `nix build`, `nix develop`, `nix run .#serve` alongside existing `make` commands
7. **Add Nix step to CI** — `nix flake check` or `nix build` as a CI job to prevent drift between flake and Makefile paths
8. **Consider `gofumpt` instead of `gofmt`** — stricter formatting, but only if the project wants it (AGENTS.md says gofmt)
9. **Verify `rubriceval` actually builds** — `doCheck = false` was set but I never ran `nix build .#rubriceval` to confirm it compiles
10. **`apps.default`** — Currently only `apps.serve` exists; `nix run .` works via `packages.default.meta.mainProgram` but an explicit default app would be cleaner for discoverability

---

## f) Up to 50 Things to Get Done Next

### Flake polish (immediate)

1. Remove `dontNpmBuild = false` redundancy
2. Add `GOWORK = "off"` to devShell
3. Verify `nix build .#rubriceval` succeeds
4. Add `overlays.default` exporting the mindwalk package
5. Add `apps.default = apps.serve` for `nix run .` discoverability

### Testing & verification

6. Run `nix build .#rubriceval` and confirm it compiles
7. Add `checks.go-test` as a standalone derivation (`buildGoModule` with `doCheck = true`, separate from production build)
8. Add frontend drift check mirroring CI's `git diff --exit-code -- internal/server/static`
9. Test `nix build --print-out-paths` to confirm reproducibility (same hash on rebuild)
10. Test `nix flake check --all-systems` for cross-platform evaluation

### CI integration

11. Add Nix job to `.github/workflows/ci.yml` using `DeterminateSystems/flake-checker-action` or `cachix/install-nix-action`
12. Add `nix flake check` to CI
13. Consider Cachix binary cache for CI
14. Verify flake build output matches `make build` output (same binary behavior)

### Documentation

15. Update `AGENTS.md` Development section with Nix commands
16. Update `README.md` with `nix run` quick-start
17. Document the `MINDWALK_HOME` env var in devShell context
18. Add `flake.nix` to the project file inventory in AGENTS.md
19. Note in AGENTS.md that `internal/server/static` is auto-generated by the flake

### Package quality

20. Add `meta.longDescription` for richer package metadata
21. Add `meta.changelog` pointing to CHANGELOG.md
22. Consider splitting `commonGoArgs` into a separate `nix/common-go-args.nix` if the flake grows
23. Pin nixpkgs to a specific commit (currently `nixos-unstable` rolling)
24. Add `nixpkgs-stable` input as alternative for reproducible production builds

### DevShell improvements

25. Add `air` or `gow` for live-reload during development
26. Add `nodePackages.typescript-language-server` for frontend LSP
27. Add `playwright` test deps to devShell (currently in `web/devDependencies`)
28. Add `sqlite` to devShell for judge cache debugging
29. Add shellHook with project info banner

### Frontend build

30. Investigate whether `pnpm-lock.yaml` is maintained or stale (last touched in commit `72f91e2`)
31. If pnpm is desired: create a custom `buildPnpmPackage` derivation using `pnpm_9` + `pnpm2nix` or manual fetcher
32. Add `web/e2e` and `web/playwright.config.ts` to source filter if playwright tests are needed in flake

### Advanced Nix features

33. Add `nixosModules.default` for NixOS system installation
34. Add `homeManagerModules.default` for Home Manager users
35. Add `darwinModules.default` for nix-darwin users
36. Create `devShells.ci` — minimal shell (go + golangci-lint, no interactive tools)
37. Add `devShells.full` — everything (go, node, gopls, playwright, air, etc.)

### Cross-compilation

38. Add `packages.mindwalk-aarch64-linux` for ARM Linux
39. Add `packages.mindwalk-aarch64-darwin` for Apple Silicon
40. Use `pkgsCross` or `nixpkgs.hostPlatform` for cross-compile targets
41. Verify `CGO_ENABLED=0` holds for all cross targets

### Release pipeline

42. Integrate flake with `.goreleaser.yaml` (or replace goreleaser with nix)
43. Add `nix profile install` instructions for end-user installation
44. Add flake to `scripts/install.sh` as alternative install method
45. Generate SBOM from flake build for supply chain transparency

### Maintenance

46. Add `nix flake update` to a monthly maintenance checklist
47. Add `update-nix-deps` Makefile target that updates flake.lock
48. Consider `nixci` for multi-configuration local testing
49. Add `.editorconfig` for `.nix` files (2-space indent)
50. Review against nix-review skill checklist (85+ items) for full compliance

---

## g) Questions I Cannot Answer Myself

**1. Should the project switch from npm to pnpm?**
There are two lock files (`package-lock.json` and `pnpm-lock.yaml`). The Makefile and CI both use `npm ci`. If you want pnpm, I would need to update the Makefile, CI, and build a custom pnpm derivation (since `buildPnpmPackage` does not exist in nixpkgs). Which lock file is canonical?

**2. Should I add a Nix step to `.github/workflows/ci.yml`?**
The existing CI uses `setup-go` + `setup-node` and does a `git diff --exit-code` on embedded static assets. Adding `nix flake check` would catch Nix-specific regressions but adds a second build path. Do you want parallel CI paths (Makefile + Nix) or should Nix eventually replace the Makefile-based CI?

**3. Should the flake pin to `nixos-unstable` or a specific commit?**
Currently using `github:NixOS/nixpkgs/nixos-unstable` (rolling). This means `nix flake update` can break the build when nixpkgs changes. Pinning to a specific commit (e.g., the one in `flake.lock` now) is more reproducible but requires manual updates. What's your preference?
