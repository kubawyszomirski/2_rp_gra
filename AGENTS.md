# Repository guidance

This repository contains a DendryNexus interactive-fiction game. Keep infrastructure and reproducibility changes separate from gameplay changes.

## Source and generated files

- Treat `source/**/*.dry` as gameplay source.
- Treat `assets/img/` as source media. Commit required media there and let the build copy it into `out/html/img/`.
- Do not edit or commit generated files: `out/game.json`, `out/html/core.js`, `out/html/jquery-1.11.1.min.js`, `out/html/d3.v7.min.js`, `out/html/game.json`, or `out/html/img/`.
- Preserve the six tracked custom files under `out/html/`: `.jshintrc`, `d3-linegraph.js`, `d3-parliament.js`, `game.css`, `game.js`, and `index.html`.
- Do not run DendryNexus with `--overwrite` unless the user explicitly authorizes replacing custom HTML files.
- Do not commit `node_modules/`, `.idea/`, or `.DS_Store` files.

## Toolchain and verification

- Use the Node version in `.nvmrc` and install dependencies with `npm ci`.
- Build with `npm run build` and serve locally with `npm run serve`.
- Keep `package.json` and `package-lock.json` synchronized when changing dependencies.
- After build-related changes, verify that D3 and all required image assets exist in `out/html/`, and inspect `git status` to ensure generated files remain ignored.
- Do not run `npm audit fix` unless the user explicitly requests it.

## Scope and licensing

- Do not change gameplay, balancing, narrative logic, or remove apparently unused assets unless explicitly requested.
- Do not remove `parliament-svg` without a separate dependency review.
- Preserve `credits_images.txt` and other attribution files. The repository's MIT licence applies to the code unless stated otherwise; media files may have separate licences and attribution requirements.
