# Launch Command Deck (Local)

Local, file-backed Kanban service for milestone and task execution.

## Source of truth
- Data: `data/state.json`
- API + static app: `server.py`

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
