# Evaluation Findings — Command Deck Cards Not Visible

**Phase:** EVALUATE (Research & Scoping)  
**Codename:** `black`  
**Date:** 202602222330  
**Trigger:** User reports "I don't see the cards on the Command Deck."

---

## 1. Research Summary

- **State file:** Command Deck reads state from `ops/launch-command-deck/data/state.json` (Python: `STATE_FILE = DATA_DIR / "state.json"`, Node: `STATE_FILE = path.join(DATA_DIR, 'state.json')` with `DATA_DIR` relative to server file).
- **On-disk state:** The file at `ops/launch-command-deck/data/state.json` contains **9 cards** (BLA-001 through BLA-009), one board (`board_8a26678d12`), `activeBoardId` set to that board, and lists/milestones with IDs that match all cards’ `listId` and `milestoneId`. JSON structure is valid.
- **Server load:** Both server.py and server.js load state at startup from that path. On each `GET /api/state`, `snapshot()` checks file mtime and reloads from disk if the file changed (`current_mtime > _last_mtime`).
- **UI display:** The frontend (`public/app.js`) gets state via `GET /api/state`, then shows cards in columns by `card.listId` and filters with `cardMatchesFilter()` (optional `milestoneId` filter and search). Default filter is "All" milestones; our cards use `listId: "list_f37b492284"` (Backlog) and `milestoneId: "ms_4cd10314b6"` (Version 0a Pre-Release).

---

## 2. Gap Analysis — Why Cards Might Not Show

| Cause | Explanation |
|-------|-------------|
| **Server not reading this file** | If the server is run from a different working directory, or with a different `--state-file` (init script), or the UI is a different deployment (e.g. another host), it may be reading a different `state.json` that was never updated with the new cards. |
| **Stale server cache** | Server loads state at startup. If the server was started *before* the agent wrote the new cards, the in-memory state is old until the next reload. Reload happens when `GET /api/state` is called and the file’s mtime is newer than the server’s last load. A simple browser refresh triggers that GET and should trigger a reload—unless the server is reading a different path. |
| **Browser cache** | The browser might cache the previous `/api/state` response. A hard refresh (e.g. Ctrl+Shift+R / Cmd+Shift+R) or disabling cache for the page can force a new GET and show updated state. |
| **Milestone / search filter** | If the UI has a milestone filter set to a different milestone (or a search term that doesn’t match), some or all cards can be hidden. Setting the filter to "All" and clearing search should show all cards. |

---

## 3. Scoping

- **In scope:** Confirm why cards are not visible; give the Product Owner actionable steps to see the cards; optionally improve observability (e.g. reload-from-disk control).
- **Out of scope:** Changing contract or board population logic; full audit of every possible deployment path.

---

## 4. Recommended Actions (Product Owner)

1. **Restart the Command Deck server**  
   Stop and start the process that serves the Command Deck (e.g. `python server.py` or `node server.js` in `ops/launch-command-deck/`). This forces a fresh read of `data/state.json` at startup.

2. **Hard-refresh the browser**  
   Use Ctrl+Shift+R (Windows/Linux) or Cmd+Shift+R (macOS) on the Command Deck page so the browser fetches state again and does not use a cached response.

3. **Check filters**  
   In the Command Deck UI, set the milestone filter to **"All"** and clear any search text so no cards are hidden by filters.

4. **Confirm state file path**  
   If cards still do not appear, confirm the server is using the same file that was updated. For example, ensure you’re running the server from the repo that contains `ops/launch-command-deck/data/state.json` with the 9 cards (BLA-001–BLA-009). If you use a custom state path (e.g. via init script), ensure the agent’s updates are applied to that path or re-run board population against that path.

5. **Force server to re-read from disk (optional)**  
   If the server supports `POST /api/reload`, calling it (e.g. from browser devtools: `fetch('/api/reload', { method: 'POST' })`) then refreshing the page can show updated state without restarting the server. Adding a visible “Reload state from disk” button that calls `POST /api/reload` then refreshes the UI would make this repeatable without a server restart.

---

## 5. Primitive Review

- No new Architecture Primitives required for this finding.

---

## 6. Card Update

A card has been added/updated on the Command Deck (see below) so the Product Owner can track this finding and the recommended actions. No Contract or Execute phase is started; proceed only after operator approval if implementation (e.g. “Reload from disk” button) is desired.
