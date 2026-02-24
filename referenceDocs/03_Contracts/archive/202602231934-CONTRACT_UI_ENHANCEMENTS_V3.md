---
type: CONTRACT
id: CT-035
date: 2026-02-23
status: DRAFT
objective: V3 Dashboard Enhancements (Chat Routing & Mermaid Example Scaffold)
---

# CONTRACT: V3 Dashboard Enhancements

## 1. Goal
Refine the AmphionAgent Dashboard by routing MCD Command Flow buttons directly to the IDE Chat pane (via `workbench.action.chat.open`) instead of the terminal. Simultaneously, ensure all new scaffolded projects include an example Architecture Primitive (the "Marketing Website IA" Mermaid chart) to demonstrate visual rendering capabilities from day one.

## 2. Affected File Paths (AFPs)
- `mcd-starter-kit-dev/extension/src/commandDeckDashboard.ts` (Modify message handler and HTML)
- `mcd-starter-kit-dev/extension/src/templates/mermaidExample.ts` (New file)
- `mcd-starter-kit-dev/extension/src/scaffolder.ts` (Import and write template to disk)
- `mcd-starter-kit-dev/extension/package.json` (Version bump)

## 3. Scope Boundaries
**In-Scope:**
- Modify `runTerminalCommand` in `commandDeckDashboard.ts` to `openChatInput`.
- Implement `vscode.commands.executeCommand('workbench.action.chat.open', { query: ... })`.
- Create the exact `Sample IA · Marketing Site` Mermaid string in `mermaidExample.ts`.
- Instruct the scaffolder to write it to `referenceDocs/02_Architecture/EXAMPLE_MARKETING_IA.md`.
- Add an explicit `[!NOTE]` instructing the AI agent to delete the file when no longer needed.
- Bump version to `1.25.6` and package VSIX.

**Out-of-Scope:**
- Modifying the webview rendering logic in the server.
- Altering the IDE agent's internal reasoning or system prompt.

## 4. Execution Plan
1. **Chat Forwarding:** Update the case switch in `commandDeckDashboard.ts` and the `onclick` handlers in the HTML.
2. **Template Creation:** Author `src/templates/mermaidExample.ts` returning the required Markdown string.
3. **Scaffolding:** Wire `mermaidExample.ts` into `src/scaffolder.ts` so it writes to the `02_Architecture` directory.
4. **Validation:** Compile the TypeScript project (`npm run compile`).
5. **Release:** Bump `package.json` to `1.25.6` and `npm run package`.

## 5. Risk Assessment
- **Severity:** Low. We are merely altering UI interaction routing and adding one generated file.
- **Rollback:** Revert changes to `commandDeckDashboard.ts` and `scaffolder.ts`.

## 6. Acceptance Criteria
- [ ] Clicking `/evaluate`, `/board`, etc. opens the VS Code Chat pane and pre-fills the query.
- [ ] New project scaffolds generate `referenceDocs/02_Architecture/EXAMPLE_MARKETING_IA.md`.
- [ ] The generated Markdown chart matches the `state.json` "Sample IA · Marketing Site" (`flowchart TD` Home -> About, Blog, Contact).
- [ ] Build `1.25.6` compiles successfully.
