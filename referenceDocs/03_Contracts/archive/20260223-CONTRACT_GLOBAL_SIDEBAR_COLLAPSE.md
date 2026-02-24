# CONTRACT · Global Collapsible Sidebar

**Goal**: Implement a global toggle for the main "left rail" (sidebar) to maximize horizontal workspace across all views.

## Acceptance Criteria
- [ ] A persistent toggle button (`<<` / `>>`) is added to the global sidebar.
- [ ] Collapsing the sidebar reduces its width from 300px to 48px.
- [ ] Sidebar content is hidden/faded out when collapsed.
- [ ] Sidebar state (collapsed/expanded) is persisted in `localStorage`.
- [ ] The state is applied early in the `<head>` to prevent layout flash on reload.
- [ ] Layout transitions are smooth.

## Implementation Steps

### 1. UI & Layout (AM-057)
- Add the toggle button to the top of the `.sidebar` in `index.html`.
- Add CSS transition for `.sidebar` and `.app-shell` in `styles.css`.
- Define `.is-collapsed .sidebar` styles to reduce width and hide children.

### 2. State & Logic (AM-058)
- Update the `<head>` script in `index.html` to apply `mcd_sidebar_collapsed` state.
- Implement the toggle listener in `app.js` and update `localStorage`.

### 3. Verification (AM-059)
- Verify collapse behavior in Board, Dashboard, and Wiki views.
- Verify persistence after full page refresh.

## Affected Files
- `ops/launch-command-deck/public/index.html` [MODIFY]
- `ops/launch-command-deck/public/styles.css` [MODIFY]
- `ops/launch-command-deck/public/app.js` [MODIFY]
