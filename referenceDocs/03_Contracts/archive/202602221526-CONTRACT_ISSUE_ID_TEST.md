# CONTRACT: Verify Command Deck Issue ID Rendering (AM-016)

**Phase:** 2.0 (Contract)
**Status:** Approved
**Date:** 2026-02-22  

## 1. Goal
Evaluate the local Command Deck instance natively inside the `AmphionAgent` environment to confirm that task cards successfully parse and render their `issueNumber` payloads in the browser UI, validating the v1.24.3 frontend structural sync.

## 2. Approved AFPs (Approved File Paths)
None. (Visual verification only).

## 3. Scope Boundaries
- **In Scope:** Navigating to the local Command Deck Dashboard and Board views. Visually inspecting card `AM-016` to ensure the `AM-XXX` badge appears in the bottom left corner.
- **Out of Scope:** Making code modifications. 

## 4. Acceptance Criteria
- [ ] Task card `AM-016` ("Verify Command Deck Issue ID Rendering") appears in the "Backlog" column.
- [ ] The `AM-016` identifier badge is visible on the card representation in the browser.
- [ ] The `—` fallback badge properly yields to the data-driven badge.

## 5. Execution Plan
1. Open the browser and navigate to `http://127.0.0.1:8765/`.
2. Inspect the Kanban view for `AM-016`.
3. Provide visual confirmation of success or failure.
