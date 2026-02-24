# CONTRACT

**Title:** Stacked List Layout for Onboarding Webview
**Status:** DRAFT
**Initiative:** SIP-1 UX Polish
**Date:** 2026-02-24

## 1. Objective
Replace the 3-column horizontal grid of `<button>` elements in the Onboarding Webview's "Selection View" with a vertical list of three, clean, borderless rows. Each row will contain left-aligned text (heading and subcopy) and a right-aligned action button.

## 2. Scope & Acceptance Criteria
- [ ] The horizontal 3-column `grid` is replaced with a standard `flex` or `block` stacked layout.
- [ ] Each option is represented as a structural row containing:
  - Left Side: An `<h4>` (e.g. "1. Fast Onboard") and a `<p>` with the descriptive copy. Both are left-aligned.
  - Right Side: A clickable `<button>` featuring the exact text (e.g., "Start Fast Onboarding") and its corresponding emoji icon.
- [ ] The rows have clean spacing, with no structural visible borders or card-like background highlights wrapping each individual row.
- [ ] The buttons use the standard dark theme styling (removing any `primary` green classes).
- [ ] VSIX version 1.27.2 is successfully packaged containing these enhancements.

## 3. Implementation Plan
See `implementation_plan.md` artifact.

## 4. Affected File Paths (AFPs)
- [MODIFY] `mcd-starter-kit-dev/extension/src/onboardingWebview.ts`
- [MODIFY] `mcd-starter-kit-dev/extension/package.json`

## 5. Risks & Mitigation
- **Risk:** HTML restructuring in a TypeScript template literal breaks parsing or CSS display.
  **Mitigation:** Carefully encapsulate the new layout inside `.option-row` flex containers. Recompile and visually verify layout in standard VS Code extension host prior to package completion.

## 6. Approval
Awaiting User Approval to execute this contract.
