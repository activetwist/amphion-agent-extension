# Walkthrough: Edit Dialog Issue Number Hotfix

## Existing Card Flow
1. Open Command Deck board.
2. Click any existing task card with an `issueNumber`.
3. In modal header, confirm issue number appears in upper-right.
4. Confirm value matches card issue badge on the board.

## New Card Flow
1. Click `+ Task` to open new-task dialog.
2. Confirm issue number header badge is hidden (no stale value shown).
3. Fill fields and save new card.
4. Re-open the saved card and confirm issue number now appears in header.

## Regression Checks
1. Edit existing task fields and save.
2. Delete a task from modal.
3. Confirm normal modal controls (`Cancel`, `Delete`, `Save`) still work.

## Expected Result
- Edit modal shows issue number only when card data includes it.
- New card dialog shows clean fallback behavior.
