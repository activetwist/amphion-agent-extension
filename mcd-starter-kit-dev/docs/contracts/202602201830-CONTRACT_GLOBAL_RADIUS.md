# Contract: v0.04a-ui-hotfix Global Border Radius

Contract ID: `CT-20260220-OPS-006`
Date: `2026-02-20`
Project: `Content Monetization` (`Stacks`)
Phase: `Contract`

## Objective
Implement a hard global enforcement of a `4px` border radius across all Command Deck UI elements, standardizing the application's aesthetic.

## Authorized File Changes

### 1. Stylesheet Refactoring
**Files**: `ops/launch-command-deck/public/styles.css`
- Modify the `:root` pseudo-class to declare `--radius: 4px;`.
- Use regex/scripting to replace all hard-coded `border-radius: [value]px;` declarations throughout the stylesheet with `border-radius: var(--radius);`.

## Acceptance Criteria
1. The `--radius` CSS variable is explicitly set to `4px`.
2. All targetable DOM nodes (buttons, cards, panels, inputs, dialogs) cleanly inherit this `4px` radius via `var(--radius)`.
