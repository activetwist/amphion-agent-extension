# EVALUATE: Help Command Integration

**Phase: 1 (Research & Scoping)**
**Date:** 2026-02-24

## 1. Research & Analysis
- **The Issue:** The system lacks an intuitive, guided help flow post-onboarding. There is no quick reference for users to understand the IDE Extension, the Command Deck, or the MCD methodology.
- **Current State:** The Command Deck Dashboard (`onboardingWebview.ts`/`commandDeckDashboard.ts`) has a "Command Flow" list containing `/evaluate`, `/board`, `/contract`, `/execute`, and `/closeout` that send direct payloads to the Agent Chat using `vscode.commands.executeCommand('workbench.action.chat.open', ...)`.
- **The Goal:** Add a new `/help` command to the Dashboard UI, backed by a `.agents/workflows/help.md` file that directs the agent to offer targeted assistance across three distinct categories.

## 2. Gap Analysis
- `mcd-starter-kit-dev/extension/src/commandDeckDashboard.ts` needs a new `.command-item` HTML node for the `/help` trigger.
- `.agents/workflows/help.md` does not currently exist and needs to be created to capture the specific conversational prompting instructions.

## 3. Scoping Boundaries
**In-Scope:**
- Modifying the Command Flow list in `mcd-starter-kit-dev/extension/src/commandDeckDashboard.ts` to include a new button (e.g., `0. /help` or simply `/help` positioned appropriately).
- Clicking the button will trigger `vscode.postMessage({command: 'openChatInput', text: '/help'})`.
- Creating a new file: `.agents/workflows/help.md`.
- Defining the agent behavior in `help.md`:
  - Instruct the agent to read the workflow.
  - State that the agent will assist the user with three domains: The Extension, The Command Deck, or MCD Methodology.
  - Require the agent to prompt the user with: *"Which of these three things would you like to know more about?"*

**Out-of-Scope:**
- Writing out the massive, exhaustive documentation for all three of those categories *inside* the workflow file right now. (The workflow just establishes the conversational menu).

## 4. Primitive Review
- N/A. No changes to base architecture primitives are necessary.

## 5. Next Steps
Would you like to populate the Command Board or build a contract based on these findings?
