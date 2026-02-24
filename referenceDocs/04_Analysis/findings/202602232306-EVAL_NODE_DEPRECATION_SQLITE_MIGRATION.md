# EVALUATE: Node Deprecation & SQLite Migration

**Phase: 1 (Research & Scoping)**
**Date:** 2026-02-23
**Focus:** Server Architecture Modernization

## 1. Research & Analysis
- **The Issue:** The current Command Deck server uses an ephemeral `state.json` payload, which is fragile to concurrent writes and limits relation mapping. Additionally, the extension maintains two parallel server backends (`node` via `server.js` and `python` via `server.py`), increasing the maintenance surface area.
- **The Proposal:** Deprecate and remove the Node.js backend entirely. Transition the remaining Python backend from a flat-file JSON state manager to a robust SQLite (`sqlite3`) relational database.

## 2. Gap Analysis
- **VS Code Extension UI:** The `wizard.ts` (Onboarding Webview or Input Boxes) offers a choice between Node.js and Python. This choice must be removed, defaulting cleanly to Python.
- **Scaffolder Logic:** `scaffolder.ts` must no longer write `serverLang` to `ops/amphion.json` (or it must be hardcoded to `python`), and it must no longer copy `server.js`.
- **Dashboard Launch Logic:** `commandDeckDashboard.ts` must no longer branch its `Terminal` spawn on `serverLang`. It should strictly assume Python.
- **Python Initialization:** `init_command_deck.py` currently builds a JSON dictionary. It must be decoupled to initialize an empty SQLite database (`state.db`) with tables for boards, lists, cards, milestones, charts, and configuration.
- **Python Server:** `server.py` must rip out its JSON IO functions and implement `sqlite3` queries for fetching and mutating data.
- **Node Removal:** `server.js` and `package-lock.json` must be deleted from `assets/launch-command-deck`.

## 3. Scoping Boundaries
**In-Scope:**
- Removing `server.js` from `assets/`.
- Removing the "Server Language" choice from `wizard.ts`.
- Updating `scaffolder.ts` and `commandDeckDashboard.ts` to strictly assume `python`.
- Rewriting `init_command_deck.py` to create `data/amphion.db` with the initial relational schema instead of `state.json`.
- Rewriting `server.py` CRUD endpoints to rely on `sqlite3` cursor execution instead of JSON array walking.
- Bumping the extension version to `1.26.0` (minor version bump due to massive architectural breaking change).

**Out-of-Scope:**
- Changing the frontend React/Vanilla JS components. The REST API JSON contracts (the shape of the JSON returned to the frontend) must remain exactly the same so the frontend is completely blind to the backend database shift.
- Modifying the webview UI styling.

## 4. Primitive Review
This changes the persistence Primitive from `state.json` to an `amphion.db` SQLite database.
