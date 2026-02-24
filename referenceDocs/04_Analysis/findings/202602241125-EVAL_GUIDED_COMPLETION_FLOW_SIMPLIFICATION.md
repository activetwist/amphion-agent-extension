# EVALUATE: Guided Completion Flow Simplification

**Phase:** 1 (Research & Scoping)  
**Date:** 2026-02-24  
**Codename:** `BlackClaw`

## 1. Research
User request:
1. Guided onboarding should not ask users to review docs at the end.
2. Guided onboarding should end on the same success screen pattern as quick onboarding (directing users to open Command Deck).
3. Remove trailing period from the Launch Command Deck button label on that end screen.

Current implementation findings:
- Guided submit path (`submitGuided`) currently calls `promptPostInitReview(...)` after artifact generation.
- `promptPostInitReview` uses modal + quick-pick review prompts, then asks to launch Command Deck.
- Quick onboarding end state uses `manual-success-view` in the webview.
- `manual-success-view` button label is already `Launch Command Deck` (no trailing period).

## 2. Gap Analysis
- **Gap A:** Guided flow exits the webview and launches redundant review prompts.
- **Gap B:** Guided flow does not present the same in-webview terminal state as quick onboarding.
- **Gap C:** Launch button punctuation change appears already satisfied in current quick success view (`Launch Command Deck` has no period).

## 3. Scoping
**In-Scope**
- Remove guided flow dependency on `promptPostInitReview` from `submitGuided`.
- Keep onboarding webview open and switch to the same completion state pattern as quick onboarding.
- Ensure the completion CTA text is `Launch Command Deck` (no trailing period).

**Out-of-Scope**
- Reworking artifact generation logic.
- Modifying foundation schema.
- Broader redesign of onboarding view hierarchy.

## 4. Primitive Review
No new architecture primitives are required. This is a UX control-flow adjustment in existing onboarding surfaces.

## 5. AFP Candidates
- [MODIFY] `mcd-starter-kit-dev/extension/src/onboardingWebview.ts`
- [OPTIONAL MODIFY/DEFER] `mcd-starter-kit-dev/extension/src/postInit/postInitPrompt.ts` (only if cleanup is explicitly desired)

## 6. Execution Readiness
The requested change is low-risk and localized; behavior can be verified with a guided onboarding run ensuring no review prompt appears and success view CTA launches Command Deck.
