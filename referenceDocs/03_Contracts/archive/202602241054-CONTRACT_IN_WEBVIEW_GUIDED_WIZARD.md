# CONTRACT

**Title:** In-Webview Guided Wizard for SIP-1
**Status:** EXECUTED
**Initiative:** SIP-1 UX Polish
**Date:** 2026-02-24

## 1. Objective
Refactor the "Guided Onboarding" workflow so that all 18 data points for the Strategic Initialization Protocol (SIP-1) are captured natively inside the rich HTML Webview, removing the reliance on VS Code's native `showQuickPick` and `showInputBox` UI prompts.

## 2. Scope & Acceptance Criteria
- [x] Construct a new `<div id="guided-view" class="view">` inside `onboardingWebview.ts`.
- [x] Translate the 18 SIP-1 fields (Target Users, Problem Statement, Value Prop, Non-Goals, Features, Metrics, Constraints) into corresponding HTML form inputs (`<input type="text">`, `<select>`, `<fieldset>` for multi-selects) grouped logically.
- [x] Implement local JavaScript inside the Webview to collect these 18 fields upon clicking "Generate Strategy Artifacts".
- [x] Update the `OnboardingPanel._onDidReceiveMessage` `startGuided` case (or create a new `submitGuided` case) to accept this JSON payload, instantly build the `FoundationState`, write the `foundation.json`, and generate the respective Charter/PRD markdown files.
- [x] Delete `src/onboarding/guidedWizard.ts` (deprecated).
- [x] VSIX version 1.28.0 is successfully packaged containing these enhancements.

## 3. Implementation Plan
See `implementation_plan.md` artifact.

## 4. Affected File Paths (AFPs)
- [MODIFY] `mcd-starter-kit-dev/extension/src/onboardingWebview.ts`
- [DELETE] `mcd-starter-kit-dev/extension/src/onboarding/guidedWizard.ts`
- [MODIFY] `mcd-starter-kit-dev/extension/package.json`

## 5. Risks & Mitigation
- **Risk:** Complex data binding from 18 discrete HTML elements fails or drops arrays during transit via `vscode.postMessage`.
  **Mitigation:** The frontend collector script will map specific arrays (e.g. multi-selects) into string arrays before dispatching to the main extension process. Recompilation validation.

## 6. Approval
Approved by user in chat on 2026-02-24 and executed in this session.
