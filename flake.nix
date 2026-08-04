{
  description = "Local visualizer for coding-agent sessions";

  inputs = {
    nixpkgs.url = "github:NixOS/nixpkgs/nixos-unstable";
    flake-parts.url = "github:hercules-ci/flake-parts";
    systems.url = "github:nix-systems/default";
    treefmt-nix = {
      url = "github:numtide/treefmt-nix";
      inputs.nixpkgs.follows = "nixpkgs";
    };
  };

  outputs =
    inputs@{ self, flake-parts, ... }:
    flake-parts.lib.mkFlake { inherit inputs; } {
      systems = import inputs.systems;

      imports = [
        inputs.treefmt-nix.flakeModule
      ];

      perSystem =
        {
          config,
          pkgs,
          lib,
          ...
        }:
        let
          goPkg = pkgs.go_1_26;
          buildGoModule = pkgs.buildGoModule.override { go = goPkg; };

          version = self.rev or self.dirtyRev or "dev";

          # Frontend: React + Vite + Three.js, built into static assets
          frontend = pkgs.buildNpmPackage {
            pname = "mindwalk-web";
            inherit version;
            src = lib.fileset.toSource {
              root = ./web;
              fileset = lib.fileset.unions [
                ./web/package.json
                ./web/package-lock.json
                ./web/vite.config.ts
                ./web/tsconfig.json
                ./web/index.html
                ./web/src
              ];
            };
            npmDepsHash = "sha256-LUaQQR/tXKZ/Ti3LwNqP4BvbAkYvP/g+0uIDN3s6D+A=";
            dontNpmBuild = false;
            installPhase = ''
              runHook preInstall
              mkdir -p $out
              cp -r dist/* $out/
              runHook postInstall
            '';
          };

          # Shared source for both Go binaries. The committed static assets
          # are excluded — preBuild populates them from the frontend derivation
          # so the build is fully reproducible from source.
          goSrc = lib.fileset.toSource {
            root = ./.;
            fileset = lib.fileset.difference
              (lib.fileset.unions [
                ./go.mod
                ./go.sum
                ./cmd
                ./internal
                ./schema
                ./testdata
              ])
              ./internal/server/static;
          };

          vendorHash = "sha256-WTD17flwo+M8rNAZ3/v9xHJ58dA3Iq+BpoUpR2JWkq8=";

          # Shared buildGoModule attributes for both binaries.
          commonGoArgs = {
            inherit version vendorHash;
            src = goSrc;
            ldflags = [
              "-s"
              "-w"
            ];
            env.CGO_ENABLED = 0;
            preBuild = ''
              mkdir -p internal/server/static/assets
              cp ${frontend}/index.html internal/server/static/index.html
              cp -R ${frontend}/assets/. internal/server/static/assets/
              chmod -R u+w internal/server/static
              find internal/server/static/assets -name '*.map' -delete
            '';
          };
        in
        {
          formatter = pkgs.nixfmt-classic;

          treefmt = {
            programs.nixfmt-classic.enable = true;
            programs.gofmt.enable = true;
          };

          packages = {
            default = buildGoModule (commonGoArgs // {
              pname = "mindwalk";
              subPackages = [ "cmd/mindwalk" ];
              meta = with lib; {
                description = "Local visualizer for coding-agent sessions";
                homepage = "https://github.com/cosmtrek/mindwalk";
                license = licenses.mit;
                mainProgram = "mindwalk";
                platforms = platforms.unix ++ platforms.windows;
              };
            });

            rubriceval = buildGoModule (commonGoArgs // {
              pname = "rubriceval";
              subPackages = [ "cmd/rubriceval" ];
              doCheck = false;
              meta = with lib; {
                description = "Offline evaluation bench for the rubric judge pipeline";
                homepage = "https://github.com/cosmtrek/mindwalk";
                license = licenses.mit;
                mainProgram = "rubriceval";
                platforms = platforms.unix ++ platforms.windows;
              };
            });

            inherit frontend;
          };

          devShells.default = pkgs.mkShellNoCC {
            packages = [
              goPkg
              pkgs.nodejs_22
              pkgs.gopls
            ];
            GOTOOLCHAIN = "local";
          };

          checks = {
            build = config.packages.default;
            format = config.treefmt.build.check self;
          };

          apps.serve = {
            type = "app";
            program = pkgs.writeShellScriptBin "serve" ''
              exec ${config.packages.default}/bin/mindwalk serve "$@"
            '';
          };
        };
    };
}
