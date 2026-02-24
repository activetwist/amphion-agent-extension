# CONTRACT: Onboarding Webview UX Refinements

**Date:** 2026-02-23
**Status:** DRAFT (Awaiting Approval)
**Codename:** `BlackClaw`

## 1. Goal
Execute the cosmetic and UX improvements mapped out in `202602232342-EVAL_UI_REFINEMENTS.md` to make the Project Onboarding webview friendlier and more aligned with the "Micro-Contracting" methodology, while fixing the default port.

## 2. Affected File Paths (AFPs)
- `mcd-starter-kit-dev/extension/src/onboardingWebview.ts` [MODIFY]
- `mcd-starter-kit-dev/extension/package.json` [MODIFY]

## 3. Scope & Execution Plan
1. **Port Adjustment:** Change the `initPort` default value from `4000` to `8765`.
2. **Setup Header Addition:** Add a descriptive `<h3>` and `<p>` above the Port and Initial Version fields to explain the Command Deck environment.
3. **Manual Setup Overhaul:** Repurpose the clinical labels and placeholders into the friendly "Project Blueprint", "Who is this for?", "What are you solving?", "The Big Idea", "Out of Scope", and "Definition of 'Done'" using conversational Mad Libs placeholders. Add `title` tooltips for progressive disclosure.
4. **Handoff Overhaul:** Adjust the final screen text to emphasize "System Architecture Locked!" and "Micro-Contracting."
5. **Version Bump:** Increment `package.json` to v1.26.2.

## 4. Risk Assessment
- **Low Risk:** These are entirely HTML template string modifications within the webview content generator. The actual data payload (`data.targetUsers`, `data.problemStatement`, etc.) passed back to VS Code remains functionally identical, guaranteeing zero breakage of the downstream document derivation scripts.

## 5. Verification Plan
- Build and package the `v1.26.2` extension.
- Initialize a new project and verify the UI text matches the UX requirements visually.
