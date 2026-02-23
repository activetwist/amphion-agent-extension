# CONTRACT: Edit Dialog Issue Number Hotfix

**Phase:** 2.0 (Contract)  
**Status:** Proposed  
**Date:** 2026-02-22  
**Codename:** `BlackClaw`

## 1. Goal
Add the card issue number to the edit-task modal header (upper-right position), sourcing from the same `issueNumber` field currently used for board card badges.

## 2. Approved AFPs (Affected File Paths)
- `referenceDocs/03_Contracts/active/202602221710-CONTRACT_EDIT_DIALOG_ISSUE_NUMBER_HOTFIX.md` (this contract)
- `ops/launch-command-deck/data/state.json` (observability card)
- `ops/launch-command-deck/public/index.html`
- `ops/launch-command-deck/public/app.js`
- `ops/launch-command-deck/public/styles.css`
- `mcd-starter-kit-dev/extension/assets/launch-command-deck/public/index.html`
- `mcd-starter-kit-dev/extension/assets/launch-command-deck/public/app.js`
- `mcd-starter-kit-dev/extension/assets/launch-command-deck/public/styles.css`
- `mcd-starter-kit-dev/command-deck-source/public/index.html`
- `mcd-starter-kit-dev/command-deck-source/public/app.js`
- `mcd-starter-kit-dev/command-deck-source/public/styles.css`
- `referenceDocs/05_Records/buildLogs/202602221710-EXECUTE_EDIT_DIALOG_ISSUE_NUMBER_HOTFIX.md` (new)
- `referenceDocs/05_Records/buildLogs/202602221710-WALKTHROUGH_EDIT_DIALOG_ISSUE_NUMBER_HOTFIX.md` (new)

## 3. Scope Boundaries
- **In Scope:**
  - Add a dedicated issue-number element in the card dialog header, positioned upper-right.
  - Bind displayed value from `card.issueNumber` inside `openCardDialog()` for edit mode.
  - Define fallback for new cards (no issue number yet), e.g. hidden badge or `—`.
  - Style the new header issue badge consistently with existing UI tokens.
  - Mirror changes across runtime and both mirrored frontend copies.
- **Out of Scope:**
  - Backend/API/state schema changes.
  - Issue number generation logic changes.
  - Modal layout redesign beyond header metadata slot.

## 4. Deterministic Execution Plan
1. **Header Slot Addition**
   - Add modal header issue number element in `index.html`.
2. **Data Binding**
   - Populate/reset header issue number in `openCardDialog()` based on existing card data source.
3. **Styling**
   - Add minimal CSS for header issue badge alignment and readability in both themes.
4. **Mirror Sync**
   - Apply same validated edits to extension assets and command-deck-source copies.
5. **Verification**
   - Edit existing card: issue number appears upper-right.
   - New card dialog: fallback behavior works.
   - Save/delete flows unaffected.
6. **Documentation**
   - Record build log and walkthrough artifacts.

## 5. Risk Assessment
- **UI Regression Risk (Low/Medium):** Header spacing could shift in modal on narrow widths.  
  **Mitigation:** Use minimal flex alignment and avoid broad dialog style changes.
- **Data Binding Risk (Low):** Fallback handling for new cards may display stale value if not reset.  
  **Mitigation:** Explicitly clear/set on both edit and new dialog paths.
- **Copy Drift Risk (Medium):** Hotfix in one copy can diverge from mirrors.  
  **Mitigation:** Mirror updates in same execution pass.

## 6. Acceptance Criteria
- [ ] Edit modal displays issue number in upper-right header for existing cards.
- [ ] Displayed value uses same card `issueNumber` source as board card badges.
- [ ] New card modal shows defined fallback (hidden or `—`) with no stale value.
- [ ] Card create/edit/delete flows remain functional.
- [ ] Runtime, extension assets, and command-deck-source copies are synchronized.
- [ ] Build log and walkthrough artifacts are created.

## 7. Operator Approval Gate
Execution is blocked pending operator approval.  
To begin implementation, invoke:

`/execute 202602221710-CONTRACT_EDIT_DIALOG_ISSUE_NUMBER_HOTFIX.md`
