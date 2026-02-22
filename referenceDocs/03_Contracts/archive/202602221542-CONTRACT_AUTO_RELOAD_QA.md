# CONTRACT: Verify Command Deck Auto-Reload (AM-017)

**Phase:** 2.0 (Contract)
**Status:** Approved
**Date:** 2026-02-22  

## 1. Goal
Evaluate the local Command Deck instance natively inside the `AmphionAgent` environment to conclusively prove that the new HTTP long-polling architecture (`/api/state/version`) successfully triggers an automatic, seamless UI hot-reload when `state.json` is modified externally.

## 2. Approved AFPs (Approved File Paths)
None. (Visual verification only).

## 3. Scope Boundaries
- **In Scope:** Observing the Kanban view at `http://localhost:8765/`. Confirming that Task Card `AM-017` was drawn onto the board autonomously. Checking the browser console for silent failure compliance.
- **Out of Scope:** Making code modifications. 

## 4. Acceptance Criteria
- [ ] Task card `AM-017` ("Verify Command Deck Auto-Reload") appears in the "Backlog" column *without* the operator triggering a browser refresh.
- [ ] The browser console does not spam aggressive network errors.
- [ ] The board interacts normally (e.g., drag-and-drop works).

## 5. Execution Plan
1. Keep the browser open to `http://127.0.0.1:8765/`.
2. Provide visual confirmation of success or failure.
