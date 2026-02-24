# Launch Command Deck (Local)

Local, file-backed Kanban service for milestone and task execution.

## Source of truth
- Data: `data/state.json`
- Default API + static app runtime: `server.js` (via `run.sh`)

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
node server.js --host 127.0.0.1 --port 8765
```

Open in browser:
- `http://127.0.0.1:<PORT>`

## Runtime verification
Verify the runtime bound to your port before debugging browser behavior.

1. Confirm listener process:
```bash
lsof -nP -iTCP:8765 -sTCP:LISTEN
```
Expected default runtime: `COMMAND` is `node`.

2. Confirm health endpoint response shape:
```bash
curl -i -sS http://127.0.0.1:8765/api/health
```
- Node runtime typically returns `HTTP/1.1` with no Python `Server:` header.
- Python runtime includes a `Server: LaunchCommandDeck/0.1 Python/...` header.

## Alternate runtime (parity/debug)
Python runtime remains available for parity checks:
```bash
python3 server.py --host 127.0.0.1 --port 8765
```

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
- JSON import/export

## Notes
- Local-only and dependency-free
- If `state.json` is missing, the server creates a seeded launch board
