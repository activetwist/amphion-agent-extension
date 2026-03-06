---
name: contract
description: "Run MCD CONTRACT phase — define implementation plan as milestone-bound board cards with acceptance criteria. Use after evaluate is complete."
argument-hint: "[scope summary or milestone reference]"
---

This skill invokes the canonical MCD CONTRACT command.

## Instructions

1. **Read the command instructions** at `.amphion/control-plane/mcd/CONTRACT.md` and follow them precisely.

2. **Runtime gate**:
   - Read port from `.amphion/config.json`.
   - `GET http://127.0.0.1:{port}/api/health` — confirm canonical runtime.
   - If the server is offline, halt as **blocked** and ask the user to run `/server start`.

3. **Resolve board context**: `GET http://127.0.0.1:{port}/api/find` to identify active board, milestone, and list IDs.

4. **Load conventions**: `GET http://127.0.0.1:{port}/api/conventions?intent=card` for card payload schema.

5. **Create milestone** (if net-new work):
   - `GET http://127.0.0.1:{port}/api/conventions?intent=milestone` for schema.
   - `POST http://127.0.0.1:{port}/api/milestones` with `boardId`, `title`, `code`, `metaContract`, `goals`, `nonGoals`, `risks`.

6. **Author contract cards**: Create sequenced micro-contract cards via `POST http://127.0.0.1:{port}/api/cards` with:
   - `boardId`, `milestoneId`, `listId` (backlog)
   - `title`, `description` (including AFPs), `acceptance`, `priority`, `kind: task`

7. **Present contract**: List all card issue numbers, titles, and priorities for operator review.

8. **Halt and prompt**: Request explicit `/execute` authorization. Do not begin implementation without operator approval.
