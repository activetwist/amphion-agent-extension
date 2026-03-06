---
name: closeout
description: "Run MCD CLOSEOUT phase — archive milestone, record outcomes, and finalize the version. Use when all contracted work is verified and complete."
argument-hint: "[version or milestone reference]"
---

This skill invokes the canonical MCD CLOSEOUT command.

## Instructions

1. **Read the command instructions** at `.amphion/control-plane/mcd/CLOSEOUT.md` and follow them precisely.

2. **Runtime gate**:
   - Read port from `.amphion/config.json`.
   - `GET http://127.0.0.1:{port}/api/health` — confirm canonical runtime.

3. **Verify completion**: `GET http://127.0.0.1:{port}/api/find?milestoneId={milestoneId}` — confirm all contract cards are in "Done" list.

4. **Record outcomes artifact**:
   - `GET http://127.0.0.1:{port}/api/conventions?intent=outcomes` for schema.
   - `POST http://127.0.0.1:{port}/api/milestones/{milestoneId}/artifacts` with `artifactType: outcomes`.

5. **Write closeout memory**:
   - `POST http://127.0.0.1:{port}/api/memory/events` with handoff state.
   - Verify via `GET http://127.0.0.1:{port}/api/memory/query?key=task.{issueNumber}.handoff`.

6. **Archive milestone**: Update milestone status through the API.

7. **Git commit**: Stage all changes and commit with the format: `closeout: {VERSION} {brief description}`.

8. **Version metadata**: Tag/finalize version metadata only when explicitly in scope.
