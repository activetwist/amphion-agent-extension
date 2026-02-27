# Launch Command Deck (Local)

Local, SQLite-backed Kanban service for milestone and task execution.

## Source of truth
- Data: `data/amphion.db`
- API + static app runtime: `server.py` (via `run.sh`)

## Run
```bash
./run.sh
```

Optional host/port overrides:
```bash
KANBAN_HOST=127.0.0.1 KANBAN_PORT=8766 ./run.sh
```

Or directly:
```bash
python3 server.py --host 127.0.0.1 --port 8765
```

Open in browser:
- `http://127.0.0.1:<PORT>`

The project's configured port (used by the extension and agents) is in `.amphion/config.json` under `port`; if unset, the default is `8765`.

## Runtime verification
Verify the canonical runtime before debugging browser behavior.

1. Confirm listener process:
```bash
lsof -nP -iTCP:8765 -sTCP:LISTEN
```
Expected runtime: `COMMAND` is `python3` (or equivalent Python executable).

2. Confirm health/runtime fingerprint:
```bash
curl -sS http://127.0.0.1:8765/api/health | jq
```
Expected payload includes:
- `runtime.server = "launch-command-deck"`
- `runtime.implementation = "python"`
- `runtime.datastore = "sqlite"`
- `runtime.fingerprint = "launch-command-deck:python:sqlite"`

## Project bootstrap
Initialize this deck for a new project:
```bash
python3 scripts/init_command_deck.py \
  --project-name "MyProject" \
  --codename "Genesis" \
  --initial-version "v0.01a"
```

## Features
- Multi-board management
- Workflow columns (`Backlog`, `In Progress`, `Blocked`, `QA / Review`, `Done`)
- Milestones + progress bars
- Tasks with priority, owner, target date, description, acceptance
- Drag/drop between columns
- DB-canonical milestone artifacts (`findings`, `outcomes`) and board artifacts (`charter`, `prd`, `guardrails`, `playbook`)
- Legacy migration endpoint for `state.json` -> SQLite (`/api/migration/legacy-state-json/run`)
- Workspace migration helper: `scripts/migrate_workspace_to_amphion.py` (legacy `ops/` -> canonical `.amphion/`)
- Migration report validator: `scripts/validate_migration_report.py`

## Notes
- Local-only and dependency-free
- If `amphion.db` is missing, the server initializes a seeded launch board
- `state.json` is legacy-only and not required for runtime operation
- Default canonical runtime path is `.amphion/command-deck/`
