# Research Findings: Light Theme Accessibility & UI Refinement (v1.17.0)

## Problem Statement
The current v1.16.0 Light Theme was implemented as a quick CSS variable inversion. While it provides a "light" experience, it inherits several dark-mode hardcoded styles and fails WCAG AA/AAA contrast requirements in critical areas.

## WCAG 2.1 Contrast Audit (Light Mode)

| Element | Background | Text/Border | Contrast Ratio | Status |
| :--- | :--- | :--- | :--- | :--- |
| **Active Nav Tab** | `--accent` (#20c997) | `--bg-0` (#f4f6f8) | **2.2:1** | ❌ **FAIL** (Req: 4.5:1) |
| **Primary Button** | Dark Green Gradient | `--text` (#212529) | **~1.5:1** | ❌ **FAIL** (Req: 4.5:1) |
| **Danger Button** | Dark Red Gradient | `--text` (#212529) | **~1.2:1** | ❌ **FAIL** (Req: 4.5:1) |
| **Milestone Badge** | White (#ffffff) | Cyan (#aee7ff) | **1.2:1** | ❌ **FAIL** (Req: 4.5:1) |
| **Body Text** | White (#ffffff) | Gray (#212529) | **15.1:1** | ✅ **AAA PASS** |
| **Dim Text** | White (#ffffff) | Gray (#495057) | **8.4:1** | ✅ **AAA PASS** |

## UI/UX Observations
1. **Saturation Overload**: The neon green (`--accent`) and neon blue (`--accent-2`) are designed for dark mode. On a light background, they feel vibrating and "cheap".
2. **Hardcoded Styles**: `.btn.primary`, `.btn.danger`, and `.priority-*` badges use hardcoded colors that don't shift with the theme.
3. **Ghosting**: The `backdrop-filter: blur(8px)` on panels works well in dark mode but is less noticeable and sometimes muddy on light gray gradients.
4. **Header Visuals**: The "Theme" button icon/text needs to accurately reflect the *target* state or the *current* state more clearly.

## Proposed Palette Shift (High Contrast & Premium)

Instead of just inverting, we move to a "Pro" architectural palette:

- **Primary**: Deep Blue/Slate (`#0f172a`) for buttons and active states.
- **Accent**: Indigo/Violet (`#6366f1`) for subtle highlights.
- **Surface**: Off-white (`#f8fafc`) with subtle borders instead of heavy shadows.
- **Success**: Emerald (`#10b981`) but with white text only.

## Acceptance Criteria for v1.17.0
- [ ] All interactive elements must meet WCAG AA (4.5:1) or higher.
- [ ] Refactor `.btn.primary` and `.btn.danger` to use theme-aware variables.
- [ ] Refactor `.priority-*` and `.milestone-badge` to use theme-aware variables.
- [ ] Implement a more "Premium" light mode aesthetic with refined typography and spacing.
- [ ] Fix the "Theme" button logic to be intuitive (Show Moon icon for "Switch to Dark").
