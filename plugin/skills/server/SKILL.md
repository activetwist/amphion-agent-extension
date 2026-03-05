---
name: server
description: "Manage the Command Deck server — start, stop, or check status. The Command Deck is the local Python+SQLite backend for board state and MCD governance."
argument-hint: "start | stop | status"
---

This skill manages the Command Deck server lifecycle.

## Instructions

Resolve the port from `.amphion/config.json` (field: `port`, default: `8765`).
Resolve the Command Deck path from `.amphion/config.json` (field: `commandDeckPath`, default: `.amphion/command-deck`).

### `start` (or no argument)

1. Check if the server is already running: `curl -s http://localhost:{port}/api/health`
   - If response contains `"ok": true` and `"fingerprint": "launch-command-deck:python:sqlite"`, report "Command Deck already running on port {port}" and stop.
2. Start the server:
   ```bash
   python3 {commandDeckPath}/server.py --port {port} &
   ```
3. Wait 2 seconds, then verify health: `curl -s http://localhost:{port}/api/health`
4. If healthy, report "Command Deck started on port {port}." and open the dashboard: `open http://localhost:{port}`
5. If not healthy after 5 seconds, report the error.

### `stop`

1. Find the server process: `lsof -t -i:{port}`
2. If found, terminate it: `kill {pid}`
3. Wait 1 second, verify: `curl -s http://localhost:{port}/api/health` should fail.
4. Report "Command Deck stopped."

### `status`

1. Check health: `curl -s http://localhost:{port}/api/health`
2. If canonical runtime detected, report: "Command Deck online at http://localhost:{port}"
3. If unreachable, report: "Command Deck offline. Run `/server start` to launch."
4. If non-canonical runtime, report: "Non-canonical service on port {port}. Stop it first."
