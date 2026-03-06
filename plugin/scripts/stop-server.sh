#!/usr/bin/env bash
# stop-server.sh — Stop the Command Deck server.
# Finds process on configured port and terminates it.

set -euo pipefail

CONFIG_FILE=".amphion/config.json"

# Resolve port from config.json (single source of truth)
if [ -f "$CONFIG_FILE" ]; then
  PORT=$(python3 -c "import json; p=json.load(open('$CONFIG_FILE')).get('port',''); print(p)" 2>/dev/null)
  if [ -z "$PORT" ]; then
    echo "No port configured in $CONFIG_FILE. Run /amphion to set up." >&2
    exit 1
  fi
else
  echo "No AmphionAgent workspace found. Run /amphion to set up." >&2
  exit 1
fi
PORT="${KANBAN_PORT:-$PORT}"

# Find and kill process
PIDS=$(lsof -t -i:"${PORT}" 2>/dev/null || echo "")
if [ -z "$PIDS" ]; then
  echo "No process found on port ${PORT}."
  exit 0
fi

echo "$PIDS" | xargs kill 2>/dev/null || true
sleep 1

# Verify stopped
HEALTH=$(curl -s --max-time 1 "http://127.0.0.1:${PORT}/api/health" 2>/dev/null || echo "")
if [ -z "$HEALTH" ]; then
  echo "Command Deck stopped (port ${PORT})."
  exit 0
fi

# Force kill if still alive
echo "$PIDS" | xargs kill -9 2>/dev/null || true
echo "Command Deck force-stopped (port ${PORT})."
