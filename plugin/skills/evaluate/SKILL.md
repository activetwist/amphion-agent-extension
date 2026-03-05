---
name: evaluate
description: "Run MCD EVALUATE phase — research, gap analysis, scoping, and findings recording. Use when starting a new milestone, feature, or complex bug fix."
argument-hint: "[topic or feature to evaluate]"
---

This skill invokes the canonical MCD EVALUATE command.

## Instructions

1. **Read the command instructions** at `.amphion/control-plane/mcd/EVALUATE.md` and follow them precisely.

2. **Resolve board context** before starting:
   - Read port from `.amphion/config.json` (default: `8765`).
   - `GET http://localhost:{port}/api/health` — confirm canonical runtime.
   - `GET http://localhost:{port}/api/find` — resolve active board and milestone.
   - If the server is offline, halt as **blocked** and ask the user to run `/server start`.

3. **Research the topic**: `$ARGUMENTS`

4. **Record findings** via the Command Deck API:
   - `GET http://localhost:{port}/api/conventions?intent=findings` for the payload schema.
   - `POST http://localhost:{port}/api/milestones/{milestoneId}/artifacts` with `artifactType: findings`.

5. **Verify visibility**: Confirm the findings artifact appears in `/api/state` or the board UI.

6. **Halt and prompt**: Present your findings summary and request explicit `/contract` authorization. Do not proceed to contract without operator approval.
