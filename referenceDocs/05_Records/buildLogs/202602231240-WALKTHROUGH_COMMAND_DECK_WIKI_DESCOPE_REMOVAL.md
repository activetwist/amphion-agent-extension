# WALKTHROUGH · Command Deck Wiki/Notes De-Scope Removal

## Operator Validation Steps
1. Launch Command Deck runtime (`./ops/launch-command-deck/run.sh`).
2. Confirm top nav no longer includes a `Notes` tab.
3. Switch between `Board`, `Dashboard`, `Charts`, and `MCD Guide`; confirm each renders.
4. If browser had stale `mcd_current_view=wiki`, reload and verify app opens on `Board`.
5. Confirm API negative behavior:
   - `GET /api/wiki/tree` -> 404 route-not-found
   - `GET /api/wiki/files?path=...` -> 404 route-not-found
6. Confirm archive outputs exist:
   - `referenceDocs/archive/20260223-CommandDeck-Wiki/`
   - Wiki contracts moved under `referenceDocs/03_Contracts/archive/`

## Expected Result
Command Deck runs without Wiki/Notes feature surface and without wiki backend endpoints, while core board/dashboard/charts/guide workflows remain intact.
