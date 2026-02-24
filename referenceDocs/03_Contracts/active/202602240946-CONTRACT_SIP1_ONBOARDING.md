# CONTRACT: SIP-1 Guided Onboarding Integration

**Phase:** 2 (Planning & Agreement)
**Date:** 2026-02-24
**Status:** Active Contract
**Feature:** Strategic Initialization Protocol (SIP-1) Onboarding Mode

## 1. Scope & Objective
Add a third initialization protocol—Guided Structured Init (SIP-1)—to the `AmphionAgent` extension. This mode will utilize native vscode QuickPicks and InputBoxes to deterministically capture project state into a canonical `foundation.json`, which is then used to generate a rich `PROJECT_CHARTER.md` and `HIGH_LEVEL_PRD.md`. 
As requested, the Webview UI will be updated so all three options (Quick Init, Guided Init, Import Docs) are displayed with equal visual hierarchy.

## 2. Technical Approach
1.  **Architecture Primitives (New):**
    *   Introduce `foundation.json` as the systemic source of truth for the project's strategic variables.
2.  **Webview Modifications (`onboardingWebview.ts`):**
    *   Redesign the `<div id="selection-view">` to feature three parallel, equally weighted action buttons for the three modes.
    *   Add message routers for the new `startGuidedInit` postMessage payload.
3.  **Data Capture & Serialization:**
    *   Create `guidedWizard.ts` to manage the multi-step `vscode.window.showQuickPick` sequence described in the SIP-1 spec.
    *   Create `foundationWriter.ts` to construct and serialize the gathered data into `referenceDocs/01_Strategy/foundation.json`.
4.  **Template Generation:**
    *   Create `charterFromFoundation.ts` and `prdFromFoundation.ts` to parse the JSON and strictly output the corresponding markdown templates.
5.  **Post-Initialization Routing:**
    *   Create `postInitPrompt.ts` to uniformly ask the user if they'd like to review their artifacts across all three onboarding vectors.
6.  **Command Deck Scaffold (`init_command_deck.py`):**
    *   Modify the initial `seed_cards` payload to include the newly required tickets ("Spec Lock", "Non-Goals", "Artifacts exist") and append a `foundationPath` property to the board instance metadata.

## 3. AFP Enumeration (Affected File Paths)
**Modified:**
- `mcd-starter-kit-dev/extension/src/onboardingWebview.ts`
- `mcd-starter-kit-dev/extension/src/scaffolder.ts`
- `mcd-starter-kit-dev/extension/package.json`
- `ops/launch-command-deck/scripts/init_command_deck.py`

**Created:**
- `mcd-starter-kit-dev/extension/src/onboarding/initMode.ts`
- `mcd-starter-kit-dev/extension/src/onboarding/guidedWizard.ts`
- `mcd-starter-kit-dev/extension/src/foundation/foundationSchema.ts`
- `mcd-starter-kit-dev/extension/src/foundation/foundationWriter.ts`
- `mcd-starter-kit-dev/extension/src/templates/charterFromFoundation.ts`
- `mcd-starter-kit-dev/extension/src/templates/prdFromFoundation.ts`
- `mcd-starter-kit-dev/extension/src/postInit/postInitPrompt.ts`

## 4. Risk Assessment & Guardrails
- **Risk:** Modifying the `selection-view` HTML could disrupt the message passing logic for the existing Quick Init and Import modes.
- **Mitigation:** Strict isolation of event listeners in the `return Html` block and validation of the existing payload schemas.
- **Risk:** Unintended overwrites of user-provided strategy docs.
- **Mitigation:** Implementing the `fs.existsSync` circuit breaker defined in the SIP-1 spec (7.4 Collision Avoidance) to prompt for replacement vs timestamping.

## 5. Approval Required
Operator, please review this contract and the associated implementation plan. If the scope and AFP enumeration align with your expectations, authorize the execution phase.
