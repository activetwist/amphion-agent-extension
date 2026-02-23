# EVALUATION: Charts Tab + Mermaid Temporary Block Cleanup

**Phase:** 1 (Evaluate)  
**Status:** Complete  
**Date (UTC):** 2026-02-23T02:00:49Z  
**Codename:** `BlackClaw`

## 1. Request
1. Remove the temporary Mermaid render test block from Guardrails after successful validation.
2. Add a dedicated `Charts` top tab, positioned before `MCD Guide`.
3. In the `Charts` tab, provide a clean selector/list UI for discovered charts.
4. Selecting a chart should open/render it in a dismissable side panel.
5. Population/integration of real chart sources is not required in this pass.

## 2. Current-State Research
- Top navigation currently has three views: `board`, `dashboard`, `guide` in `ops/launch-command-deck/public/index.html`.
- View switching is currently hardcoded in two places:
  - inline startup visibility CSS in `index.html` (`data-current-view` rules)
  - runtime `render()` branching in `ops/launch-command-deck/public/app.js`
- Mermaid render pipeline is already operational in `app.js` (`renderMermaidBlocks`, theme-aware initialization).
- The temporary test chart currently lives in `referenceDocs/00_Governance/GUARDRAILS.md` and can be removed safely now that behavior is validated.

## 3. Gap Analysis
### Gap A: No charts workspace
- There is no dedicated charts view, no chart-list component, and no chart preview container.

### Gap B: No side-panel primitive in current UI
- Existing modal (`docDialog`) supports doc reading, but not split-pane chart browsing with persistent list + dismissable preview.

### Gap C: View routing is brittle for additional tabs
- The current inline CSS rules only encode `board`, `dashboard`, `guide`.
- Adding `charts` requires coordinated updates in both HTML visibility guards and JS `render()` flow.

### Gap D: Chart source contract is undefined
- There is no agreed data source for chart inventory (filesystem scan, state file, docs parser, etc.).
- Request explicitly allows deferring real population.

## 4. Scope Definition
### In Scope
- Remove temporary Mermaid block from `GUARDRAILS.md`.
- Add `Charts` tab in top nav before `MCD Guide`.
- Add empty-state-capable chart list UI in `Charts` view.
- Add dismissable right-side chart preview panel shell.
- Add minimal in-memory/mock chart item(s) or empty list handling for interaction testing.
- Keep dark/light theme parity and accessibility-consistent styling.
- Mirror front-end changes into extension asset copy to avoid source/package drift.

### Out of Scope
- Persisting chart metadata to board state or backend.
- Auto-discovery from repository files.
- Editing/chart authoring workflows.
- Export/share/chart lifecycle management.

## 5. Primitive Review
- **No new architecture primitive is strictly required** for this phase.
- Existing frontend primitives (tabbed views + Mermaid renderer + theme tokens) are sufficient for first delivery.
- If later chart indexing/persistence is added, a new primitive for "Chart Registry" may be warranted.

## 6. Recommended Contract AFPs
- `referenceDocs/00_Governance/GUARDRAILS.md` (remove temporary test block)
- `ops/launch-command-deck/public/index.html` (new tab and charts workspace markup)
- `ops/launch-command-deck/public/app.js` (view routing, charts interactions, side-panel open/close)
- `ops/launch-command-deck/public/styles.css` (charts layout, list states, side panel styles)
- `mcd-starter-kit-dev/extension/assets/launch-command-deck/public/index.html` (mirror)
- `mcd-starter-kit-dev/extension/assets/launch-command-deck/public/app.js` (mirror)
- `mcd-starter-kit-dev/extension/assets/launch-command-deck/public/styles.css` (mirror)

## 7. Acceptance Targets for Follow-on Contract
- `Charts` tab appears before `MCD Guide` and switches reliably.
- Charts view presents clean list/selector UI with empty-state messaging.
- Selecting a chart opens a right-side dismissable preview panel.
- Close action hides panel without breaking tab state.
- Temporary Mermaid test section is removed from Guardrails.
- Source + extension asset copies remain aligned.
