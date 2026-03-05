---
name: execute
description: "Run MCD EXECUTE phase — implement changes authorized by approved contract cards. Use only after contract is approved."
argument-hint: "[card issue number or milestone reference]"
---

This skill invokes the canonical MCD EXECUTE command.

## Instructions

1. **Read the command instructions** at `.amphion/control-plane/mcd/EXECUTE.md` and follow them precisely.

2. **Runtime gate**:
   - Read port from `.amphion/config.json` (default: `8765`).
   - `GET http://localhost:{port}/api/health` — confirm canonical runtime.

3. **Load approved contracts**: `GET http://localhost:{port}/api/find?milestoneId={milestoneId}` to verify approved card set exists.

4. **Implement**: Execute changes exactly as authorized by the contract cards. Do not deviate from approved AFPs.

5. **Move cards**: As you begin each card, move it to "In Progress" via `PATCH http://localhost:{port}/api/cards/{cardId}` with `listId` for the active list. Move to "Done" when complete.

6. **Verify**: Run automated tests and validate acceptance criteria for each card.

7. **Iterate**: Fix bugs found during verification. If a fundamental design change is needed, halt and return to `/contract`.

8. **Record outcomes**: When all cards are complete, the milestone is ready for `/closeout`.
