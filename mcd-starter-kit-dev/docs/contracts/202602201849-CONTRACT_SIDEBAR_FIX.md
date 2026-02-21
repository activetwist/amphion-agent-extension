# Contract: v0.06a-hotfix-3 Sidebar Sync Optimization

Contract ID: `CT-20260220-OPS-011`
Date: `2026-02-20`
Project: `Content Monetization` (`Stacks`)
Phase: `Contract`

## Objective
Fix a visual desynchronization where the "Milestone Progress" telemetry in the global sidebar failed to render if the Single Page Application automatically booted into the `Dashboard` or `MCD Guide` via localized caching.

## Authorized File Changes

### 1. Elevating Render Instructions
**Files**: `ops/launch-command-deck/public/app.js`
- Locate the main `render()` function.
- Identify the call to `renderMilestoneProgress()`, which is currently conditionally nested inside the `else` block tied to `state.currentView === "board"`.
- Move the `renderMilestoneProgress()` call *above* the conditional `if/else` block, placing it alongside `renderBoardList()` and `renderBoardMeta()`. 
- This architectural decouple guarantees the persistent `<aside>` elements are explicitly populated on every cycle, regardless of which workspace UI pane is active.

## Acceptance Criteria
1. The SPA continues to boot into the last viewed tab saved in `localStorage`.
2. Hard refreshing the SPA directly into the "Dashboard" or "MCD Guide" tab now successfully initializes and paints the "Milestone Progress" metrics inside the global sidebar context.
3. No visual flashes or regressions occur.
