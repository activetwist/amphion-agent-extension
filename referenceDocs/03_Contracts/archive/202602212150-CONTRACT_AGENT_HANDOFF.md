# Contract: CT-027 Agent Invocation & External Browser Fix (v1.9.4)

**Objective**: Ensure the Command Deck launches in a dedicated, external OS browser rather than an internal IDE tab (specifically for Cursor/VS Code Web). Re-introduce a lightweight clipboard trigger to solve the passive agent invocation failure during strategy generation.

**Context**: 
1. `vscode.env.openExternal` is intercepted by Agent IDEs like Cursor, trapping the Kanban board in a small editor tab.
2. Current Agent IDEs do not autonomously read files upon opening to initiate tasks. The `[!AGENT INSTRUCTION]` blocks are ignored unless the user explicitly prompts the agent to look at them.

**Proposed Changes**:
1. **External Browser Support (`src/scaffolder.ts`)**:
   - Refactor `launchCommandDeck` to use Node's `child_process.exec`.
   - Implement platform-specific launch commands (`open` for Darwin, `start` for Windows, `xdg-open` for Linux) instead of `vscode.env.openExternal(url)`.
2. **Agent Trigger Payload (`src/charterWizard.ts`)**:
   - In `runSourceDocsPath()`, inject a `vscode.env.clipboard.writeText` call right before the transition modal.
   - Payload: `"Please read the [!AGENT INSTRUCTION] block in this file and derive the Project Charter."`
   - Update the `showInformationMessage` text to instruct the user: *"Your Project Charter is open. We copied a trigger to your clipboard—paste it into your AI agent chat to begin derivation. Launch Command Deck when you are finished."*

**Acceptance Criteria**:
- Clicking "Launch Command Deck" causes the Kanban board to open in the user's primary desktop browser natively.
- Completing the "Import Source Docs" Webview flow automatically places the trigger prompt in the user's OS clipboard and alerts them to paste it.
