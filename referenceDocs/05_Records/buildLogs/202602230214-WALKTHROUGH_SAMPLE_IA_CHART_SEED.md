# WALKTHROUGH: Seed Sample IA Chart for Charts Tab

## Goal
Verify that Charts tab now includes one default sample IA chart and that it can be removed deterministically.

## Steps
1. Open Command Deck.
2. Click `Reload State`.
3. Open `Charts` tab.
4. Confirm one list item appears:
   - `Sample IA · Marketing Site`
5. Select the sample chart.
6. Verify preview panel shows Mermaid-rendered IA:
   - `Home` with outgoing links to `About`, `Blog`, and `Contact`.
7. Optional removal test:
   - delete sample object from `charts` in `ops/launch-command-deck/data/state.json`
   - click `Reload State`
   - confirm chart is no longer listed.

## Expected Result
- Sample chart is visible and renderable by default.
- Deletion path works cleanly via state edit + reload.
