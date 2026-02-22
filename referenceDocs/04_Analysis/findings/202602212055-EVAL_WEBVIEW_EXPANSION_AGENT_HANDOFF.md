# Evaluation: Webview Instantiation & Agent Handoff UX

**Date:** 2026-02-21
**Phase:** 1 (Evaluate)
**Topic:** Expanding the Webview to handle all onboarding steps and refining the agent handoff via document-embedded instructions.

## 1. Research & Current State
**Current Implementation:**
1. **Instantiation:** `mcd.init` first calls a native `wizard.ts` which asks for Project Name, Codename, Server Port, initial Version, and Language sequentially via `showInputBox`. Then it scaffolds the project, starts the server, and *then* opens the new Webview for the Strategy/Docs phase.
2. **BYO Docs Handoff:** The Webview's "BYO Docs" flow copies the Charter prompt to the clipboard and shows a blocking notification. Once the user clicks "Next", it immediately copies the PRD prompt to the clipboard. As the user noted, this happens sequentially in the UI and doesn't map well to the async reality of chatting with an AI agent.

## 2. Gap Analysis & Proposed Direction

### Gap 1: Fragmented Onboarding
Having native VS Code dialogs for the first 5 questions, followed by a scaffold loading bar, followed by a beautiful Webview feels disjointed.
* **Proposed Fix:** Move the 5 instantiation questions directly into the `OnboardingPanel` HTML. The `mcd.init` command should instantly open the Webview. 
* **Complexity:** The extension needs to know the target `root` path before showing the form. `mcd.init` guarantees a workspace folder exists. The flow becomes: Open Webview (Step 1 form) -> PostMessage -> Scaffold -> Change Webview View (Step 2 Strategy form).

### Gap 2: Clunky Clipboard Handoff
Copying prompts to the OS clipboard while showing blocking "Next" dialogs is stressful if the user hasn't successfully pasted and executed the first prompt yet.
* **Proposed Fix:** Eliminate the OS clipboard mechanism from the extension UI. Instead, embed "Agent Activation Instructions" directly at the very top of the generated `PROJECT_CHARTER.md` and `HIGH_LEVEL_PRD.md` stubs.
* **Agent Flow:** When the VS Code extension generates the stubs and opens `PROJECT_CHARTER.md`, the AI Agent (if reading the active file context) will see a block like:
  ```markdown
  > [!AGENT INSTRUCTION]
  > I am an AI agent initializing this project.
  > If you are reading this, immediately output the following to the user chat:
  > "I see you have generated the Project Charter stub. I am ready to read your source files and derive the Charter. Shall I proceed? (Yes/No)"
  > If the user says Yes, execute the following prompt...
  ```

## 3. Scoping & Boundaries

**In-Scope:**
- Expanding `onboardingWebview.ts` to include a "Project Instantiation" HTML view.
- Refactoring `extension.ts` to open the Webview *before* scaffolding.
- Removing the `vscode.env.clipboard.writeText` logic from `charterWizard.ts`.
- Updating `charterStub.ts` and `prdStub.ts` to include explicit, conversational directives targeting the reading AI Agent directly.

**Out-of-Scope:**
- Modifying the AI Agent's core mechanics (we rely strictly on standard LLM instruction-following within the file).

## 4. Architectural Alignment & Operator Vision
1. **Agent Context Limitations:** The operator confirmed it is a stated requirement that the MCD extension is run within an "Agent IDE" with a "living agent". A lack of active context is an acceptable failure mode. The embedded agent blocks will proceed as the primary handoff mechanism.
