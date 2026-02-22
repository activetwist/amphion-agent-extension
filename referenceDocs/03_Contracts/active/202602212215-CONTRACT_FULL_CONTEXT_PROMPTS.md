# Contract: CT-029 Full Context Agent Prompts (v1.11.0)

**Objective**: Pass the complete, deterministic agent derivation instructions (the `[!AGENT INSTRUCTION]` blocks) from the Extension backend to the WebUI frontend, allowing the user to copy and paste the precise commands into their AI chat directly.

**Context**: 
In v1.10.0, the WebUI provides sequential buttons to copy a simple "pointer" prompt that tells the Agent to go read a file to find its instructions. The user noted that since the extension deterministically generates those instructions, we should just provide the exact instruction text directly to the clipboard. This bypasses the need for the agent to autonomously read the file initially, removing a failure vector.

**Proposed Changes**:
1. **`src/templates/charterStub.ts` & `src/templates/prdStub.ts`**:
   - Create and export two new functions: `getCharterAgentInstruction(sourceFiles: string[])` and `getPrdAgentInstruction(sourceFiles: string[])`.
   - Refactor `renderCharterStub` and `renderPrdStub` to use these functions internally to dry up the code and keep the document template identical to the clipboard payload.
2. **`src/charterWizard.ts`**:
   - Call these new functions inside `runSourceDocsPath` and return the complete instructional strings as `charterPrompt` and `prdPrompt` to the Webview.
3. **`src/onboardingWebview.ts`**:
   - Update the CSS for the `<code>` blocks to use `white-space: pre-wrap; word-break: break-word;` and allow vertical scrolling (e.g., `max-height: 200px; overflow-y: auto;`) so the large text blocks fit elegantly in the UI.

**Acceptance Criteria**:
- The WebUI displays the full, multi-line instructions for the Charter and PRD.
- Copying the text places the entire instruction block in the clipboard.
- The `.md` documents still retain the `[!AGENT INSTRUCTION]` block for fallback.
