#!/usr/bin/env zsh
set -euo pipefail

ROOT="$(cd "$(dirname "$0")" && pwd)"
HOST="${KANBAN_HOST:-127.0.0.1}"
PORT="${1:-${KANBAN_PORT:-8765}}"

python3 "$ROOT/server.py" --host "$HOST" --port "$PORT"
