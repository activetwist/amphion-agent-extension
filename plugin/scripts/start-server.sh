#!/usr/bin/env bash
# start-server.sh — Start the Command Deck server.
# Used by hooks and /server skill.
# Reads port from .amphion/config.json, starts server.py in background.
# Exit 0 = success/already running. Exit 2 = blocked (feedback to Claude).

set -euo pipefail

CONFIG_FILE=".amphion/config.json"
DEFAULT_PORT="8765"

# Resolve port
if [ -f "$CONFIG_FILE" ]; then
  PORT=$(python3 -c "import json; print(json.load(open('$CONFIG_FILE')).get('port', '$DEFAULT_PORT'))" 2>/dev/null || echo "$DEFAULT_PORT")
else
  PORT="$DEFAULT_PORT"
fi

# Resolve command deck path
if [ -f "$CONFIG_FILE" ]; then
  CMD_DECK=$(python3 -c "import json; print(json.load(open('$CONFIG_FILE')).get('commandDeckPath', '.amphion/command-deck'))" 2>/dev/null || echo ".amphion/command-deck")
else
  CMD_DECK=".amphion/command-deck"
fi

# Check if already running
HEALTH=$(curl -s --max-time 2 "http://127.0.0.1:${PORT}/api/health" 2>/dev/null || echo "")
if echo "$HEALTH" | python3 -c "import json,sys; d=json.load(sys.stdin); exit(0 if d.get('ok') and 'launch-command-deck' in d.get('runtime',{}).get('fingerprint','') else 1)" 2>/dev/null; then
  echo "Command Deck already running on port ${PORT}."
  exit 0
fi

# Check server script exists — exit 0 (not 2) if missing,
# so SessionStart hook doesn't block on a fresh project before /amphion
SERVER_SCRIPT="${CMD_DECK}/server.py"
if [ ! -f "$SERVER_SCRIPT" ]; then
  echo "No AmphionAgent workspace found. Run /amphion to set up."
  exit 0
fi

# Start server
python3 "$SERVER_SCRIPT" --port "$PORT" &
SERVER_PID=$!
disown "$SERVER_PID" 2>/dev/null || true

# Wait for health
for i in $(seq 1 10); do
  sleep 0.5
  HEALTH=$(curl -s --max-time 1 "http://127.0.0.1:${PORT}/api/health" 2>/dev/null || echo "")
  if echo "$HEALTH" | python3 -c "import json,sys; d=json.load(sys.stdin); exit(0 if d.get('ok') else 1)" 2>/dev/null; then
    echo "Command Deck started on port ${PORT} (pid ${SERVER_PID})."
    exit 0
  fi
done

echo "Failed to start Command Deck on port ${PORT}." >&2
exit 2
