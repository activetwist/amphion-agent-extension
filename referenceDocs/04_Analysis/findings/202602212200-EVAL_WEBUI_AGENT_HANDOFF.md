# Evaluation: WebUI Agent Handoff Sequence (v1.10.0)

**Date:** 2026-02-21
**Phase:** 1 (Evaluate)
**Topic:** Transitioning the Agent Handoff into a persistent WebUI screen that controls the flow of generating and deriving the Charter and PRD sequentially.

## 1. Research & Current State
**Current Implementation (v1.9.4):**
1. The user selects "Import Source Docs" or "Start from Scratch".
2. The Webview sends a message to the extension, the extension generates the `.md` files, copies a single "trigger prompt" to the OS clipboard, and closes the Webview immediately.
3. A modal appears instructing the user to paste the clipboard into their chat. When they click "Launch", the Command Deck opens.
4. **The User's Observation**: 
   - The clipboard only has a tiny trigger logic. 
   - They want the actual *content* of the Prompts displayed in a WebUI screen.
   - They want independent buttons to "Create Project Charter" and "Create PRD" that copy specific payloads text into the chat.
   - After the PRD is complete, they want a final success screen before launching the Command Deck. 

## 2. Gap Analysis & Proposed Direction

### Gap 1: Pasting directly into Chat vs Clipboard
* **The Request:** "When the user clicks those buttons, the instructions are pasted into the chat."
* **The Reality:** VS Code Extensions *cannot* reliably execute API calls to paste text directly into third-party chat extensions (like Cursor's native chat, Windsurf's Cascade, or Copilot). The standard, fail-safe mechanism across all IDEs is `vscode.env.clipboard.writeText`. However, we *can* bind this action to nice UI buttons in the Webview.
* **Proposed Fix:** Create a new `agent-handoff-view` in `onboardingWebview.ts`. It will show two large action buttons: "Copy Charter Instructions" and "Copy PRD Instructions".

### Gap 2: Sequential UI State
* **The Request:** "Even better would be if the charter button were enabled and the prd button were not... then when the charter is created, the charter button is disabled and the prd button is enabled. Then... we congratulate the user and tell them to enjoy using MCD and to go take a look at more about the MCD process in the Command Deck."
* **Proposed Fix:** 
   1. The Webview handles state entirely on the frontend after receiving the generation confirmation.
   2. When "Import Docs" is clicked, tell the Extension to generate the files. The Extension replies `handoffReady` with the Charter and PRD prompt payloads.
   3. The Webview hides the selection view and shows `agent-handoff-view`.
   4. **Step 1:** Shows the Charter button (primary). PRD button is disabled. Command Deck button is hidden.
   5. **Step 2:** User clicks "Copy Charter Prompt". The text is copied to clipboard via extension messaging. The Charter button changes to "Charter Copied!" (disabled). The PRD button becomes primary.
   6. **Step 3:** User clicks "Copy PRD Prompt". Text is copied. PRD button changes to "PRD Copied!" (disabled).
   7. **Step 4:** A congratulations message fades in, along with the "Launch Command Deck" button.

### Gap 3: Prompt Text Visibility
* **Proposed Fix:** Display the actual prompt payloads in visual `<code>` or `<pre>` blocks above the buttons so the user sees what they are copying.

## 3. Scoping & Boundaries

**In-Scope:**
- Point release v1.10.0 (a significant UX refactor).
- Refactoring `charterWizard.ts` to *return* the prompt payloads instead of copying them blindly, and avoiding closing the panel.
- Adding the `agent-handoff-view` HTML/CSS/JS to `onboardingWebview.ts`.
- Handling clipboard write commands from the Webview via VS Code message passing.

**Out-of-Scope:**
- Attempting to use undocumented internal IDE APIs to force the chat panel open or inject text directly into it. The clipboard is the boundary.

## 4. Primitive Review
No new primitives required. We are relying on fundamental Webview Javascript state management and message passing.
