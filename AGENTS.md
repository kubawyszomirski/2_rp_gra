# Project instructions

## Project purpose

This repository is based on Social Democracy: An Alternate History.

The long-term goal is to create a strategy and interactive-fiction game
about playing the Polish Socialist Party (PPS) during the Second Polish
Republic.

The existing German game is the working baseline. Preserve its behaviour
until a specific Polish replacement has been researched and approved.

## Project structure

- `source/` contains Dendry game content, events, state changes and logic.
- `assets/img/` contains source image assets.
- `out/` contains compiled or deployed output.
- `PLAN.md` records product scope and milestones.
- `MECHANICS_MAP.md` documents systems and proposed Polish equivalents.
- `STATE_VARIABLES.md` documents important game-state variables.
- `HISTORICAL_SOURCES.md` records evidence for historical content.

## Source and generated files

- For game content and logic, edit files under `source/`.
- Do not manually edit `out/game.json`.
- Do not manually edit generated files such as:
  - `out/html/core.js`
  - `out/html/jquery-1.11.1.min.js`
  - `out/html/d3.v7.min.js`
  - `out/html/img/`
- Some tracked files under `out/html/` are customized runtime or interface
  files. Modify them only when the task specifically requires an interface
  or runtime change.
- Preserve `assets/img/` as the source for copied images.
- Run the build after changing Dendry source or source assets.

## Required environment and commands

The tested local environment is:

- Node.js 22.21.1
- npm 10.9.4

Install dependencies with:
```
npm ci
```

Build with:
```
npm run build
```

Run locally with:
```
npm run serve
```

Do not replace these commands with undocumented alternatives.

## Historical standards

- Do not invent historical facts, statistics, people, organizations or
  citations.
- Record important historical sources in `HISTORICAL_SOURCES.md`.
- Distinguish between:
  - documented historical fact;
  - gameplay simplification;
  - alternate-history outcome;
  - unresolved research question.
- Mark uncertain Polish equivalents as:
  `TBD — historical research required`.
- Do not treat German and Polish institutions as equivalent merely because
  they have similar names.
- Preserve `credits_images.txt` and `credits_music.txt`.
- Do not imply that media assets are covered by the repository's MIT code
  licence unless their individual licences establish that.

## Change discipline

- Inspect `git status` before modifying files.
- Preserve unrelated user changes.
- Do not delete files or assets merely because they appear unused.
- Do not perform mass search-and-replace or mass variable renaming.
- Implement one bounded system or mechanic at a time.
- Do not convert the project to Python, React, TypeScript or another engine
  without explicit user approval.
- Do not run `npm audit fix`.
- Do not upgrade, replace or remove dependencies without explicit approval.
- Do not remove `parliament-svg` until its necessity has been investigated.
- Do not commit or push unless the user explicitly asks.
- Before committing, show the user the Git status and a concise diff summary.

## Verification

After relevant changes:

1. Run `npm run build`.
2. Confirm the build exits successfully.
3. Confirm required D3 and image assets appear under `out/html/`.
4. Run available automated tests.
5. Perform an appropriate browser smoke test when gameplay or UI changes.
6. Report all warnings, failures and modified files.

A successful build alone does not prove gameplay is correct.

## Documentation work

When mapping the existing game:

- Cite repository-relative source-file paths.
- Document evidence from the code rather than guessing.
- Clearly label incomplete or uncertain conclusions.
- Do not change gameplay while performing documentation-only tasks.
- Keep `PLAN.md`, `MECHANICS_MAP.md`, `STATE_VARIABLES.md` and
  `HISTORICAL_SOURCES.md` current as related decisions are approved.

## Communication

- Explain changes in plain language suitable for a user who is new to
  JavaScript and Dendry.
- State assumptions explicitly.
- Ask before making a choice that would substantially change game design,
  historical interpretation or architecture.
