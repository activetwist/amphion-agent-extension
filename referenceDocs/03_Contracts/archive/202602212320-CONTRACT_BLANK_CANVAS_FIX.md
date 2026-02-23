# Contract: CT-032 Blank Canvas Workflow Fix (v1.12.0)

**Objective**: Ensure the "Start from Scratch" (manual) workflow bypasses the AI Agent Handoff screen and directs the user to a unique success view offering them the ability to launch their Command Deck.

**Context**: 
Currently, typing out the manual answers and generating the Strategy documents sends the user straight into the `agent-handoff-view`. Since manual users generate *completed* documents instead of stub documents, they don't need AI derivation prompts. Showing them the copy payload buttons is confusing. The importer workflow must remain untouched.

**Proposed Changes**:
1. **`src/charterWizard.ts`**:
   - Change `runManualPath`'s return type from `Promise<{ charterPrompt: string, prdPrompt: string }>` to `Promise<void>`.
   - Remove the `return { charterPrompt... }` block at the bottom of the function.
   - Retain the `showTextDocument` options from v1.11.1 (`{ viewColumn: vscode.ViewColumn.Beside, preserveFocus: true }`) so the document opens beside the success view without stealing focus.
2. **`src/onboardingWebview.ts` (Backend handler)**:
   - In `generateManual`, remove `const manualPrompts = ...` and the data payload.
   - Post `{ command: 'manualComplete' }` to the Webview rather than `handoffReady`.
3. **`src/onboardingWebview.ts` (Webview UI & JS)**:
   - Add a new `<div id="manual-success-view" class="view">` inside the HTML containing a clean success message and a `<button id="btn-launch-cd-manual">` button.
   - Add Webview JS to listen for the `manualComplete` message. When caught, switch the active class to `manual-success-view`.
   - Add an event listener to `btn-launch-cd-manual` that posts `{ command: 'launchCommandDeck' }` back to the extension panel.

**Acceptance Criteria**:
- Users answering the 6 questions manually do not see any Agent Prompts.
- Manual users are shown a clean success view.
- The success view provides a clear button to launch the Kanban board.
- Selecting the "Import Source Docs" flow remains completely unaffected and behaves exactly as it did in v1.11.2.
