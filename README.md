# Social Democracy: An Alternate History

## Requirements

- Node.js 22.21.1, pinned in `.nvmrc`
- npm 10.9.4, the version used to verify this baseline

With `nvm` installed, select the repository's Node version before installing dependencies:

```sh
nvm use
```

## Install, build, and serve

Install the exact dependency versions recorded in `package-lock.json`:

```sh
npm ci
```

Build the game and its browser assets:

```sh
npm run build
```

The build compiles the DendryNexus source, writes the generated runtime under `out/`, copies D3 to `out/html/d3.v7.min.js`, and copies source images from `assets/img/` to `out/html/img/`.

Serve the built game at `http://localhost:8000`:

```sh
npm run serve
```

## Source and generated output

- Gameplay source lives in `source/`.
- Source media lives in `assets/img/` and is committed to Git.
- Generated files include `out/game.json`, `out/html/core.js`, `out/html/jquery-1.11.1.min.js`, `out/html/d3.v7.min.js`, `out/html/game.json`, and `out/html/img/`. These are reproducible build products and are ignored by Git.
- The existing tracked custom files in `out/html/` are intentionally preserved: `.jshintrc`, `d3-linegraph.js`, `d3-parliament.js`, `game.css`, `game.js`, and `index.html`.

Do not use the DendryNexus `--overwrite` option unless replacing the custom HTML files is intentional.

## Included libraries

[jquery v1.11.1](https://releases.jquery.com/)

[d3.js v7](https://d3js.org)

[d3-parliament](https://github.com/geoffreybr/d3-parliament)

The DendryNexus dependency is pinned to commit `aa4287ed2c03940c52b190c0a8c102b795ac1c79` through HTTPS in `package.json` and `package-lock.json`.

## Licensing and media attribution

The repository's `LICENSE` file covers the code under the MIT licence unless a file states otherwise. Media assets are not automatically covered by that code licence and may have their own copyright, licence, and attribution requirements.

Preserve and consult `credits_images.txt` for image attribution and `credits_music.txt` for music attribution when distributing the game or its assets.
