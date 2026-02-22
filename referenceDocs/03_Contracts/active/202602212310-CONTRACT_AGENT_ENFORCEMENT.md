# Contract: CT-034 Agent State Enforcement (v1.14.0)

**Objective**: 
Enforce strict execution halting and user approval gates within the MCD canonical commands to prevent the AI agent from skipping phases or executing without explicit permission.

**Context**: 
The `EVALUATE.md` and `CONTRACT.md` templates currently use human-readable instructions like "present the contract for approval." Autonomous agents interpret this literally by saving the file to disc ("presenting" it) and immediately proceeding to execute the next tool in sequence. To enforce the MCD methodology, the templates must explicitly instruct the agent to halt its tool loop and use a user-notification mechanism to await permission. 

**Proposed Changes**:
1. **`src/templates/commands.ts`**:
   - Update `renderEvaluate()`: Add an explicit directive in the "Instructions" section: `CRITICAL AGENT INSTRUCTION: After generating the Evaluation Findings and updating the card, you MUST halt execution. Do not proceed to the Contract phase. You must use your environment's user notification tool (e.g., \`notify_user\`, \`ask_user\`) to request explicit permission to proceed.`
   - Update `renderContract()`: Add an explicit directive in the "Approval" step: `CRITICAL AGENT INSTRUCTION: After generating the Contract, you MUST halt execution. Do not proceed to the Execute phase. You must use your environment's user notification tool (e.g., \`notify_user\`, \`ask_user\`) to request explicit permission to proceed.`

2. **`src/templates/adapters.ts`**:
   - Update `renderCursorRules()`: Add an overarching rule under `### Rules`: `Never chain MCD phases. If you complete an EVALUATE or CONTRACT phase, you MUST halt tool execution and explicitly wait for the user to authorize the next phase.`
   - Update `renderClaudeMd()`: Add an overarching rule under `## Operational Rules`: `Never chain MCD phases. If you complete an EVALUATE or CONTRACT phase, you MUST halt tool execution and explicitly wait for the user to authorize the next phase.`
   - Update `renderAgentsMd()`: Add an overarching rule under `## Workflow`: `Never chain MCD phases. If you complete an EVALUATE or CONTRACT phase, you MUST halt tool execution and explicitly wait for the user to authorize the next phase.`

3. **Current Workspace Compliance**:
   - Apply the new agent rules directly to the `.cursorrules`, `CLAUDE.md`, and `AGENTS.md` files in the host `/AmphionAgent` repository so that this agent strictly abides by them immediately.

**Acceptance Criteria**:
- The scaffolded command reference documents and agent adapter documents explicitly instruct the agent to pause execution.
- The active repository (`/AmphionAgent`) is updated with the same constraints so that future steps reliably pause for approval.
