# Contract: CT-031 WebUI Cleanup & Final PRD Handoff (v1.11.2)

**Objective**: Organize the large Agent Handoff prompt payloads into collapsible accordions in the WebUI to reduce visual clutter, and update the PRD derivation prompt to enforce the final step of the onboarding loop.

**Context**: 
With v1.11.0 bringing the full, multi-line agent instructions into the WebUI, the raw prompt strings dominate the visual space. The user requested we hide these behind an accordion so the UI is primarily focused on the action buttons. Additionally, the agent needs to prompt the user to click the final "Complete & Launch Command Deck" button after finishing the High-Level PRD.

**Proposed Changes**:
1. **`src/onboardingWebview.ts`**:
   - Wrap the `<code>` blocks for both `<code id="charter-prompt-display">` and `<code id="prd-prompt-display">` in a native HTML5 `<details>` element.
   - Use a `<summary>` tag with styling (e.g., `cursor: pointer; color: var(--vscode-textLink-foreground); font-size: 12px; margin-bottom: 8px;`) that says "View Prompt Payload".
2. **`src/templates/prdStub.ts`**:
   - In `getPrdAgentInstruction`, append the following instruction block at the end:
     *"Finally, tell the user exactly this: 'The PRD and Strategy documents are complete! Please return to the MCD Onboarding WebUI and click "Complete & Launch Command Deck" to finish the onboarding process.'"*

**Acceptance Criteria**:
- The prompt text blocks in the WebUI are collapsed by default.
- Clicking "View Prompt Payload" expands the block smoothly.
- The derived High-Level PRD instructs the agent to execute a final, clear handoff response back to the WebUI.
