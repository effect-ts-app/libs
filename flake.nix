{
  description = "Node 24.22.1 + pnpm 12 dev shell";

  inputs = {
    nixpkgs.url = "github:NixOS/nixpkgs/nixos-unstable";
    flake-utils.url = "github:numtide/flake-utils";
  };

  outputs = { self, nixpkgs, flake-utils }:
    flake-utils.lib.eachDefaultSystem (system:
      let
        pkgs = import nixpkgs { inherit system; };
        # nixpkgs nodejs_24 lags the latest 24.x patch (this lock still has
        # 24.14.1). Fetch the official binary instead.
        nodejsVersion = "24.22.1";
        nodejsSources = {
          x86_64-linux = {
            url = "https://nodejs.org/dist/v${nodejsVersion}/node-v${nodejsVersion}-linux-x64.tar.xz";
            hash = "sha256-bBcqmrZxj3uAH7WnvUhq8u5eMnWAhqBLhPzOKqdwleY=";
          };
          aarch64-linux = {
            url = "https://nodejs.org/dist/v${nodejsVersion}/node-v${nodejsVersion}-linux-arm64.tar.xz";
            hash = "sha256-26v3ocv5R+YFn/rSwnuABB25feoeVTtir97n8T/KM24=";
          };
          x86_64-darwin = {
            url = "https://nodejs.org/dist/v${nodejsVersion}/node-v${nodejsVersion}-darwin-x64.tar.xz";
            hash = "sha256-ZeRQ+Qpuqs1QAPYRhhxM5l+tyH+BN5XcTtDA5fL8otQ=";
          };
          aarch64-darwin = {
            url = "https://nodejs.org/dist/v${nodejsVersion}/node-v${nodejsVersion}-darwin-arm64.tar.xz";
            hash = "sha256-ZUunneYVVkfiIyGTK0Xyocy3BZdswzfJuOJ4vrCFpig=";
          };
        };
        nodejsSrc = nodejsSources.${system} or (throw "no nodejs ${nodejsVersion} binary for ${system}");
        nodejs = pkgs.stdenv.mkDerivation {
          pname = "nodejs";
          passthru.python = pkgs.python3;
          meta.platforms = builtins.attrNames nodejsSources;
          version = nodejsVersion;
          src = pkgs.fetchurl nodejsSrc;
          sourceRoot = "node-v${nodejsVersion}-${
            if pkgs.stdenv.isDarwin then "darwin" else "linux"
          }-${
            if pkgs.stdenv.isAarch64 then "arm64" else "x64"
          }";
          nativeBuildInputs = pkgs.lib.optionals pkgs.stdenv.isLinux [ pkgs.autoPatchelfHook ];
          buildInputs = pkgs.lib.optionals pkgs.stdenv.isLinux [ pkgs.stdenv.cc.cc.lib ];
          dontConfigure = true;
          dontBuild = true;
          # The official binary embeds a V8 snapshot. Stripping breaks it.
          dontStrip = true;
          installPhase = ''
            runHook preInstall
            mkdir -p $out
            cp -a * $out/
            runHook postInstall
          '';
        };
        # pnpm 12 is a native binary. The JavaScript tarball only installs that
        # binary, and nixpkgs generic.nix still links bin/pnpm.cjs, so fetch the
        # platform package. Hardlinks, not symlinks: the binary reads its own
        # filename (pnpx and pnx mean dlx) and realpath collapses a symlink to pnpm.
        pnpmVersion = "12.14.0";
        pnpmSources = {
          x86_64-linux = {
            url = "https://registry.npmjs.org/@pnpm/exe.linux-x64/-/exe.linux-x64-${pnpmVersion}.tgz";
            hash = "sha256-HemO0uliEROwiHsGMitGHvud9z2RP8HRUQObELcRekE=";
          };
          aarch64-linux = {
            url = "https://registry.npmjs.org/@pnpm/exe.linux-arm64/-/exe.linux-arm64-${pnpmVersion}.tgz";
            hash = "sha256-58okIk62JqAygo7FhMZ5A60vOJkRuEnQCe1woZ9w2NM=";
          };
          x86_64-darwin = {
            url = "https://registry.npmjs.org/@pnpm/exe.darwin-x64/-/exe.darwin-x64-${pnpmVersion}.tgz";
            hash = "sha256-T+WqbAujAT+K77HMI908VPcnKBS+SwJ1601qmNd2niY=";
          };
          aarch64-darwin = {
            url = "https://registry.npmjs.org/@pnpm/exe.darwin-arm64/-/exe.darwin-arm64-${pnpmVersion}.tgz";
            hash = "sha256-BhNpIMnMytT2FbsIDgVNmsCG/t/DJJe9h6iSt6RYb28=";
          };
        };
        pnpmSrc = pnpmSources.${system} or (throw "no pnpm ${pnpmVersion} binary for ${system}");
        pnpm = pkgs.stdenv.mkDerivation {
          pname = "pnpm";
          version = pnpmVersion;
          src = pkgs.fetchurl pnpmSrc;
          sourceRoot = "package";
          nativeBuildInputs = pkgs.lib.optionals pkgs.stdenv.isLinux [ pkgs.autoPatchelfHook ];
          buildInputs = pkgs.lib.optionals pkgs.stdenv.isLinux [ pkgs.stdenv.cc.cc.lib ];
          dontBuild = true;
          installPhase = ''
            runHook preInstall
            install -Dm755 pnpm $out/bin/pnpm
            ln $out/bin/pnpm $out/bin/pn
            ln $out/bin/pnpm $out/bin/pnx
            ln $out/bin/pnpm $out/bin/pnpx
            runHook postInstall
          '';
        };
        # keep generated compiler launchers on the patched runtime
        typescript = pkgs.typescript.override {
          buildNpmPackage = pkgs.buildNpmPackage.override { inherit nodejs; };
        };
        tools = with pkgs; [
          git
          nixfmt-classic
          nodejs
          pnpm
          typescript
        ];
      in {
        devShells.default = pkgs.mkShellNoCC {
          packages = tools;
        };
      });
}
