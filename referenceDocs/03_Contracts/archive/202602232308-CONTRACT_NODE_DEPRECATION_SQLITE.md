---
type: CONTRACT
id: CT-039
date: 2026-02-23
status: DRAFT
objective: Node Deprecation & SQLite Migration (v1.26.0)
---

# CONTRACT: Node Deprecation & SQLite Migration

## 1. Goal
Simplify the Command Deck architecture by removing the Node.js server option completely, enforcing Python as the universal backend. Concurrently, upgrade the Python backend's persistence layer from an ephemeral JSON file (`state.json`) to a relational SQLite database (`amphion.db`).

## 2. Affected File Paths (AFPs)
- **Delete:** `mcd-starter-kit-dev/extension/assets/launch-command-deck/server.js`
- **Delete:** `mcd-starter-kit-dev/extension/assets/launch-command-deck/package-lock.json`
- **Modify:** `mcd-starter-kit-dev/extension/src/wizard.ts` (Remove Node option)
- **Modify:** `mcd-starter-kit-dev/extension/src/scaffolder.ts`
- **Modify:** `mcd-starter-kit-dev/extension/src/commandDeckDashboard.ts`
- **Modify:** `mcd-starter-kit-dev/extension/assets/launch-command-deck/scripts/init_command_deck.py` (Initialize SQLite)
- **Modify:** `mcd-starter-kit-dev/extension/assets/launch-command-deck/server.py` (Replace JSON with SQLite)
- **Modify:** `mcd-starter-kit-dev/extension/package.json` (Bump to 1.26.0)

## 3. Scope Boundaries
**In-Scope:**
- Wiping all UI elements allowing Node.js selection.
- Refactoring `init_command_deck.py` to create tables: `boards`, `lists`, `tasks` (aka cards), `milestones`, and `charts`.
- Rewriting all `/api/state` and CRUD endpoints in `server.py` to use `sqlite3`.
- Bumping version to `1.26.0` to indicate a major internal architectural change.

**Out-of-Scope:**
- Rewriting the frontend JS/React clients. The JSON outputs from `server.py` APIs must exactly mirror the legacy `state.json` schema so the frontend remains ignorant to the backend database swap.
- Removing or modifying `package.json` in the `launch-command-deck` dir (needed for frontend deps).

## 4. Execution Plan
1. **Frontend / Extension Clean-Up:** Remove the `serverLang` branching from `wizard.ts`, `scaffolder.ts`, and `commandDeckDashboard.ts`. Assume `python` globally.
2. **File Deletions:** `rm` `server.js` and `package-lock.json` from the `assets/` folder.
3. **Database Initialization:** Re-architect `init_command_deck.py` to execute `CREATE TABLE` and `INSERT` statements using the built-in `sqlite3` driver.
4. **Server Refactor:** Replace file reads with `sqlite3` queries inside `server.py`. Ensure responses match the shape of the old `state.json`.
5. **Validation:** Scaffold a test project and confirm the frontend board renders, tasks can be dragged, and charts display properly from SQLite. Package VSIX v1.26.0.

## 5. Risk Assessment
- **Severity:** High. Rewriting the entire persistence layer is prone to serialization mismatches. Close adherence to the legacy `state.json` JSON shape is critical.

## 6. Acceptance Criteria
- [ ] No mention of "Node" exists in the wizard onboarding UI.
- [ ] `server.js` is removed.
- [ ] `amphion.db` is successfully generated during scaffold.
- [ ] Operations like moving a card, creating a milestone, or creating a board successfully map to `sqlite3` records.
- [ ] The webview dashboard "Start Server" spins up `python3` universally.
- [ ] `1.26.0` VSIX builds successfully.
