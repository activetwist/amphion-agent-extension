# Contract: CT-035 Product Owner Experience (v1.15.0)

**Objective**: 
Enhance the Product Owner (PO) experience by explicitly instructing agents to proactively guide the user upon initialization and to rigorously write observable Kanban cards to the Command Deck board.

**Context**: 
The rapid execution speed of AI agents means they frequently bypass creating detailed tracking artifacts if not strictly forced to do so. This degrades the PO's ability to observe, verify, and slow down the process to ensure high-quality output. Additionally, newly scaffolded agents lack proactive instructions on how to greet an undirected PO. 

**Proposed Changes**:
1. **`src/templates/commands.ts`**:
   - Update `renderEvaluate()`: Modify step 5 in Instructions: `5. **Card Update**: Create or update a Kanban card in \`ops/launch-command-deck/data/state.json\` with your findings and acceptance criteria to ensure the Product Owner can observe the plan.`

2. **`src/templates/adapters.ts`**:
   - Inject a new `## Product Owner Experience` section into `renderCursorRules()`, `renderClaudeMd()`, and `renderAgentsMd()`.
   - Add instruction: `1. **Proactive Guidance**: If the user starts a session without a specific request, proactively ask them if they want to improve their Project Charter / PRD, or if they have an idea to start the first MCD cycle.`
   - Add instruction: `2. **Observability**: Always write detailed stories (cards) to the Command Deck board (\`ops/launch-command-deck/data/state.json\`) alongside your evaluations and contracts. This allows the Product Owner to read the cards and track progress.`

3. **Current Workspace Compliance**:
   - Apply the new `Product Owner Experience` rules directly to the `.cursorrules`, `CLAUDE.md`, and `AGENTS.md` files in the host `/AmphionAgent` repository so that this agent strictly abides by them immediately.

**Acceptance Criteria**:
- Scaffolded command reference documents and agent adapter documents explicitly instruct the agent to write observable cards and proactively guide the user.
- The active repository (`/AmphionAgent`) is updated with the same constraints so that future steps follow the new PO guidelines.
