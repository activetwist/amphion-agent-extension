# Evaluation: WebUI Focus & Prompt Refinements (v1.11.1)

**Date:** 2026-02-21
**Phase:** 1 (Evaluate)
**Topic:** Resolving WebUI focus stealing and updating the AI Agent's Charter derivation prompt to enforce the sequential handoff.

## 1. Research & Current State
**Current Implementation (v1.11.0):**
1. **Focus Stealing:** When `charterWizard.ts` executes `vscode.window.showTextDocument(charterPath)`, VS Code opens the file in the active editor column and steals focus. Because the `onboardingWebview` is also in the active column, the Webview is hidden behind the new text document, breaking the visual flow of the onboarding sequence.
2. **Missing PRD Handoff Prompt:** The Agent successfully derives the Charter, but the prompt does not explicitly instruct the Agent to tell the user to return to the WebUI for step 2 (the PRD). This leaves the user hanging without a strong call to action.

## 2. Gap Analysis & Proposed Direction

### Gap 1: WebUI Focus Loss
* **Proposed Fix:** Modify the `showTextDocument` call to utilize the `vscode.TextDocumentShowOptions` object. By passing `{ viewColumn: vscode.ViewColumn.Beside, preserveFocus: true }`, VS Code will open the Charter in a split pane next to the WebUI, while keeping the WebUI active and visible for the user to continue clicking through the sequential wizard.

### Gap 2: Agent Handoff Communication
* **Proposed Fix:** Update `getCharterAgentInstruction` in `src/templates/charterStub.ts`. Append a final explicit instruction for the AI agent:
  * *"Finally, when you have finished writing the Project Charter, tell the user exactly this: 'The Project Charter is complete. Please return to the MCD Onboarding WebUI to copy and paste the High-Level PRD derivation prompt.'"*

## 3. Scoping & Boundaries

**In-Scope:**
- Point release v1.11.1.
- Minor typescript flag addition in `charterWizard.ts`.
- String template update in `charterStub.ts`.

**Out-of-Scope:**
- Further UI restructuring. This is purely a UX configuration pass.

## 4. Primitive Review
Relying on out-of-the-box `vscode.window` options and string concatenation. No new primitives needed.
