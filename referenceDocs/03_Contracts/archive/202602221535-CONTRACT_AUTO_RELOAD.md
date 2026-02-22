# CONTRACT: Command Deck Auto-Reload Mechanism

**Phase:** 2.0 (Contract)
**Status:** Approved
**Date:** 2026-02-22  

## 1. Goal
Implement a lightweight HTTP long-polling architecture to achieve automatic UI hot-reloading for the Command Deck. The browser client must instantly and seamlessly redraw the Kanban board whenever the underlying `state.json` file is modified on disk by external agents, completely eliminating the need for manual browser refreshes.

## 2. Approved AFPs (Approved File Paths)
- `ops/launch-command-deck/server.py`
- `ops/launch-command-deck/server.js`
- `ops/launch-command-deck/public/app.js`

## 3. Scope Boundaries
- **In Scope:** 
  - Extending the Python API to serve `GET /api/state/version`.
  - Extending the Node.js API to serve `GET /api/state/version`.
  - Adding a non-blocking `setInterval` worker to the browser UI to poll the version and trigger a native `refresh()` upon mismatch.
- **Out of Scope:** Structural DOM changes, CSS refactoring, full WebSocket implementation.

## 4. Acceptance Criteria
- [ ] Both Node and Python servers successfully output their internal `_last_mtime` / `_lastMtime` when routing `/api/state/version`.
- [ ] If `state.json` is manually modified, the browser client automatically detects the version mismatch within ~2000ms.
- [ ] Upon mismatch detection, the browser client successfully fetches the new payload and re-renders the DOM without user interaction.
- [ ] The polling mechanism fails gracefully without console spam if the server is temporarily unreachable.

## 5. Execution Plan
1. See `implementation_plan.md` for exact code insertions.
