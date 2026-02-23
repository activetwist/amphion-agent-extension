# CONTRACT: Command Deck Wiki/Notes De-Scope + Removal

**Phase:** 2.0 (Contract)  
**Status:** Executed  
**Date:** 2026-02-23  
**Codename:** `BlackClaw`

**Source Evaluation:** `referenceDocs/04_Analysis/findings/202602231237-COMMAND_DECK_WIKI_ARCHIVE_REMOVAL_EVAL.md`

## 1. Goal
Archive and remove the Wiki/Notes feature from Command Deck so the application returns to a stable core surface (Board, Dashboard, Charts, Guide), with deterministic behavior across browsers and runtimes.

## 2. Approved AFPs (Affected File Paths)
- `referenceDocs/03_Contracts/active/202602231240-CONTRACT_COMMAND_DECK_WIKI_DESCOPE_REMOVAL.md` (this contract)
- `ops/launch-command-deck/public/index.html`
- `ops/launch-command-deck/public/app.js`
- `ops/launch-command-deck/public/styles.css`
- `ops/launch-command-deck/server.js`
- `ops/launch-command-deck/server.py`
- `ops/launch-command-deck/data/state.json`
- `referenceDocs/06_Wiki/` (source data to archive then remove from active location)
- `referenceDocs/archive/20260223-CommandDeck-Wiki/` (new archive location)
- `referenceDocs/03_Contracts/active/20260223-NOTES_POLISH.md`
- `referenceDocs/03_Contracts/active/20260223-NOTES_POLISH_V2.md`
- `referenceDocs/03_Contracts/active/20260223-NOTES_POLISH_V3.md`
- `referenceDocs/03_Contracts/active/20260223-WIKI_TABLE_ADV_UX.md`
- `referenceDocs/03_Contracts/active/202602231150-CONTRACT_COMMAND_DECK_WIKI_BLOCKERS.md`
- `referenceDocs/03_Contracts/active/202602231211-CONTRACT_RUNTIME_PARITY_WIKI_AND_LAUNCH.md`
- `referenceDocs/03_Contracts/archive/` (destination for archived active wiki contracts)
- `referenceDocs/05_Records/buildLogs/202602231240-EXECUTE_COMMAND_DECK_WIKI_DESCOPE_REMOVAL.md`
- `referenceDocs/05_Records/buildLogs/202602231240-WALKTHROUGH_COMMAND_DECK_WIKI_DESCOPE_REMOVAL.md`

## 3. Scope Boundaries
- **In Scope:**
  - Remove Wiki/Notes tab and workspace from the runtime UI.
  - Remove Wiki-specific state, handlers, events, shortcuts, and mode logic from frontend runtime code.
  - Remove Wiki API endpoints and wiki-assets static branch from both runtime servers.
  - Add saved-view migration guard so `mcd_current_view=wiki` automatically falls back to `board`.
  - Archive existing wiki content (`referenceDocs/06_Wiki/`) before removing it from active path.
  - Archive/supersede active Wiki-centric contracts and de-scope related board cards.
- **Out of Scope:**
  - Designing or implementing a replacement notes/knowledge feature.
  - Migrating archived wiki content into another system.
  - Extension template mirror sync under `mcd-starter-kit-dev/` in this pass.
  - Broad non-wiki refactors unrelated to safe de-scope.

## 4. Deterministic Execution Plan
1. **Archive Wiki Data (Pre-Removal Gate)**
   - Create `referenceDocs/archive/20260223-CommandDeck-Wiki/`.
   - Move/copy contents of `referenceDocs/06_Wiki/` into the archive directory.
   - Confirm archived file count is non-zero before removing active wiki path.
2. **Frontend Surface Removal (AM-070)**
   - Remove Notes tab, `#wikiView` markup, and wiki-only script references from `index.html`.
   - Remove wiki state fields, wiki render branch, wiki API calls, and wiki event wiring from `app.js`.
   - Add migration logic: if saved `mcd_current_view` equals `wiki`, force/set `board`.
   - Remove wiki-only styles from `styles.css`.
