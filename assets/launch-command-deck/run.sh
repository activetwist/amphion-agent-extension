#!/usr/bin/env zsh
set -euo pipefail

ROOT="$(cd "$(dirname "$0")" && pwd)"
HOST="${KANBAN_HOST:-127.0.0.1}"

CONFIG_FILE="$ROOT/../config.json"
CONFIGURED_PORT=""
if [[ -f "$CONFIG_FILE" ]]; then
    CONFIGURED_PORT=$(grep -Eo '"port"\s*:\s*"[0-9]+"' "$CONFIG_FILE" | grep -Eo '[0-9]+' || echo "")
fi

PORT="${1:-${KANBAN_PORT:-${CONFIGURED_PORT:-8765}}}"

python3 "$ROOT/server.py" --host "$HOST" --port "$PORT"
