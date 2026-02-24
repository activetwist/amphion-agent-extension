# Evaluation Findings: Global Collapsible Sidebar

**Objective**: Allow the user to collapse the main global sidebar ("left rail") across all views to maximize screen real estate, especially useful for the Wiki and Board views.

## Research & Gap Analysis

### Current State
- The global sidebar is a 300px fixed grid column in `.app-shell`.
- It is persistent across all views (Board, Dashboard, Wiki, etc.).
- There is currently no way to hide it.

### Gaps
- **Collapse UI**: No button exists to toggle the sidebar state.
- **Layout States**: CSS only defines a fixed 2-column layout.
- **Persistence**: Sidebar state is not tracked or remembered.

## Proposed Strategy: Global State Toggle

We will implement a system-wide toggle for the `.app-shell` layout.

### 1. Unified Toggle UI
- Add a collapse button (`<<`) at the top of the local sidebar.
- When collapsed, provide an expand button (`>>`) in a slim 48px gutter or floating at the edge.

### 2. CSS Layout Shifts
- Use a class `.is-collapsed` on the `<body>` or `.app-shell`.
- Transition the `grid-template-columns` from `300px 1fr` to `48px 1fr`.
- Hide the sidebar contents (`opacity: 0` or `display: none`) and show only the "expand" affordance.

### 3. State & Persistence
- Store the state in `localStorage` as `mcd_sidebar_collapsed`.
- Apply this state immediately on page load via the head script to prevent "flash of uncollapsed sidebar".

## Scoping

### In-Scope
- Global sidebar toggle mechanism.
- Smooth CSS transitions.
- Persistent state across sessions.

### Out-of-Scope
- Collapsing the nested Wiki-specific sidebar (distinction made by user).
- Resizable (draggable) sidebar widths.

Would you like to populate the Command Board or build a contract based on these findings?