3. **Backend Surface Removal (AM-071)**
   - Remove `WIKI_DIR` and `/api/wiki/*` handlers in `server.js` and `server.py`.
   - Remove `/wiki-assets/*` static serving branches in both servers.
   - Ensure no route collisions or JSON parsing regressions after endpoint removal.
4. **Board + Contract De-Scope Hygiene (AM-072)**
   - Mark Wiki backlog items (`AM-048`..`AM-065`) as archived/de-scoped in `state.json`.
   - Archive Wiki-focused active contracts listed in AFPs to `referenceDocs/03_Contracts/archive/`.
   - Keep this new de-scope contract as the active source of truth.
5. **Verification + Clean-Tree Gates**
   - Runtime smoke: Board, Dashboard, Charts, Guide render and navigation function.
   - API smoke: `/api/state`, `/api/state/version`, `/api/docs/*`, `/api/git/log`, `/api/reload` remain healthy.
   - Negative checks: `/api/wiki/tree` and `/api/wiki/files` return route-not-found behavior.
   - Static grep checks: no live runtime references to `data-view="wiki"`, `#wikiView`, `/api/wiki`, `wiki-assets`, `currentWikiPath` in `ops/launch-command-deck` runtime files.

## 5. Risk Assessment
- **Data Loss Risk (High):** Removing `referenceDocs/06_Wiki/` without archival can lose authored notes.
  - **Mitigation:** Hard pre-removal archive gate with verification.
- **UI Regression Risk (Medium):** Removing wiki branches may break nav/state transitions.
  - **Mitigation:** Explicit view fallback and smoke checks on remaining views.
- **Runtime Drift Risk (Low/Medium):** Removing only one runtime would reintroduce parity drift.
  - **Mitigation:** Apply same de-scope in both `server.js` and `server.py`.
- **Process Drift Risk (Medium):** Leaving old wiki contracts active can create conflicting execution intent.
  - **Mitigation:** Archive conflicting active wiki contracts during execution.

## 6. Acceptance Criteria
- [ ] Notes tab and wiki workspace are absent from runtime UI.
- [ ] Browser local storage values with `mcd_current_view=wiki` are auto-migrated to `board`.
- [ ] No wiki handlers (`/api/wiki/*`) remain in Node runtime.
- [ ] No wiki handlers (`/api/wiki/*`) remain in Python runtime.
- [ ] `/wiki-assets/*` static branch is removed from both runtimes.
- [ ] `referenceDocs/06_Wiki/` content is archived under `referenceDocs/archive/20260223-CommandDeck-Wiki/` before active removal.
- [ ] Wiki backlog cards are explicitly marked archived/de-scoped in board state.
- [ ] Prior active wiki contracts are archived; this contract remains active for the de-scope action.
- [ ] Post-change runtime smoke checks for Board/Dashboard/Charts/Guide pass.

## 7. Work Item Mapping
- `AM-070`: CT-032 · Command Deck Wiki/Notes De-Scope + Removal Contract
- `AM-071`: Remove Wiki/Notes frontend runtime surface
- `AM-072`: Remove Wiki/Notes backend API and static surface
- `AM-073`: Archive Wiki data/contracts and de-scope board records

## 8. Active Contract Conflict Check
This contract intentionally supersedes active Wiki-oriented contracts:
- `referenceDocs/03_Contracts/active/20260223-NOTES_POLISH.md`
- `referenceDocs/03_Contracts/active/20260223-NOTES_POLISH_V2.md`
- `referenceDocs/03_Contracts/active/20260223-NOTES_POLISH_V3.md`
- `referenceDocs/03_Contracts/active/20260223-WIKI_TABLE_ADV_UX.md`
- `referenceDocs/03_Contracts/active/202602231150-CONTRACT_COMMAND_DECK_WIKI_BLOCKERS.md`
- `referenceDocs/03_Contracts/active/202602231211-CONTRACT_RUNTIME_PARITY_WIKI_AND_LAUNCH.md`

Conflict resolution strategy: archive the above contracts as part of this execute slice and treat this contract as the sole active directive for Wiki de-scope.

## 9. Operator Approval Gate
Execution approved and invoked on 2026-02-23:  
`/execute 202602231240-CONTRACT_COMMAND_DECK_WIKI_DESCOPE_REMOVAL.md`
