# Research Findings: Light Theme Visual Refinements (v1.18.0)

## Problem 1: Application Frame Gradient
The `html, body` background uses multiple `radial-gradient` layers that are hardcoded for a dark aesthetic. In Light Mode, these create a muddy, inconsistent "blueish" hue that contradicts the clean architectural goal.

## Problem 2: Guide View & Dialog Content Contrast
The `#guideContent` and `#docDialogContent` elements in `index.html` have a hardcoded `color: #d0e8fc;` inline style. This light blue text is nearly invisible against white backgrounds in Light Mode.

## Proposed Fixes

### 1. Externalize Background to Variables
Move the complex background gradient to a `--app-bg` variable.
- **Dark Mode**: Keep the existing rich radial gradients.
- **Light Mode**: Switch to a solid or very subtle flat color (`var(--bg-0)`).

### 2. Standardize Markdown Text Colors
Remove hardcoded `color: #d0e8fc;` from `index.html`. Replace with:
- `color: var(--text);` for general readability.
- Ensure the `markdown-body` class (likely from a CSS library or custom styles) is properly themed.

### 3. Cleanup Remaining Hardcoded Colors
- **Progress Track**: `#0a1622` -> `--bg-0` or a new variable.
- **Card Subtext**: `#8bb4cf` -> `--text-dim`.

## Acceptance Criteria
- [ ] No radial gradients visible in Light Mode application frame.
- [ ] MCD Guide text is dark and highly legible in Light Mode (Passes WCAG AA).
- [ ] Document Dialog text is dark and highly legible in Light Mode.
- [ ] No regression in Dark Mode visuals.
