# CONTRACT: Help Command Integration

**Date:** 2026-02-24
**Status:** DRAFT (Awaiting Approval)
**Codename:** `BlackClaw`

## 1. Goal
Implement a new `/help` command button on the Command Deck Dashboard that triggers a custom Agent workflow designed to orient users across three specific domains: The Extension, The Command Deck, and the MCD Methodology.

## 2. Affected File Paths (AFPs)
- `mcd-starter-kit-dev/extension/src/commandDeckDashboard.ts` [MODIFY]
- `.agents/workflows/help.md` [NEW]
- `mcd-starter-kit-dev/extension/package.json` [MODIFY]

## 3. Scope & Execution Plan
1. **Agent Workflow:**
   - Create the `.agents/workflows/help.md` file following the standard YAML frontmatter pattern.
   - Instruct the agent to introduce itself as the Amphion Assistant and offer to answer questions specifically about three things:
     1. The IDE Extension.
     2. The Command Deck.
     3. Micro-Contract Development (MCD).
   - End the workflow by forcing the agent to ask the user: *"Which of these three things would you like to know more about?"*
2. **Dashboard UI Integration:**
   - In `mcd-starter-kit-dev/extension/src/commandDeckDashboard.ts`'s `_getHtmlForWebview()` method, inject a new `command-item` into the DOM.
   - The button should appear logically next to or slightly separated from the existing lifecycle commands (Evaluate > Board > Contract > Execute > Closeout).
   - Set the button up to trigger `vscode.postMessage({command: 'openChatInput', text: '/help'})`.
3. **Version Bump:**
   - Increment `package.json` extension version to `1.26.3`.

## 4. Risk Assessment
- **Low Risk:** Adding a new static button to the Webview HTML template string implies zero risk of breaking the core typescript execution logic. Creating a new text file (`help.md`) in a `.agents` directory has zero operational impact on the Node/Python binaries.

## 5. Verification Plan
- Build and package the `v1.26.3` extension.
- Install the VSIX.
- Open the Command Deck Dashboard UI.
- Verify the new `/help` button exists and that clicking it correctly pastes `/help` into the chat input and opens the panel.
- Submit the `/help` command and verify the Agent reads the new workflow and prompts the user successfully.
