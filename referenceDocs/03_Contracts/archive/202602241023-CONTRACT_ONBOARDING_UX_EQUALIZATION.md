# CONTRACT

**Title:** UX Equalization for Onboarding Webview
**Status:** DRAFT
**Initiative:** SIP-1 UX Polish
**Date:** 2026-02-24

## 1. Objective
Refine the "Selection View" of the Onboarding Webview to present all three project initialization pathways ("Fast Onboarding", "Guided Onboarding", and "Import Docs") with equal visual weight, and clarify their descriptive copy.

## 2. Scope & Acceptance Criteria
- [ ] The "Import Docs" button no longer has the `primary` CSS class, ensuring its background and border match the other two options.
- [ ] Button labels and helper text match the exact user-provided strings.
- [ ] The webview UI reflects these changes accurately without breaking formatting.
- [ ] VSIX version 1.27.1 is successfully packaged containing these enhancements.

## 3. Implementation Plan
See `implementation_plan.md` artifact.

## 4. Affected File Paths (AFPs)
- [MODIFY] `mcd-starter-kit-dev/extension/src/onboardingWebview.ts`
- [MODIFY] `mcd-starter-kit-dev/extension/package.json`

## 5. Risks & Mitigation
- **Risk:** Erroneous HTML escaping causes TypeScript formatting issues (previous issue).
  **Mitigation:** Carefully isolated string replacements inside the HTML literal block. Tests run via `npm run compile`.

## 6. Approval
Awaiting User Approval to execute this contract.
