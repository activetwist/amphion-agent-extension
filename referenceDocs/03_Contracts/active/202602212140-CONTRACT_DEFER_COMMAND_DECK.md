# Contract: CT-026 Deferred Command Deck Launch (v1.9.3)

**Objective**: Defer the launch of the Command Deck server and browser window until *after* the Strategy Docs sequence (Project Charter and PRD) is completed or skipped. Add a modal transition to orient the user to the "Product Owner" workflow before the browser steals focus.

**Context**: Launching the browser Kanban board concurrently with the Strategy document generation steals IDE focus at the exact moment the user needs to interact with their AI agent for document derivation.

**Proposed Changes**:
1. **`src/scaffolder.ts`**:
   - Extract the `serverTerminal` execution and `vscode.env.openExternal` logic from the end of `buildScaffold()`.
   - Export a new standalone function `launchCommandDeck(root: vscode.Uri, config: ProjectConfig)`.
2. **`src/charterWizard.ts`**:
   - At the end of `runManualPath()` and `runSourceDocsPath()`, display a modal `showInformationMessage`.
   - Text: *"MCD has initialized your project! The Command Deck kanban board will now launch in your browser. Complete your Strategy Docs with your AI Agent, and return to VS Code when you are ready to manage your work."*
   - Button: `Launch Command Deck`. When clicked, invoke `launchCommandDeck()`.
3. **`src/onboardingWebview.ts`**:
   - In the message handler for `cancel` (Skip for now), display a similar modal and invoke `launchCommandDeck()` if the user proceeds.

**Acceptance Criteria**:
- The browser no longer opens automatically during the scaffolding phase.
- Following manual input or document import, the user is presented with a VS Code modal instructing them to finish with their agent.
- Clicking the modal button successfully starts the server and opens the browser.
