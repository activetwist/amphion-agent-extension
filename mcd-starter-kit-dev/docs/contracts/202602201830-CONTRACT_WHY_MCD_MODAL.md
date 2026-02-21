# Contract: v0.05a 'Why MCD' Informational Modal

Contract ID: `CT-20260220-OPS-007`
Date: `2026-02-20`
Project: `Content Monetization` (`Stacks`)
Phase: `Contract`

## Objective
Implement a "Why MCD" action button and informational dialog within the Playbook Guide View to explicitly articulate the value proposition of the constrained Micro-Contract Development methodology.

## Authorized File Changes

### 1. Frontend Layout Expansion
**Files**: `ops/launch-command-deck/public/index.html`
- Transform the `<main id="guideView">` header into a flexbox container (`justify-content: space-between`).
- Add `<button id="btnWhyMcd" class="btn">Why MCD?</button>` to the header.
- Inject a native `<dialog id="whyMcdDialog" class="card-dialog">` into the DOM.
- Populate the dialog with HTML structural copy highlighting three principles: **Constraint is Freedom**, **Total Observability**, and **Deterministic Engineering**. Focus on constraints, architecture, and record-keeping philosophy.

### 2. Frontend State Management
**Files**: `ops/launch-command-deck/public/app.js`
- Register `btnWhyMcd` and `whyMcdDialog`.
- Attach event listeners to open (`showModal()`) and close (`close()`) the dialog.

## Acceptance Criteria
1. The "Why MCD" button is strictly visible within the Guide tab context.
2. Clicking it successfully opens a formatted overlay modal containing the editorial copy.
3. The dialog can be closed via the close button.
4. All UI styling aligns with the existing `.app-shell` aesthetics.
