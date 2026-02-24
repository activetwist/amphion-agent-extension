# EXECUTE LOG · CT-032 Command Deck Wiki/Notes De-Scope + Removal

## Contract
- `referenceDocs/03_Contracts/active/202602231240-CONTRACT_COMMAND_DECK_WIKI_DESCOPE_REMOVAL.md`

## Date
- 2026-02-23

## Summary
Executed full Wiki/Notes de-scope across frontend and backend runtimes, archived existing wiki data/contracts, and updated board records to archived/de-scoped state.

## Files Changed
- `ops/launch-command-deck/public/index.html`
- `ops/launch-command-deck/public/app.js`
- `ops/launch-command-deck/public/styles.css`
- `ops/launch-command-deck/server.js`
- `ops/launch-command-deck/server.py`
- `ops/launch-command-deck/data/state.json`
- `referenceDocs/03_Contracts/active/202602231240-CONTRACT_COMMAND_DECK_WIKI_DESCOPE_REMOVAL.md`
- `referenceDocs/archive/20260223-CommandDeck-Wiki/*` (new archive copy)
- `referenceDocs/03_Contracts/archive/*` (moved superseded wiki contracts)

## Execution Details
1. Archived `referenceDocs/06_Wiki/` content to `referenceDocs/archive/20260223-CommandDeck-Wiki/`.
2. Removed active `referenceDocs/06_Wiki/` directory.
3. Archived superseded active Wiki contracts from `referenceDocs/03_Contracts/active/` into `referenceDocs/03_Contracts/archive/`.
4. Removed Notes/Wiki UI from `index.html`.
5. Removed wiki runtime logic/state/events from `app.js` and added local-storage migration guard (`wiki` -> `board`).
6. Removed wiki CSS surface from `styles.css`.
7. Removed `/api/wiki/*` and `/wiki-assets/*` runtime surface from `server.js` and `server.py`.
8. Added/confirmed `POST /api/reload` in `server.js` to keep non-wiki API smoke parity.
9. Marked Wiki cards `AM-048`, `AM-049`, `AM-050`, `AM-051`, `AM-052`, `AM-060`..`AM-065` as `[ARCHIVED]` and moved them to Done.

## Verification
### Static checks
- No runtime references remain for:
  - `/api/wiki`
  - `wiki-assets`
  - `currentWikiPath`
  - `data-view="wiki"`
  - `#wikiView`

### Syntax checks
- `node --check ops/launch-command-deck/public/app.js` ✅
- `node --check ops/launch-command-deck/server.js` ✅
- `python3 -m py_compile ops/launch-command-deck/server.py` ✅

### Node runtime smoke (`127.0.0.1:8879`)
- `GET /api/health` ✅
- `GET /api/state` ✅
- `GET /api/state/version` ✅
- `GET /api/docs/playbook` ✅
- `GET /api/git/log` ✅
- `POST /api/reload` ✅
- `GET /api/wiki/tree` returns 404 ✅
- `GET /api/wiki/files?...` returns 404 ✅

### Python runtime smoke (`127.0.0.1:8878`)
- `GET /api/health` ✅
- `GET /api/state` ✅
- `GET /api/state/version` ✅
- `GET /api/docs/playbook` ✅
- `GET /api/git/log` ✅
- `POST /api/reload` ✅
- `GET /api/wiki/tree` returns 404 ✅
- `GET /api/wiki/files?...` returns 404 ✅

## Notes
- Contract de-scope target range `AM-048..AM-065` had 11 existing wiki cards in current state (`AM-048..AM-052` and `AM-060..AM-065`); those were archived.
