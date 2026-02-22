# EVALUATE: /board Workflow Bugs

## 1. Research & Analysis
The user reported two bugs encountered while testing the new strict MCD orchestration pipeline (/board workflow) in a scaffolded project:
1. The agent stated that the `/board` command was missing from instructions.
2. The agent created task cards in `state.json`, but the UI did not reflect the new cards upon a browser page refresh.

### Issue 1: Missing `/board` Command
**Findings:** While the canonical `BOARD.md` file was successfully created in the `AmphionAgent` repository's `referenceDocs`, the corresponding string template generation was **not added** to the starter kit extension. 
- `mcd-starter-kit-dev/extension/src/templates/commands.ts` lacks the `renderBoard` export.
- `mcd-starter-kit-dev/extension/src/scaffolder.ts` does not call `renderBoard` during `Write Canonical Commands`.
Therefore, newly initialized projects do not spawn the `BOARD.md` instruction file.

### Issue 2: Command Deck Stale State on Refresh
**Findings:** The other agent correctly identified that the server caches `state.json` in-memory. While a "Reload State" button currently exists in the sidebar (which explicitly triggers `POST /api/reload`), a standard user **browser refresh** (`Cmd+R`) only triggers `GET /api/state`. 
- `GET /api/state` calls `STORE.snapshot()`, which unconditionally returns the stale in-memory cache.
- Because agents edit `state.json` externally on disk, the running Node/Python server remains unaware of the update unless explicitly pinged. 

## 2. Gap Analysis
- The extension scaffolder is missing the `BOARD.md` template string.
- Command Deck `server.py` and `server.js` do not watch the disk or check file modification times when serving a standard `GET /api/state` request.

## 3. Scoping Proposed Fixes
**In-Scope:**
1. Update `templates/commands.ts` to include `renderBoard()`.
2. Update `scaffolder.ts` to deploy `BOARD.md` to `referenceDocs/00_Governance/mcd/BOARD.md` on project initialization.
3. Update `STORE.snapshot()` logic in `ops/launch-command-deck/server.py` **and** `server.js` to compare the `state.json` file's disk modification time (`mtime`) against the last load. If a change is detected, silently trigger a reload before serving the response.
4. Port the `server.py` and `server.js` fixes into `mcd-starter-kit-dev/extension/assets/launch-command-deck/` so new projects benefit from the fix.

## 4. Primitive Review
No new primitives required. Modifying existing state store logic.

## 5. Conclusion
The root causes are highly localized and easily fixable without overhauling any architecture. By enabling `snapshot()` to detect `mtime` changes, the Command Deck will instantly reflect agent-authored task cards upon a standard browser refresh, fulfilling user expectations.
