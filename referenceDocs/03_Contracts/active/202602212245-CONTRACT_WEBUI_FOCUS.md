# Contract: CT-030 WebUI Focus & Prompt Refinements (v1.11.1)

**Objective**: Ensure the newly completed `agent-handoff-view` remains strictly in focus when the Webview process writes the target strategy markdown files. Also ensure the AI agent natively prompts the user to return to the UI to execute the second step of the handoff sequence.

**Context**: 
In v1.11.0, the `showTextDocument` call opens the generated charter in the active editor column, which happens to be where the `onboardingWebview` is running. This forces the WebUI behind the text document, breaking the onboarding wizard flow. Additionally, the agent needs to explicitly direct the user back to the WebUI to copy the PRD prompt once the Charter is derived.

**Proposed Changes**:
1. **`src/charterWizard.ts`**:
   - Update `vscode.window.showTextDocument(await vscode.workspace.openTextDocument(charterPath));` to include `vscode.TextDocumentShowOptions`.
   - Send `{ viewColumn: vscode.ViewColumn.Beside, preserveFocus: true, preview: false }`.
2. **`src/templates/charterStub.ts`**:
   - In `getCharterAgentInstruction`, append the following instruction block at the end:
     *"Finally, when you have finished writing the Project Charter, tell the user exactly this: 'The Project Charter is complete. Please return to the MCD Onboarding WebUI to copy and paste the High-Level PRD derivation prompt.'"*

**Acceptance Criteria**:
- The WebUI remains the active, visible panel while the markdown file opens seamlessly in a split pane beside it.
- The derived Project Charter instructs the agent to execute a clear handoff response back to the WebUI.
