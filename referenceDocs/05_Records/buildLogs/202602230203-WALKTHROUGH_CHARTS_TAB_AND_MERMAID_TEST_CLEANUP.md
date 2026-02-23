# WALKTHROUGH: Charts Tab UI + Mermaid Test Cleanup

## Goal
Validate the new Charts tab UX and confirm temporary Mermaid test cleanup is complete.

## Steps
1. Launch Command Deck and view top navigation.
2. Confirm tab sequence:
   - `Board`
   - `Dashboard`
   - `Charts`
   - `MCD Guide`
3. Click `Charts`.
4. Verify Charts workspace layout:
   - left list selector panel labeled `Available Charts`
   - right preview panel with `Dismiss` action
5. With no charts available, confirm empty-state message appears in list panel.
6. (Optional data check) Insert a temporary chart object into state payload and reload:
   - verify selecting chart opens preview panel
   - verify `Dismiss` closes preview panel
7. Switch between Board, Dashboard, Charts, and MCD Guide to verify no routing regressions.
8. Toggle dark/light mode on Charts tab to verify readability and layout consistency.
9. Open `Guardrails` document and verify temporary Mermaid test section is absent.

## Expected Result
- Charts tab is present, clean, and operational.
- Preview panel open/close flow works.
- Existing tabs are unaffected.
- Guardrails no longer contains temporary Mermaid test block.
