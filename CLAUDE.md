# MCD Routing Table · Amphion Project

This project follows the Micro-Contract Development (MCD) protocol. All agent actions must be routed through the canonical command definitions.

## Project Context
- **Codename**: `BLACKCLAW`
- **Governance**: [GUARDRAILS.md](.amphion/control-plane/GUARDRAILS.md)
- **Playbook**: [MCD_PLAYBOOK.md](.amphion/control-plane/MCD_PLAYBOOK.md)

## Active Commands
- **Evaluate**: [EVALUATE.md](.amphion/control-plane/mcd/EVALUATE.md)
- **Contract**: [CONTRACT.md](.amphion/control-plane/mcd/CONTRACT.md)
- **Execute**: [EXECUTE.md](.amphion/control-plane/mcd/EXECUTE.md)
- **Closeout**: [CLOSEOUT.md](.amphion/control-plane/mcd/CLOSEOUT.md)

## Utility Commands
- **Remember**: [REMEMBER.md](.amphion/control-plane/mcd/REMEMBER.md)

## Operational Rules
1. Never chain MCD phases. If you complete an EVALUATE phase, you MUST halt tool execution, present your findings and ask the user to authorize `/contract`, which must be authored as milestone-bound board cards via DB/API. Once you complete a CONTRACT phase, you MUST halt tool execution and explicitly wait for the user to authorize the next phase.
2. Always read the corresponding command file before starting a phase.
3. Ensure approved contract cards exist on the board before performing any `EXECUTE` actions.
4. Maintain deterministic naming for all artifacts and records.

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
