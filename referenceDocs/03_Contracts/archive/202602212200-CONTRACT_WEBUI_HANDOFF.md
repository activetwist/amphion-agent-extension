# Contract: CT-028 WebUI Agent Handoff Sequence (v1.10.0)

**Objective**: Move the Agent Handoff process from modal dialogs and passive markdown files into a dedicated, interactive Webview screen. This screen will serialize the document generation process, allowing users to copy agent prompts for the Charter and PRD sequentially before launching the Command Deck.

**Context**: 
The V1.9.x flow uses a single lightweight clipboard trigger and opens the Charter markdown file. The user finds this jarring. They want the Webview to remain open and guide them through the actual prompt copying process step-by-step.

**Proposed Changes**:
1. **`src/charterWizard.ts`**:
   - Refactor `runManualPath` and `runSourceDocsPath` to return the generated prompt payloads instead of copying them to the clipboard or showing blocking modals.
   - Do not close the Webview panel inside these functions.
2. **`src/onboardingWebview.ts`**:
   - Add a new `agent-handoff-view` HTML state to the Webview.
   - Upon receiving the `handoffReady` message (with the payloads), transition the UI to this new view.
   - **Step 1:** Display the Charter generation prompt and a primary "Copy Charter Prompt" button. (PRD button is disabled).
   - **Step 2:** When clicked, message VS Code to copy the text to clipboard. Update button to "Copied!" and enable the PRD button.
   - **Step 3:** When PRD button is clicked, copy PRD text to clipboard. Update button to "Copied!". Show the "Launch Command Deck" button.
   - **Step 4:** User clicks "Launch Command Deck", triggering the server execution and external browser launch.

**Acceptance Criteria**:
- The Webview remains open after selecting a Strategy path.
- The user is presented with a sequential UI to copy the Charter and PRD prompts.
- The clipboard successfully receives the prompt text upon button clicks.
- The Command Deck only launches upon final confirmation.
