# EVALUATE: Command Deck Enhancements (V3)

**Phase: 1 (Research & Scoping)**
**Date:** 2026-02-23
**Focus:** Chat Integration for Command Flow & Mermaid Example Scaffolding

## 1. Research & Analysis
- **Command Flow Buttons:** Currently, the buttons (1. `/evaluate`, 2. `/board`, etc.) trigger `runTerminalCommand` which spins up an "Amphion Agent" terminal and pastes the command. However, since AmphionAgent operates as an IDE Chat agent, this command needs to be forwarded to the Copilot Chat / IDE Chat pane.
- **VS Code Chat API:** The built-in VS Code command `workbench.action.chat.open` allows extensions to trigger the chat panel and populate the user input box with a query.
- **Mermaid Example Schema:** The user wants an example "Marketing Website IA" mermaid chart included in the generated project package. I have located the existing `Sample IA · Marketing Site` payload in the server's `state.json`. We will use this exact flowchart structure, along with a note telling the user to ask the IDE agent to delete it when they are done.

## 2. Gap Analysis
- **Command Handling:** `commandDeckDashboard.ts` needs a new message handler (e.g., `openChatInput`) replacing `runTerminalCommand`.
- **Project Scaffolding:** `mcd-starter-kit-dev/extension/src/scaffolder.ts` currently does not generate any initial files in `02_Architecture`.

## 3. Scoping Boundaries
**In-Scope:**
- Modify `commandDeckDashboard.ts` to replace `runTerminalCommand` with an `openChatInput` switch case.
- Utilize `vscode.commands.executeCommand('workbench.action.chat.open', { query: message.text })` to paste the command.
- Create `src/templates/mermaidExample.ts` containing the explicit `flowchart TD` struct from `state.json` (Home -> About, Blog, Contact). It will include a `> [!NOTE]` directive for the IDE agent.
- Update `scaffolder.ts` to write this template to `referenceDocs/02_Architecture/EXAMPLE_MARKETING_IA.md` during project initialization.
- Generate and package a `1.25.6` VSIX build.

**Out-of-Scope:**
- Altering the actual Chat Agent capabilities (this extension merely bootstraps the workflow).
- Changing the server Mermaid viewer logic (this was covered and verified in the previous cycle).

## 4. Primitive Review
No new core Architecture Primitives are introduced. We are merely adding an initial scaffolding asset and switching from terminal injection to chat pane injection.
