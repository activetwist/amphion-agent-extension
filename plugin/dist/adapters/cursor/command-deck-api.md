Use this command to align agent behavior to the canonical Command Deck API contract.

1. Resolve API base URL from `.amphion/config.json`:
   - read `port`
   - if missing or config.json does not exist, run `/amphion` to configure
   - base URL `http://127.0.0.1:{resolvedPort}`
2. Resolve board context with `GET /api/find` (or `GET /api/state`).
3. Perform writes through MCP bridge tools (preferred) or canonical API routes. Never write SQLite/files directly.
4. MCP tool schemas embed full payload definitions — no need to call conventions before writes.

## Command Deck API

**ALL board writes MUST use the Command Deck API. Direct SQLite writes, Python scripts, and filesystem substitutes are non-canonical and violate GUARDRAILS write-boundary policy.**

Resolve API location:
1. Read `port` from `.amphion/config.json`.
2. If `port` is missing or config.json does not exist, run `/amphion` to configure the workspace.
3. Base URL is `http://127.0.0.1:{resolvedPort}`.

All write operations use MCP bridge tools when available. Tool schemas carry full payload definitions (enum, required fields, constraints) — no need to call conventions before writes.

If MCP tools are unavailable, fall back to the REST API:

| Action | Method | Route | Required Fields |
|---|---|---|---|
| Read state | GET | `/api/state` | — |
| Find (board map) | GET | `/api/find` | — (optional: `?q=`, `?milestoneId=`, `?list=`) |
| Create chart | POST | `/api/charts` | `boardId`, `title`; opt: `markdown`, `description` |
| Create milestone | POST | `/api/milestones` | `boardId`, `title`, `code` |
| Create card | POST | `/api/cards` | `boardId`, `milestoneId`, `listId`, `title`; opt: `priority` (P0-P3), `kind` (task\|bug) |
| Update card | PATCH | `/api/cards/{id}` | `boardId`; opt: `listId`, `title`, `priority`, `kind` |
| Move card | POST | `/api/cards/{id}/move` | `listId` |
| Delete card | DELETE | `/api/cards/{id}` | — |
| Write findings | POST | `/api/milestones/{id}/artifacts` | `boardId`, `artifactType:findings`, `title`, `summary`, `body` |
| Write outcomes | POST | `/api/milestones/{id}/artifacts` | `boardId`, `artifactType:outcomes`, `title`, `summary`, `body` |
| Write memory | POST | `/api/memory/events` | `memoryKey`, `value`, `sourceType`, `eventType:upsert` |
| Query memory | GET | `/api/memory/query` | `?q=` (key prefix) |

## Discrete Context Windows

Each MCD contract card is a discrete context window. Treat each card as an isolated task.

**Task start (fresh session):**
1. `GET /api/find` (or `GET /api/state`) to resolve active board + milestone.
2. `GET /api/memory/query?key=task.{issueNumber}.handoff` to load prior handoff state if it exists.

**Task completion (before ending session):**
```
POST /api/memory/events
{
  "memoryKey": "task.{issueNumber}.handoff",
  "eventType": "upsert",
  "sourceType": "verified-system",
  "bucket": "ref",
  "ttlSeconds": 604800,
  "value": {
    "issueNumber": "...",
    "cardTitle": "...",
    "completedAt": "...",
    "outcomeArtifactId": "... or null",
    "summary": "1-2 sentence completion summary",
    "residualNotes": "anything the next session should know"
  }
}
```
