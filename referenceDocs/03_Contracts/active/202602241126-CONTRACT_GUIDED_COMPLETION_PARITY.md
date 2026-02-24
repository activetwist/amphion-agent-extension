# CONTRACT: Guided Completion Parity (Command Deck-First)

**Phase:** 2 (Planning & Agreement)  
**Date:** 2026-02-24  
**Status:** DRAFT (Awaiting Approval)  
**Codename:** `BlackClaw`

## 1. Objective
Remove redundant post-generation review prompts from the Guided onboarding path and align its end-state with Quick onboarding behavior: show the same in-webview success screen that directs users to open the Command Deck.

## 2. Source Evaluation
- `referenceDocs/04_Analysis/findings/202602241125-EVAL_GUIDED_COMPLETION_FLOW_SIMPLIFICATION.md`

## 3. Active Contract Overlap (Flag)
Active contract overlap exists with:
- `referenceDocs/03_Contracts/active/202602240946-CONTRACT_SIP1_ONBOARDING.md`

Overlap surface:
- `mcd-starter-kit-dev/extension/src/onboardingWebview.ts`

Execution for this contract should be explicitly approved as a targeted follow-up UX refinement on top of SIP-1 onboarding.

## 4. Scope Boundaries
**In-Scope**
- Remove Guided flow dependency on `promptPostInitReview`.
- Keep user in webview after Guided artifact generation.
- Route Guided completion to the same success UI state used by quick onboarding (`manual-success-view`).
- Ensure Launch CTA text on that completion screen is `Launch Command Deck` (no trailing period).
- Bump extension patch version and package VSIX.

**Out-of-Scope**
- Foundation schema changes.
- Charter/PRD content generation changes.
- Command Deck server or dashboard redesign.
- Broad cleanup/refactor of `postInitPrompt.ts` beyond this flow change.

## 5. Affected File Paths (AFPs)
**Modify**
- `mcd-starter-kit-dev/extension/src/onboardingWebview.ts`
- `mcd-starter-kit-dev/extension/package.json`

**Potential Generated Output**
- `mcd-starter-kit-dev/extension/out/onboardingWebview.js`
- `mcd-starter-kit-dev/extension/out/onboardingWebview.js.map`
- `mcd-starter-kit-dev/extension/amphion-agent-1.28.1.vsix`

## 6. Implementation Plan
See:
- `referenceDocs/03_Contracts/active/202602241126-IMPLEMENTATION_PLAN_GUIDED_COMPLETION_PARITY.md`

## 7. Acceptance Criteria
- [ ] Guided submit path no longer invokes `promptPostInitReview`.
- [ ] After successful Guided artifact generation, onboarding remains in webview and shows the same completion screen pattern as quick onboarding.
- [ ] Completion CTA label is exactly `Launch Command Deck` (no trailing period).
- [ ] Clicking completion CTA launches Command Deck via existing message handler.
- [ ] `npm run compile` passes.
- [ ] New VSIX is packaged for patched version `1.28.1`.

## 8. Risks & Mitigations
- **Risk:** Guided completion may fail to render success view if message routing is not reused correctly.  
  **Mitigation:** Reuse existing `manualComplete` message path and validate UI transition in walkthrough.
- **Risk:** Removing review prompts could remove implicit optional artifact-open behavior some users relied on.  
  **Mitigation:** Success view continues directing to Command Deck; artifacts remain accessible via UI/docs workflow.

## 9. Verification Plan
- Compile validation: `npm run compile`.
- Packaging validation: `vsix` build for `1.28.1`.
- Manual walkthrough:
  1. Run Guided onboarding.
  2. Complete all required fields and generate artifacts.
  3. Confirm no review prompt modal appears.
  4. Confirm success screen appears with `Launch Command Deck` label.
  5. Confirm button launches Command Deck.

## 10. Approval Required
Operator review required. If approved, reference this contract filename to begin Execute phase.
