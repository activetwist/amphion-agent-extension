# Contract: v0.06a View State Persistence

Contract ID: `CT-20260220-OPS-008`
Date: `2026-02-20`
Project: `Content Monetization` (`Stacks`)
Phase: `Contract`

## Objective
Implement native DOM `localStorage` caching to persist the operator's active view (Board, Dashboard, or MCD Guide) across browser reloads, improving the UX of the Single Page Application context loop.

## Authorized File Changes

### 1. Frontend State Initialization & Binding
**Files**: `ops/launch-command-deck/public/app.js`
- **Initialization**: Refactor `state.currentView` definition to query `localStorage.getItem("mcd_current_view")`. Default to `"board"` if the key is null or undefined.
- **Persistence**: Refactor the `.navTabs` event listeners inside the `registerEvents()` function block. When a tab is clicked and `state.currentView` is mutated, execute a corresponding `localStorage.setItem("mcd_current_view", state.currentView)` command to synchronously cache the intent.

## Acceptance Criteria
1. The SPA defaults to `Board` view on first load.
2. Clicking any navigation tab (e.g., Dashboard) successfully saves the view state key to `localStorage`.
3. Executing a hard refresh (Cmd+R or F5) forces the SPA to boot directly into the cached view, instead of resetting to the default.
4. No network requests or backend alterations are introduced.
