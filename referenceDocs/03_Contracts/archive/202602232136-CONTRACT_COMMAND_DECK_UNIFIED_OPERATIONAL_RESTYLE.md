# CONTRACT: Command Deck Unified Operational Restyle

**Phase:** 2.0 (Contract)  
**Status:** Drafted (Pending Operator Approval)  
**Date:** 2026-02-23  
**Codename:** `BlackClaw`

**Source Evaluation:** `referenceDocs/04_Analysis/findings/202602232129-COMMAND_DECK_UNIFIED_OPERATIONAL_RESTYLE_EVAL.md`

## 1. Goal
Apply the approved `restyle.json` visual system to Command Deck as a deterministic frontend restyle: semantic light/dark tokens, layered surfaces, controlled elevation, restrained accent usage, and component consistency without changing product behavior.

## 2. Approved AFPs (Affected File Paths)
- `referenceDocs/03_Contracts/active/202602232136-CONTRACT_COMMAND_DECK_UNIFIED_OPERATIONAL_RESTYLE.md` (this contract)
- `ops/launch-command-deck/public/styles.css`
- `ops/launch-command-deck/public/index.html`
- `ops/launch-command-deck/public/app.js` (only for minimal class/hook/theme label adjustments if required)
- `mcd-starter-kit-dev/extension/assets/launch-command-deck/public/styles.css`
- `mcd-starter-kit-dev/extension/assets/launch-command-deck/public/index.html`
- `mcd-starter-kit-dev/extension/assets/launch-command-deck/public/app.js` (only if required for parity)
- `mcd-starter-kit-dev/command-deck-source/public/styles.css`
- `mcd-starter-kit-dev/command-deck-source/public/index.html`
- `mcd-starter-kit-dev/command-deck-source/public/app.js` (only if required for parity)
- `ops/launch-command-deck/data/state.json` (board observability card updates)
- `referenceDocs/05_Records/buildLogs/202602232136-EXECUTE_COMMAND_DECK_UNIFIED_OPERATIONAL_RESTYLE.md`
- `referenceDocs/05_Records/buildLogs/202602232136-WALKTHROUGH_COMMAND_DECK_UNIFIED_OPERATIONAL_RESTYLE.md`

## 3. Scope Boundaries
### In Scope
- Replace current palette-centric and border-heavy styling with semantic tokenized styles aligned to `restyle.json` for both dark and light modes.
- Implement elevation model and tonal separation across canvas, panels, columns, cards, and interactive states.
- Enforce accent governance for primary/success/warning/danger usage.
- Refactor component styling for nav tabs, buttons, badges, kanban columns/cards, dialogs, toolbar, tables/list rows, charts, and dashboard panels.
- Update typography model to sans-first UI with monospace scoped to traceability/code/ID contexts.
- Reduce inline visual styles in `index.html` by moving to class-based CSS where feasible.
- Maintain behavior parity (drag/drop, CRUD flows, tab routing, theme toggle, reload, docs/charts rendering).
- Synchronize restyle changes across runtime and template mirror copies listed in AFPs.

### Out of Scope
- Backend API/routing changes in `server.js` or `server.py`.
- Feature redesign, new views, workflow logic changes, or persistence model changes.
- External frameworks, package installs, build pipeline introduction.
- Version closeout and contract archival (handled in closeout phase).

## 4. Deterministic Execution Plan
1. **Preflight + Contract Conflict Guard**
   - Confirm active-contract overlap with `202602231240-CONTRACT_COMMAND_DECK_WIKI_DESCOPE_REMOVAL.md` is non-blocking (status executed, different objective).
   - Treat this contract as sole visual-system authority for Command Deck restyle scope.
2. **Token Foundation Pass**
   - Introduce semantic tokens for canvas/surface/card/elevated layers, text hierarchy, action semantics, focus ring, and motion timing.
   - Encode dark and light mode token sets from the provided restyle spec.
3. **Surface + Component Restyle Pass**
   - Apply tokens to layout surfaces and components (nav, sidebar, panels, toolbar, columns, cards, dialogs, charts/dashboard sections, badges, table/list separators).
   - Replace hardcoded gradients/colors where they violate token governance.
4. **Markup Hygiene + Minimal JS Alignment**
   - Move inline presentational styles from `index.html` into CSS classes.
   - Update `app.js` only if class references or theme button labels require synchronization.
5. **Mirror Sync Pass**
   - Propagate approved frontend restyle changes to extension asset and command-deck-source mirrors.
   - Keep behavior and selectors aligned across all included copies.
6. **Verification + Evidence**
   - Run manual smoke checks for Board, Dashboard, Charts, Guide in both dark and light modes.
   - Validate no blocking regressions in card operations, modal open/edit/delete, drag/drop, import/export, and reload state.
   - Produce execute log and walkthrough artifacts in `05_Records/buildLogs/`.

## 5. Risk Assessment
- **Contrast Regression (Medium):** Token replacement could degrade WCAG contrast in one theme.
  - **Mitigation:** Verify primary text, secondary text, badges, and button states in both themes during execute.
- **Mirror Drift (High):** Runtime/template copy divergence can recur if not synchronized in same slice.
  - **Mitigation:** Include all mirror AFPs in this contract and verify with checksum/diff checks.
- **Layout Regression (Medium):** Inline-style extraction may alter spacing/alignment unexpectedly.
  - **Mitigation:** Incremental class migration with per-view smoke checks.
- **Behavior Coupling (Low/Medium):** Selector/class changes can break JS bindings if renamed carelessly.
  - **Mitigation:** Preserve DOM IDs used by `app.js`; constrain JS changes to minimal wiring only.

## 6. Acceptance Criteria
- [ ] Restyle token architecture is semantic and dual-theme (light/dark) per `restyle.json` intent.
- [ ] Border-heavy look is replaced with tonal separation and layered elevation.
- [ ] Buttons, badges, nav tabs, cards, and dialogs use governed action semantics (primary/success/warning/danger).
- [ ] Typography model is sans-first, with monospace limited to traceability/code/ID contexts.
- [ ] Inline presentational styles in `index.html` are materially reduced in favor of reusable CSS classes.
- [ ] Board/Dashboard/Charts/Guide behavior remains functionally unchanged.
- [ ] Theme toggle remains operational and persistent across refresh.
- [ ] Runtime frontend and both mirror frontend copies are synchronized for this restyle slice.
- [ ] Execute log and walkthrough records are created under `referenceDocs/05_Records/buildLogs/`.

## 7. Work Item Mapping
- `AM-075`: Restyle token foundation + elevation model
- `AM-076`: Restyle component surface pass
- `AM-077`: Restyle parity sync + visual QA
- `AM-078`: Contract artifact and execute authorization gate

## 8. Active Contract Conflict Check
- Existing active file: `referenceDocs/03_Contracts/active/202602231240-CONTRACT_COMMAND_DECK_WIKI_DESCOPE_REMOVAL.md`
- Assessment: overlapping AFPs (`index.html`, `app.js`, `styles.css`) but no unresolved objective conflict because CT-032 is marked executed and scoped to wiki removal.
- Guardrail action: execute this contract as the active visual-restyle authority; archive/close prior executed contract during closeout hygiene.

## 9. Operator Approval Gate
Ready for execution upon explicit operator authorization.

Invoke execution with:
`/execute 202602232136-CONTRACT_COMMAND_DECK_UNIFIED_OPERATIONAL_RESTYLE.md`
