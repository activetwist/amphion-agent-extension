# CONTRACT: Command Deck UI Narrow Rail Refinement (V2)

**Date/Time:** 2026-02-23 18:27
**Status:** DRAFT (Pending Operator Approval)
**Codename:** `BlackClaw`
**Author:** AmphionAgent

## 1. Goal
To refine the Command Deck Dashboard UI (v1.25.4) by establishing a left-aligned, narrow-rail layout, enforcing consistent Markdown preview generation for all listed documents, and ensuring recent Mermaid enhancements are packaged correctly.

## 2. Affected File Paths (AFPs)
- `mcd-starter-kit-dev/extension/src/commandDeckDashboard.ts` (CSS positioning, HTML removal, `markdown.showPreview` logic)
- `mcd-starter-kit-dev/extension/package.json` (Version bump)

## 3. Scope Boundaries
**IN-SCOPE:**
1.  Decrease `.container` max-width to \~360px and change flex alignment to `flex-start` in `commandDeckDashboard.ts`.
2.  Remove the "IDE workflow artifacts" list item.
3.  Update the `openDynamicDoc` command handling to route dynamically found URIs to `vscode.commands.executeCommand('markdown.showPreview', uri)` instead of `vscode.open`.
4.  Confirm `ops/launch-command-deck` Mermaid assets are present in the extension source before building.
5.  Generate a `1.25.5` VSIX build.

**OUT-OF-SCOPE:**
-   Altering the core functionalities of the VS Code Extension (`scaffolder.ts`, `wizard.ts`).
-   Changing the local Command Deck server logic (`server.js`, `server.py`).

## 4. Execution Plan
1.  **UI Layout Modification:** Update internal CSS in `commandDeckDashboard.ts` to left-pin the container (`.container` CSS and `body` flex alignment).
2.  **HTML Cleanup:** Remove the static list item for "IDE workflow artifacts".
3.  **Command Handling Update:** Refactor `case 'openDynamicDoc'` to invoke `markdown.showPreview` for Charter and PRD requests.
4.  **Verification Check:** Run `diff` to ensure Mermaid changes from the workspace `ops/` are identical to the `assets` folder before packaging.
5.  **Compile & Package:** Bump package json to `1.25.5`, test compilation (`npm run compile`), and generate VSIX (`npm run package`).

## 5. Risk Assessment
- **Low Risk:** These are purely presentational changes and webview message routing updates. The underlying server mechanics remain untouched. As a result, catastrophic failure is highly improbable.

## 6. Acceptance Criteria
- [ ] Dashboard renders as a narrow rail pinned to the left side of the window.
- [ ] Clicking "Project Charter" or "High-Level PRD" opens a formatted VS Code Markdown Preview instead of raw text.
- [ ] "IDE Workflow Artifacts" is absent from the Details list.
- [ ] Mermaid updates are verified as present.
- [ ] VSIX `1.25.5` builds successfully without TypeScript errors.

## 7. Operator Approval
> To execute this contract, invoke the `/execute` command.
