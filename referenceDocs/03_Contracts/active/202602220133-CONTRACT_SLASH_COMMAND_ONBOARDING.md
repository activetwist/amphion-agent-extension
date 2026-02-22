# Contract: CT-041 Slash Command Onboarding Flow (v1.21.0)

**Objective**: 
Eliminate manual prompt copy-pasting during project onboarding by introducing `/charter` and `/prd` slash commands. This creates a high-friction-to-low-friction transition where the agent takes full responsibility for document derivation once source materials are provided.

**Context**: 
Operators currently have to copy massive prompt payloads from the WebUI and paste them to their agent. By embedding these instructions into deterministic slash commands in the project filesystem, we enable a more fluid, conversational onboarding.

**Proposed Changes**:
1. **Slash Workflow Generation**:
   - Create `.agents/workflows/charter.md` and `.agents/workflows/prd.md` during scaffolding.
   - These files contain the logic to read `helperContext/` and populate the respective strategy stubs.
2. **Template Refinement**:
   - Update `PROJECT_CHARTER.md` and `HIGH_LEVEL_PRD.md` templates to be cleaner stubs that reinforce the slash command usage.
3. **WebUI Pivot**:
   - Refactor the Onboarding Webview's handoff screen to be instruction-only ("Type /charter").
   - Remove UI clutter (code blocks, duplicate copy buttons).

**Acceptance Criteria**:
- Scaffolding creates the functional `/charter` and `/prd` workflows.
- WebUI onboarding sequence is simplified and guiding.
- Total document derivation can be performed by the agent without the user needing to copy any prompts from the browser.
