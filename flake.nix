{
  inputs = {
    nixpkgs.url = "github:nixos/nixpkgs/nixos-unstable";
    pre-commit-hooks = {
      url = "github:cachix/pre-commit-hooks.nix";
      inputs.nixpkgs.follows = "nixpkgs";
    };
  };

  outputs = {
    self,
    nixpkgs,
    pre-commit-hooks,
  }: let
    forEachSystem = nixpkgs.lib.genAttrs [
      "aarch64-darwin"
      "aarch64-linux"
      "x86_64-darwin"
      "x86_64-linux"
    ];
  in {
    devShells = forEachSystem (system: let
      pkgs = nixpkgs.legacyPackages.${system};
      checks = {
        pre-commit-check = pre-commit-hooks.lib.${system}.run {
          src = ./.;
          hooks = {
            actionlint.enable = true;
            alejandra.enable = true;
            prettier.enable = true;
          };
        };
      };
    in {
      default = pkgs.mkShell {
        buildInputs = with pkgs; [
          nodejs_20
        ];
        shellHook = ''
          export PATH="$PWD/node_modules/.bin:$PATH"
          ${checks.pre-commit-check.shellHook}
        '';
      };
    });

    packages = forEachSystem (system: let
      pkgs = nixpkgs.legacyPackages.${system};
      name = "batch-edit-prs";
      script = (pkgs.writeScriptBin name (builtins.readFile ./dist/index.js)).overrideAttrs (old: {
        buildCommand = "${old.buildCommand}\n patchShebangs $out";
      });
    in {
      default = nixpkgs.legacyPackages.${system}.symlinkJoin {
        inherit name;
        paths = [script];
        buildInputs = [pkgs.makeWrapper];
        postBuild = "wrapProgram $out/bin/${name} --prefix PATH: $out/bin";
      };
    });
  };
}
