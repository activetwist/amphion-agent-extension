# Walkthrough: Safe Light Toggle Restore

## What Changed
1. Open Command Deck.
2. Confirm top-right controls now include:
   - `☀️ Light Mode`
   - `New Board`
3. Click `☀️ Light Mode`.
4. Confirm the UI switches to light palette immediately.
5. Confirm button label changes to `🌙 Dark Mode`.
6. Refresh browser page.
7. Confirm light theme persists after reload.
8. Click `🌙 Dark Mode`.
9. Confirm dark palette is restored and label flips back.

## Regression Safety Checks
1. Create a test task (`+ Task`) and save.
2. Move the task between columns via drag-and-drop.
3. Open task edit dialog and confirm issue badge remains visible on cards.
4. Click `Reload State` and confirm board remains stable.
5. Switch views: `Board` → `Dashboard` → `MCD Guide` → `Board`.
6. Confirm no feature regressions in active flow.

## Server Parity Checks
- Python server path: `http://127.0.0.1:8765`
- Node server path: `http://127.0.0.1:4150`
- Both serve theme toggle + reload control + issue badge markup.

## Outcome
- Light mode toggle is restored.
- Existing runtime behavior remains intact.
- Frontend copies are reconciled for the repaired behavior set.
