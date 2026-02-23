# WALKTHROUGH: Command Deck Unified Operational Restyle

**Contract:** `202602232136-CONTRACT_COMMAND_DECK_UNIFIED_OPERATIONAL_RESTYLE.md`  
**Walkthrough Date (UTC):** `2026-02-23T21:47:46Z`

## 1. Launch
1. Start Command Deck runtime from `ops/launch-command-deck/`.
2. Open the app in a browser.

## 2. Theme Validation
1. Confirm default dark mode uses layered surfaces (canvas/panel/column/card) rather than heavy border framing.
2. Click `Light Mode` and confirm:
   - canvas switches to soft neutral off-white background,
   - panel/card layers remain visually separated by tone + subtle shadow,
   - primary/danger button semantics remain distinct and readable.
3. Refresh browser and confirm theme persistence.

## 3. Board Surface Validation
1. Open `Board` view.
2. Validate visual updates:
   - column shells and cards use rounded 10-12px radii and soft elevation,
   - drag target highlights use the primary accent,
   - issue badges remain monospace and muted.
3. Open a task card, edit/save, and confirm no modal regressions.

## 4. Dashboard / Charts / Guide Validation
1. Open `Dashboard` and confirm panel hierarchy, doc button row styling, and traceability feed legibility.
2. Open `Charts` (runtime + extension copy) and confirm list/panel styling and preview layout behavior.
3. Open `MCD Guide` and `Why MCD?` modal; confirm typography and spacing follow the new style system.

## 5. Utilities / Workflow Checks
1. Use `Reload State` button and confirm no UI break.
2. Verify board navigation tabs still switch views correctly.
3. Verify `New Board`, `+ Task`, and `Save Board Meta` controls still respond.

## 6. Mirror Consistency Checks
1. Confirm `styles.css` is byte-identical across:
   - `ops/launch-command-deck/public/styles.css`
   - `mcd-starter-kit-dev/extension/assets/launch-command-deck/public/styles.css`
   - `mcd-starter-kit-dev/command-deck-source/public/styles.css`
2. Confirm all three `index.html` copies have no inline `style="..."` attributes.
3. Confirm theme toggle labels in all three `app.js` copies are text-only (`Dark Mode` / `Light Mode`).
