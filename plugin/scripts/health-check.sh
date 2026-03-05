#!/usr/bin/env bash
# health-check.sh — Check Command Deck server health.
# Exit 0 = canonical runtime online. Exit 2 = offline (blocks hook action).
# Stdout is injected as context into Claude's session.

set -euo pipefail

CONFIG_FILE=".amphion/config.json"
DEFAULT_PORT="8765"

if [ -f "$CONFIG_FILE" ]; then
  PORT=$(python3 -c "import json; print(json.load(open('$CONFIG_FILE')).get('port', '$DEFAULT_PORT'))" 2>/dev/null || echo "$DEFAULT_PORT")
else
  PORT="$DEFAULT_PORT"
fi

HEALTH=$(curl -s --max-time 2 "http://127.0.0.1:${PORT}/api/health" 2>/dev/null || echo "")

if [ -z "$HEALTH" ]; then
  echo "Command Deck offline on port ${PORT}. Run /server start to launch." >&2
  exit 2
fi

IS_CANONICAL=$(echo "$HEALTH" | python3 -c "
import json,sys
try:
  d = json.load(sys.stdin)
  fp = d.get('runtime',{}).get('fingerprint','')
  if d.get('ok') and 'launch-command-deck' in fp:
    print('canonical')
  else:
    print('noncanonical')
except:
  print('error')
" 2>/dev/null)

if [ "$IS_CANONICAL" = "canonical" ]; then
  echo "Command Deck online at http://127.0.0.1:${PORT} (canonical runtime)."
  exit 0
elif [ "$IS_CANONICAL" = "noncanonical" ]; then
  echo "Non-canonical service on port ${PORT}. Stop it and run /server start." >&2
  exit 2
else
  echo "Command Deck health check failed on port ${PORT}." >&2
  exit 2
fi
