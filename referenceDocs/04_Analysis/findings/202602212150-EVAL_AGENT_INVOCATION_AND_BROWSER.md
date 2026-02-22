# Evaluation: Agent Invocation and Browser Context (v1.9.4)

**Date:** 2026-02-21
**Phase:** 1 (Evaluate)
**Topic:** Resolving passive AI agent invocation failures and forcing the Command Deck out of IDE-internal browser tabs in Cursor.

## 1. Research & Current State
**Current Implementation (v1.9.3):**
1. **Command Deck Loading:** The Command Deck is triggered using `vscode.env.openExternal(url)`. In standard VS Code, this opens the OS default browser. In IDEs like Cursor or VS Code Web, the environment intercepts standard `localhost` links and forces them into an internal IDE tab. The user prefers a dedicated external browser window for the Kanban board.
2. **Passive Agent Invocation:** In v1.9.0, we removed the blocking clipboard-copying wizard and embedded `[!AGENT INSTRUCTION]` blocks natively in the stub markdown files. The hypothesis was that opening the file would cause an active context-aware agent to read the block and initiate the chat automatically. The user reports the chat "just sits there". Current Agent IDE UX (Cursor, Windsurf, Copilot) does not reliably support *passive* autonomous triggers upon file open; they require an explicit user prompt to enter the run loop.

## 2. Gap Analysis & Proposed Direction

### Gap 1: Browser Launch is Intercepted
* **Proposed Fix:** Bypass VS Code's `openExternal` API abstraction entirely. Use Node's built-in `child_process.exec` to execute native OS commands (`open` on Mac, `start` on Windows, `xdg-open` on Linux). This forces the OS to handle the URL, breaking it out of Cursor's internal webview trap.

### Gap 2: Agent Fails to Read Stubs Automatically
A pure embedded approach is too passive for current LLM IDE constraints. Returning to the v1.8.0 multi-step blocking wizard with massive clipboard payloads is too heavy. We need a hybrid.
* **Proposed Fix:** Re-introduce a *single, lightweight* clipboard copy during the handoff, acting as a "Trigger Prompt". The heavy, complex derivation instructions stay securely embedded in the `PROJECT_CHARTER.md` and `HIGH_LEVEL_PRD.md` `[!AGENT INSTRUCTION]` blocks.
* **UX Flow:** 
  1. The Webview generates the stubs.
  2. The extension silently copies exactly this to the clipboard: `"Please read the [!AGENT INSTRUCTION] block in this file and derive the Project Charter."`
  3. The `showInformationMessage` modal says: *"Your Project Charter is open. We copied a trigger to your clipboard—paste it into your AI agent chat to begin derivation. Launch Command Deck when you are finished."*

## 3. Scoping & Boundaries

**In-Scope:**
- Updating `launchCommandDeck` in `scaffolder.ts` to use `child_process` and `os` for native browser launching.
- Updating `charterWizard.ts` to execute a single `vscode.env.clipboard.writeText` of a small trigger phrase before displaying the final modal.
- Improving the modal CTA string to instruct the user to paste.

**Out-of-Scope:**
- Attempting to use undocumented internal IDE APIs to force the chat panel open programmatically.

## 4. Primitive Review
No new primitives required. We are relying on fundamental Node OS libraries and a refined UX handoff mechanism.
