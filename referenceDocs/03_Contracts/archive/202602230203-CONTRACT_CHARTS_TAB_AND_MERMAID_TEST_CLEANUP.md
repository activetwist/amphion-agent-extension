# CONTRACT: Charts Tab UI + Mermaid Test Cleanup

**Phase:** 2.0 (Contract)  
**Status:** Proposed  
**Date:** 2026-02-23  
**Codename:** `BlackClaw`

## 1. Goal
Implement a dedicated `Charts` top-tab experience (before `MCD Guide`) with a clean chart-selector view and a dismissable right-side chart preview panel, and remove the temporary Mermaid render test block from Guardrails now that rendering is validated.

## 2. Approved AFPs (Affected File Paths)
- `referenceDocs/03_Contracts/active/202602230203-CONTRACT_CHARTS_TAB_AND_MERMAID_TEST_CLEANUP.md` (this contract)
- `referenceDocs/00_Governance/GUARDRAILS.md` (remove temporary Mermaid test section)
- `ops/launch-command-deck/public/index.html` (add `Charts` tab + charts view markup)
- `ops/launch-command-deck/public/app.js` (view routing + chart list selection + side panel dismiss logic)
- `ops/launch-command-deck/public/styles.css` (charts layout + selector styles + side panel visuals)
- `mcd-starter-kit-dev/extension/assets/launch-command-deck/public/index.html` (mirror)
- `mcd-starter-kit-dev/extension/assets/launch-command-deck/public/app.js` (mirror)
- `mcd-starter-kit-dev/extension/assets/launch-command-deck/public/styles.css` (mirror)
- `ops/launch-command-deck/data/state.json` (observability card update)
- `referenceDocs/05_Records/buildLogs/202602230203-EXECUTE_CHARTS_TAB_AND_MERMAID_TEST_CLEANUP.md` (new)
- `referenceDocs/05_Records/buildLogs/202602230203-WALKTHROUGH_CHARTS_TAB_AND_MERMAID_TEST_CLEANUP.md` (new)

## 3. Scope Boundaries
- **In Scope:**
  - Add `Charts` tab in top nav between `Dashboard` and `MCD Guide`.
  - Add a charts workspace with:
    - chart list/selector region (empty-state-safe)
    - dismissable side preview panel
  - Wire interaction flow:
    - selecting chart opens preview panel
    - dismiss action hides panel
  - Use existing Mermaid renderer to show chart content in preview when available.
  - Remove the temporary Mermaid render test section from `GUARDRAILS.md`.
  - Keep source and extension asset copies aligned.
- **Out of Scope:**
  - Persistent chart registry or backend schema changes.
  - Filesystem chart auto-discovery.
  - Chart authoring/edit workflows.
  - Export/share/versioning for chart artifacts.

## 4. Deterministic Execution Plan
1. **Guardrails Cleanup**
   - Remove the temporary Mermaid test section from `referenceDocs/00_Governance/GUARDRAILS.md`.
2. **Navigation and View Routing**
   - Add `Charts` tab to top nav in both source and extension asset HTML.
   - Extend startup visibility rules and runtime `render()` routing for `charts`.
3. **Charts Workspace UI**
   - Add charts view container with:
     - list selector panel
     - right-side preview panel and explicit close control
   - Add clean empty states for no charts selected / no charts available.
4. **Interaction Wiring**
   - Implement deterministic in-memory chart list stub for first pass.
   - On selection, render chart content and open side panel.
   - On close, dismiss side panel without breaking tab state.
5. **Verification**
   - Manual theme check in light + dark modes.
   - Validate no regressions in Board, Dashboard, and MCD Guide tabs.
6. **Documentation**
   - Record execute and walkthrough artifacts with verification evidence.

## 5. Risk Assessment
- **Routing Regression (Medium):** Introducing `charts` may break existing tab visibility.
  - **Mitigation:** Update both inline visibility CSS and JS render branching together; manually validate all tabs.
- **UI Drift Risk (Medium):** Source and extension asset copies may diverge.
  - **Mitigation:** Mirror all front-end updates in both locations during the same execute pass.
- **Theme/Contrast Risk (Low):** New panel/list styles may underperform in one theme.
  - **Mitigation:** Reuse existing theme tokens and verify in light/dark.
- **Scope Expansion Risk (Low):** Chart persistence could creep into this pass.
  - **Mitigation:** Keep data source in-memory only; defer persistence by explicit boundary.

## 6. Acceptance Criteria
- [ ] Temporary Mermaid test section removed from `GUARDRAILS.md`.
- [ ] `Charts` tab appears before `MCD Guide` in top nav.
- [ ] `Charts` view displays clean chart list/selector UI.
- [ ] Selecting a chart opens a dismissable right-side preview panel.
- [ ] Dismiss action closes panel cleanly with no tab/routing errors.
- [ ] Board/Dashboard/MCD Guide behavior remains intact.
- [ ] Source and extension asset copies are synchronized.
- [ ] Execute and walkthrough records are created.

## 7. Operator Approval Gate
Execution is blocked pending operator approval.  
To begin implementation, invoke:

`/execute 202602230203-CONTRACT_CHARTS_TAB_AND_MERMAID_TEST_CLEANUP.md`
