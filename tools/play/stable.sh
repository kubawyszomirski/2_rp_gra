#!/bin/sh
# Plays the last commit on its own copy of the repository (Z — 0.62).
#
# Several sessions may rebuild out/html in this checkout while their work is unfinished; a browser that plays from it
# can then mix files of two versions, and the game may go on without elections or events (audit of 7 X 2026). This
# script keeps a separate copy (a git worktree) at the last commit of main, builds it there with the usual
# `npm run build`, and serves that copy on its own port. Work in progress here never changes the game played there.
#
# Usage, from the repository root:
#   sh tools/play/stable.sh            update the copy to main, build it and serve it on http://localhost:8001
#   sh tools/play/stable.sh <commit>   the same for another commit or tag
# Environment: PLAY_DIR (default: ../2_rp_gra_play next to this repository), PORT (default 8001).
#
# The copy is generated: each run resets it to the chosen commit, so local edits there are discarded. It shares the
# node_modules of this checkout (a symbolic link), so no second `npm ci` is needed. Stop the server with Ctrl+C.
set -e

ROOT=$(cd "$(dirname "$0")/../.." && pwd)
PLAY_DIR=${PLAY_DIR:-"$ROOT/../2_rp_gra_play"}
PORT=${PORT:-8001}
REF=${1:-main}

COMMIT=$(git -C "$ROOT" rev-parse --verify "$REF^{commit}")

if [ -e "$PLAY_DIR/.git" ]; then
  git -C "$PLAY_DIR" checkout --force --detach "$COMMIT"
else
  git -C "$ROOT" worktree add --detach "$PLAY_DIR" "$COMMIT"
fi

if [ ! -e "$PLAY_DIR/node_modules" ]; then
  ln -s "$ROOT/node_modules" "$PLAY_DIR/node_modules"
fi

(cd "$PLAY_DIR" && npm run build)

echo "Playing $(git -C "$PLAY_DIR" log --oneline -1) on http://localhost:$PORT"
exec python3 -m http.server "$PORT" --directory "$PLAY_DIR/out/html"
