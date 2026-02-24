# CONTRACT

**Title:** Equal-Width Stacked Layout Buttons for Onboarding Webview
**Status:** APPROVED
**Initiative:** SIP-1 UX Polish
**Date:** 2026-02-24

## 1. Objective
Ensure the three action buttons in the new Stacked Layout Onboarding webview design are uniform in width.

## 2. Scope & Acceptance Criteria
- [ ] Add `width: 250px` (or similar unified width) instead of `min-width` to the `.option-row button` CSS rule.
- [ ] VSIX version 1.27.3 is successfully packaged containing these enhancements.

## 3. Implementation Plan
See `implementation_plan.md` artifact.

## 4. Affected File Paths (AFPs)
- [MODIFY] `mcd-starter-kit-dev/extension/src/onboardingWebview.ts`
- [MODIFY] `mcd-starter-kit-dev/extension/package.json`

## 5. Risks & Mitigation
- **Risk:** Fixed width causes text overflow.
  **Mitigation:** `250px` is wide enough to accommodate the longest string ("🧭 Start Guided Walkthrough"), preventing wrapping.

## 6. Approval
Approved by User via `@[/execute]`.
