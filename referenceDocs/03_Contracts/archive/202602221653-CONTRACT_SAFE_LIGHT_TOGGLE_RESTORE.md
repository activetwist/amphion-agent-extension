# CONTRACT: Safe Light Toggle Restore (No-Downtime)

**Phase:** 2.0 (Contract)  
**Status:** Proposed  
**Date:** 2026-02-22  
**Codename:** `BlackClaw`

## 1. Goal
Restore the missing light/dark theme toggle in Command Deck without destabilizing currently healthy runtime behavior, using a staged validation-first rollout.

## 2. Approved AFPs (Affected File Paths)
- `referenceDocs/03_Contracts/active/202602221653-CONTRACT_SAFE_LIGHT_TOGGLE_RESTORE.md` (this contract)
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
- `referenceDocs/05_Records/buildLogs/202602221653-EXECUTE_SAFE_LIGHT_TOGGLE_RESTORE.md`
- `referenceDocs/05_Records/buildLogs/202602221653-WALKTHROUGH_SAFE_LIGHT_TOGGLE_RESTORE.md`

## 3. Scope Boundaries
- **In Scope:**
  - Reintroduce theme toggle UI control in the global header.
  - Restore `localStorage`-backed theme persistence (`mcd_theme`) and `data-theme` application.
  - Restore light-theme CSS token block and keep dark theme defaults intact.
  - Preserve all existing behaviors currently in production (issue badge rendering, reload state action, tabs/views, card workflows).
  - Synchronize the three frontend copies to prevent future drift.
- **Out of Scope:**
  - Backend/API/state schema changes (`server.py`, `server.js`, `state.json` model).
  - Marketplace publishing or metadata work.
  - UI redesign outside of theme restoration.

## 4. Deterministic Execution Plan
1. **Pre-Change Snapshot**
   - Confirm current runtime behavior on active ports and capture baseline checks.
2. **Patch on Staging Path**
   - Implement theme restoration in runtime copy (`ops`) with minimal, surgical edits.
   - Keep issue badge and reload-state functionality untouched.
3. **Smoke Validation (Preview First)**
   - Verify toggle button is visible.
   - Verify light/dark switching works without console/runtime errors.
   - Verify theme persists across refresh.
   - Verify core operations remain healthy (board switch, create/edit/move card, reload state, view tab switching).
4. **Deterministic Sync**
   - Mirror validated frontend files to extension assets and command-deck-source copies.
5. **Post-Change Validation**
   - Repeat smoke checks after sync and confirm no regressions.
6. **Report + Halt**
   - Provide change summary, validation results, and any residual risks.

## 5. Risk Assessment
- **Regression Risk (High):** Broad copy replacement could remove newer features (issue badges, reload action).  
  **Mitigation:** Apply surgical theme-only deltas; validate preserved features explicitly.
- **Copy Drift Risk (Medium):** Fixing only one copy can reintroduce divergence later.  
  **Mitigation:** Sync all three frontend copies in the same execution slice.
- **Runtime Disruption Risk (Medium):** Live edits may temporarily affect active operator session.  
  **Mitigation:** Validate on preview first, then apply with immediate smoke checks and rollback-ready file diffs.

## 6. Acceptance Criteria
- [ ] Header includes a working theme toggle button.
- [ ] Theme toggles between dark and light immediately on click.
- [ ] Theme preference persists across page reload.
- [ ] Existing runtime features remain intact (issue badge, reload state, board/card operations, tab navigation).
- [ ] `ops`, extension asset, and command-deck-source frontend copies are synchronized.
- [ ] No new blocking console/runtime errors are introduced.

## 7. Operator Approval Gate
Execution is blocked pending operator approval.  
To begin implementation, invoke:

`/execute 202602221653-CONTRACT_SAFE_LIGHT_TOGGLE_RESTORE.md`
