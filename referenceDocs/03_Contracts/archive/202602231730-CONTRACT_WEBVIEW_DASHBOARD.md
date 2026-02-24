# CONTRACT: Internal Webview Command Deck Dashboard

**Phase:** 2.0 (Contract)  
**Status:** Canonical Instruction Set  
**Date:** 2026-02-23  
**Codename:** `BlackClaw`

**Source Evaluation:** `referenceDocs/04_Analysis/findings/202602231713-AMPHION_UI_EVAL.md`

## 1. Goal
Introduce a persistent, rich "Command Deck" UI inside the VS Code environment (a `WebviewPanel` Editor Tab) for the AmphionAgent extension. This UI acts as a centralized dashboard allowing the user to initiate MCD commands (`/evaluate`, `/execute`, etc.), manage server state, and access quick project links non-destructively.

## 2. Approved AFPs (Affected File Paths)
- `referenceDocs/03_Contracts/active/202602231730-CONTRACT_WEBVIEW_DASHBOARD.md` (this contract)
- `mcd-starter-kit-dev/extension/package.json`
- `mcd-starter-kit-dev/extension/src/extension.ts`
- `mcd-starter-kit-dev/extension/src/commandDeckDashboard.ts` (new)

## 3. Scope Boundaries
- **In Scope:**
  - Create `mcd.openDashboard` command.
  - Create a new `commandDeckDashboard.ts` module with a singleton `WebviewPanel`.
  - Build aesthetic UI markup with Agent Personas, Command flows, and utility links.
  - Wire UI button clicks to VS Code extension actions (e.g., executing commands in the terminal, opening `.md` files in the editor).
- **Out of Scope:**
  - Modifying the existing `onboardingWebview.ts` or `mcd.init` behavior (must remain perfectly non-destructive).
  - Writing the actual autonomous agent logic; this is purely a UI facade to launch existing terminal scripts/workflows.

## 4. Deterministic Execution Plan
1. **Manifest Registration**
   - Add `mcd.openDashboard` command to `package.json` under `contributes.commands`.
2. **Dashboard Provider Implementation**
   - Create `src/commandDeckDashboard.ts` based on the singleton pattern found in `onboardingWebview.ts`.
   - Implement `_getHtmlForWebview` returning modern HTML/CSS mimicking the UI visual reference.
   - Implement a message listener that handles events like `{ command: 'runTerminalCommand', text: '/evaluate' }` and `{ command: 'openFile', path: 'PROJECT_CHARTER.md' }`.
3. **Extension Wiring**
   - Import `CommandDeckDashboard` into `src/extension.ts`.
   - Register the command `vscode.commands.registerCommand('mcd.openDashboard', ...)` in `activate()`.
4. **Build & Verify**
   - Compile TypeScript (`npm run compile`).
   - Launch Extension Development Host to verify functionality.

## 5. Risk Assessment
- **Breaking Onboarding Flow (Low):** This is purely an additive update. The existing onboarding logic is isolated in its own file and command.
- **Terminal Execution Scope (Low/Medium):** Sending raw text to a VS Code terminal requires ensuring the correct workspace terminal is selected.
  - **Mitigation:** Use `vscode.window.createTerminal` if one doesn't exist, or re-use an "Amphion Terminal" by name explicitly to maintain a clean environment.

## 6. Acceptance Criteria
- [ ] New command `mcd.openDashboard` is available in the Command Palette.
- [ ] Executing the command opens a rich Webview Panel editor tab.
- [ ] The dashboard includes actionable buttons for MCD workflows (`/evaluate`, `/board`, etc.).
- [ ] Clicking a command button sends the command text to the integrated VS Code terminal.
- [ ] The existing `mcd.init` onboarding behavior continues to work flawlessly.

## 7. Operator Approval Gate
Execution approved and invoked on 2026-02-23:  
`/execute 202602231730-CONTRACT_WEBVIEW_DASHBOARD.md`
