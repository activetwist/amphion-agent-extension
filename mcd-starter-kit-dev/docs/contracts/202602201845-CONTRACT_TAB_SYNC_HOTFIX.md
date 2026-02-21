# Contract: v0.06a-hotfix-2 Tab Switch Bug Fix

Contract ID: `CT-20260220-OPS-010`
Date: `2026-02-20`
Project: `Content Monetization` (`Stacks`)
Phase: `Contract`

## Objective
Fix a routing bug introduced in `v0.06a-hotfix` where switching tabs failed to render the selected workspace because the root DOM attribute driving the FOUC CSS overrides was not natively tracking the active Javascript state.

## Authorized File Changes

### 1. Root DOM Attribute Synchronization
**Files**: `ops/launch-command-deck/public/app.js`
- Locate the `.navTabs.forEach` click listener wrapper inside the `registerEvents()` block.
- Instruct `app.js` to immediately apply `document.documentElement.setAttribute('data-current-view', state.currentView);` upon firing the `click` event.
- This single instruction aligns the SPA routing state with the global CSS hiding logic, allowing the view to seamlessly toggle without requiring a hard refresh.

## Acceptance Criteria
1. The SPA continues to boot into the last viewed tab saved in `localStorage` without FOUC artifacts.
2. Clicking a different navigation tab (e.g., Guide to Dashboard) instantly paints the new view on the screen.
3. The content block is no longer temporarily blank between a click event and a browser refresh.
