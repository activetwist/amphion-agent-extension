# Agent Instructions · Amphion Project (`BLACKCLAW`)

This project uses the MCD protocol for deterministic AI alignment and safety.

## Protocol Entrance
Before performing any task, the agent must identify the current phase and load the appropriate command from `.amphion/control-plane/mcd/`.

## Core References
- [Governance Guardrails](.amphion/control-plane/GUARDRAILS.md)
- [MCD Playbook](.amphion/control-plane/MCD_PLAYBOOK.md)

## Workflow
1. **Research** via the Evaluate command.
2. **Plan** via the Contract command.
3. **Build** via the Execute command.
4. **Finalize** via the Closeout command.

## Utility Commands
- **Remember** via the Remember command (`/remember`) for non-phase memory checkpoints.

**Important**: Never chain MCD phases. If you complete an EVALUATE phase, you MUST halt tool execution, present your findings and ask the user to authorize `/contract`, which must be authored as milestone-bound board cards via DB/API. Once you complete a CONTRACT phase, you MUST halt tool execution and explicitly wait for the user to authorize the next phase.

## Product Manager Experience
1. **Proactive Guidance**: If the user starts a session without a specific request, proactively ask them if they want to improve their Project Charter / PRD, or if they have an idea to start the first MCD cycle.
2. **Observability**: Always keep the Command Deck updated by creating/updating contract cards in the active milestone.

## Command Deck API

**ALL board writes MUST use the Command Deck API. Direct SQLite writes, Python scripts, and filesystem substitutes are non-canonical and violate GUARDRAILS write-boundary policy.**

Resolve port from `.amphion/config.json` → `port`; default `8765` if missing.
Base URL: `http://localhost:{port}`

**Before any write operation:** call `GET /api/conventions?intent={type}` for the scoped payload schema.
Valid intents: `chart` | `milestone` | `card` | `findings` | `outcomes` | `memory` | `board-artifact`

**For full session orientation:** `GET /api/conventions` (no intent param).

| Action | Method | Route | Required Fields |
|---|---|---|---|
| Read state | GET | `/api/state` | — |
| **Find (board map)** | GET | `/api/find` | — (add `?q=`, `?milestoneId=`, `?list=` to filter) |
| Conventions (scoped) | GET | `/api/conventions?intent={type}` | — |
| Create chart | POST | `/api/charts` | `boardId`, `title`; opt: `markdown` (Mermaid), `description` |
| Create milestone | POST | `/api/milestones` | `boardId`, `title`, `code` |
| Create card | POST | `/api/cards` | `boardId`, `milestoneId`, `listId`, `title` |
| Write findings | POST | `/api/milestones/{id}/artifacts` | `boardId`, `artifactType:findings`, `title`, `summary`, `body` |
| Write memory | POST | `/api/memory/events` | `memoryKey`, `value`, `sourceType`, `eventType:upsert` |

## Discrete Context Windows

Each MCD contract card is a discrete context window. Treat each card as an isolated task.

**Task start (fresh session):**
1. `GET /api/state` → resolve active board + milestone
2. `GET /api/memory/query?key=task.{issueNumber}.handoff` → load prior handoff if exists
3. `GET /api/conventions?intent={entityType}` → load scoped schema for planned write

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
