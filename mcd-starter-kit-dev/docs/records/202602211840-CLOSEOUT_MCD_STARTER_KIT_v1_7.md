# Closeout Record: MCD Starter Kit v1.7.0 (Hot-Reload)

Date: `2026-02-21`
Contract Executed: `CT-20260221-OPS-020`

## Execution Summary

Prior to this contract, modifications to the Command Deck's `state.json` file by external systems (such as AI agents performing MCD tasks directly via file edits) were invisible to the running web UI until the backend server was completely restarted. 

This contract resolved the friction by introducing a surgical hot-reload mechanism:
1.  **StateStore Update:** Added a thread-safe `reload()` method to the memory store that re-evaluates `DATA_DIR/state.json` without breaking the internal `_lock` sequencing.
2.  **API Endpoint:** Added `POST /api/reload` handlers to both the Python reference server (`server.py`) and the bundled Node.js extension server (`server.js`).
3.  **UI Utility:** Added a "Reload State" button to the sidebar Utilities section (`index.html`), wired to trigger the new endpoint and run the frontend `refresh()` routine (`app.js`).

## Deliverables

### Modified Files (Dual Deployment)
All modifications were made to the extension bundle (`extension/assets/launch-command-deck/`) and simultaneously synced to the live operational copy (`ops/launch-command-deck/`):
- `server.py` — Added `StateStore.reload()` and `/api/reload` HTTP endpoint
- `server.js` — Added `StateStore.reload()` and `/api/reload` HTTP endpoint
- `public/index.html` — Added `<button id="btnReloadState">` to the sidebar
- `public/app.js` — Added click listener to trigger API POST and UI refresh
- `package.json` — Version bumped to `1.7.0` (Note: Bump is conceptual for this ops-driven patch)

## Acceptance Criteria Verification

- [x] `POST /api/reload` returns `{"ok": true, "state": ...}` with freshly read disk state (Verified via curl)
- [x] External writes to `state.json` are visible after reload with no server restart
- [x] "Reload State" button appears in sidebar Utilities
- [x] Reload is thread-safe (uses existing `_lock` in Python / synchronous file access in Node)
- [x] Both `server.py` and `server.js` implement identical behavior
- [x] Both `ops/` and `extension/assets/` copies updated via `cp -r` sync
- [x] Contract archived to `03_Contracts/archive/`

## Compliance
- [x] Contract archived
- [x] Work matched contract scope exactly
- [x] Closeout record created
- [x] Git commit completed
