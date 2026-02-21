# Contract: v0.04a Tabbed UX & MCD Walkthrough

Contract ID: `CT-20260220-OPS-005`
Date: `2026-02-20`
Project: `Content Monetization` (`Stacks`)
Phase: `Contract`

## Objective
Implement a multi-view Tabbed Navigation layout in the Command Deck global header, and build out a dedicated "Guide" view that natively renders an MCD Playbook document for operator walkthroughs.

## Authorized File Changes

### 1. Scaffold Automation
**Files**: `MCD_SCAFFOLD_v2.md`
- Append steps to the scaffold workflow to auto-generate `referenceDocs/00_Governance/MCD_PLAYBOOK.md` during project initialization.

### 2. Backend Routing
**Files**: `ops/launch-command-deck/server.py`
- Extend the `/api/docs/` endpoint to handle a `playbook` request.
- Endpoint must locate and read `referenceDocs/00_Governance/MCD_PLAYBOOK.md` securely.

### 3. Frontend Experience
**Files**: 
- `ops/launch-command-deck/public/index.html`
- `ops/launch-command-deck/public/styles.css`
- `ops/launch-command-deck/public/app.js`

**Authorizations**:
- Refactor the `.global-header` flex configuration.
- Construct a visual Tab Group (`[Board] [Dashboard] [Guide]`).
- Float the `<button id="btnNewBoard">` element to the far right.
- Build a `<main id="guideView">` container specifically designated for playbook rendering.
- Update `state.currentView` router in `app.js` to handle the 3-state navigation (Board, Dashboard, Guide).
- Implement `renderGuide()` logic invoking the new backend `/api/docs/playbook` endpoint and passing the response to the `marked.js` rendering cycle.

### 4. Direct Injection (Current Stacks Project only)
**Files**: `referenceDocs/00_Governance/MCD_PLAYBOOK.md`
- Provide physical instantiation of the newly scaffolded MDC_PLAYBOOK file into the live "Stacks" directory structure to allow immediate rendering testing in the local tier.

## Acceptance Criteria
1. The global header presents three cohesive tabs matching the app’s `app-shell` CSS styling.
2. The "New" action button is floated to the right layout edge.
3. Clicking the "Guide" tab switches the viewport payload gracefully.
4. The `MCD_PLAYBOOK.md` physically renders via Markdown in the new viewport.
5. All operations conform to the `local-only` mandate.
