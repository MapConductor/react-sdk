#!/usr/bin/env bash
set -euo pipefail

ROOT_DIR="$(cd "$(dirname "$0")/.." && pwd)"

resolve_node() {
  if [[ -n "${NODE_BINARY:-}" && -x "${NODE_BINARY:-}" ]]; then
    "$NODE_BINARY" --print "process.execPath"
    return
  fi

  if command -v node >/dev/null 2>&1; then
    node --print "process.execPath"
    return
  fi

  local candidate
  for candidate in \
    "$HOME/.volta/bin/node" \
    "$HOME/.nvm/current/bin/node" \
    "/opt/homebrew/bin/node" \
    "/usr/local/bin/node" \
    "/usr/bin/node"; do
    if [[ -x "$candidate" ]]; then
      echo "$candidate"
      return
    fi
  done

  echo "node executable not found. Install Node.js or set NODE_BINARY." >&2
  exit 1
}

resolve_android_studio() {
  if [[ -n "${ANDROID_STUDIO_BIN:-}" && -x "${ANDROID_STUDIO_BIN:-}" ]]; then
    echo "$ANDROID_STUDIO_BIN"
    return
  fi

  local candidate
  for candidate in \
    "/Applications/Android Studio.app/Contents/MacOS/studio" \
    "$HOME/Applications/Android Studio.app/Contents/MacOS/studio"; do
    if [[ -x "$candidate" ]]; then
      echo "$candidate"
      return
    fi
  done

  echo "Android Studio executable not found. Set ANDROID_STUDIO_BIN." >&2
  exit 1
}

NODE_BIN="$(resolve_node)"
STUDIO_BIN="$(resolve_android_studio)"

export NODE_BINARY="$NODE_BIN"
export PATH="$(dirname "$NODE_BIN"):$PATH"

exec "$STUDIO_BIN" "$ROOT_DIR"
