# Evaluate: Cards Not Visible on Board — Ghost Molt

**Phase:** EVALUATE (Research & Scoping)  
**Codename:** `black`  
**Date:** 202602221900

---

## 1. Research Summary

User reported: "I do not see the cards on the board." Inputs reviewed: Command Deck frontend (`public/app.js`, `public/index.html`), backend (`server.py`, `server.js`), and state file (`ops/launch-command-deck/data/state.json`).

The Command Deck UI loads state via `GET /api/state`. The server (Python or Node) loads `state.json` **once at startup** and keeps it in memory. Cards are rendered in `renderColumns()` by matching `card.listId` to each column's `list.id`; filtering by milestone and search is applied in `cardMatchesFilter()`.

---

## 2. Gap Analysis

**Root cause:** The server does not reread `state.json` after startup. When an agent (or any process) updates `state.json` on disk, the running server continues to serve the **in-memory** state from when it started. So:

- If the server was started **before** the last update to `state.json` (e.g. before BLA-004 was added or BLA-003 was updated), the UI will show the **old** state — fewer cards, old descriptions, or empty columns.
- Restarting the server causes it to reload `state.json` and serve the latest cards.

**Secondary checks:**

- **URL:** The app must be opened at the server origin (e.g. `http://127.0.0.1:8765/`). Opening `index.html` as `file://` will cause `fetch("/api/state")` to fail (no server), so no cards load.
- **Tab:** The "Board" tab must be selected; Dashboard and MCD Guide do not show the Kanban columns.
- **Filters:** Milestone filter "All" and empty search show all cards; selecting a milestone or typing in search can hide some cards.
- **Data consistency:** Current `state.json` has valid `listId` and `milestoneId` for all cards; no structural issue found.

---

## 3. Scoping

### In scope (addressed)

- Document why cards may not appear (stale in-memory state when `state.json` is updated after server start).
- Provide a way to reload state from disk without restarting the server: **Reload** button in Utilities that calls `POST /api/reload` then refreshes the UI.
- Update Command Deck card with findings and acceptance criteria so the Product Owner can observe the fix.

### Out of scope

- Changing how often the server reads from disk (e.g. file watcher).
- Changing the init or onboarding flow; this fix is for operators who run the server and later have `state.json` updated (e.g. by an agent).

---

## 4. Primitive Review

No new Architecture Primitives required. This is a Command Deck UX/operational fix.

---

## 5. Changes Made

1. **Reload button:** In `ops/launch-command-deck/public/index.html`, added a "Reload" button in the Utilities panel. In `public/app.js`, wired it to `POST /api/reload` then `refresh()`, so the server reloads `state.json` from disk and the UI shows the latest cards without restarting the server.
2. **Evaluation findings:** This document in `04_Analysis/findings/`.
3. **Card update:** Command Deck card BLA-005 (or existing card) updated with acceptance criteria for "cards visible on board" and use of Reload when state was updated on disk.

---

## 6. Acceptance Criteria (for this Evaluate)

- [x] Root cause documented: server loads state only at startup; updates to `state.json` on disk are not visible until reload or restart.
- [x] Reload control added: "Reload" button calls `POST /api/reload` and refreshes the UI.
- [x] Findings written to `04_Analysis/findings/`.
- [x] Command Deck card updated for PO observability.

---

## 7. Operator Instructions

**To see the latest cards after an agent (or any process) has updated `state.json`:**

1. Open the Command Deck at `http://127.0.0.1:8765/` (or your configured host/port) with the server running.
2. Ensure the **Board** tab is selected.
3. In the sidebar under **Utilities**, click **Reload**. The server will reload state from disk and the board will refresh with the current cards.
4. Alternatively, restart the Command Deck server (e.g. stop and run `./run.sh` again); on startup it will load the latest `state.json`.

---

**HALT.** Evaluation complete. Do not proceed to Contract unless the operator requests a formal contract for this change.
