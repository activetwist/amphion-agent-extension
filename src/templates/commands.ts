import { ProjectConfig } from '../wizard';

export function renderEvaluate(config: ProjectConfig): string {
    return `# EVALUATE · ${config.projectName}

**Phase:** 1 (Research & Scoping)
**Status:** Canonical Instruction Set
**Codename:** \`${config.codename}\`

## When to Use
Invoke this command when starting a new milestone, feature, or complex bug fix. This phase is for understanding the "Why" and "What" before deciding "How".

## Inputs
- [ ] Project Charter
- [ ] High-Level PRD
- [ ] Current Architecture (Architecture Primitives)
- [ ] Governance Guardrails

## Instructions
1. **Research**: Analyze the codebase and existing documentation relevant to the user request.
2. **Gap Analysis**: Identify what is missing or what needs to change in the current system.
3. **Scoping**: Define the specific boundaries of the work. What is in-scope? What is strictly out-of-scope?
4. **Primitive Review**: Determine if new Architecture Primitives are required.
5. **Card Update (SQLite/API Canonical)**: Create or update a Kanban card through the live Command Deck runtime (API-backed board state stored in SQLite). Do not use direct \`state.json\` mutation as the authoritative board write path.
6. **Visibility Verification**: Verify the card is visible in active board state (\`/api/state\`) or directly in the board UI before closing Evaluate.
7. **Phase Isolation**: Do not draft the implementation contract during this phase. Scoping must be finalized and cardinality established before planning the 'How'.

**CRITICAL AGENT INSTRUCTION:** After generating the Evaluation Findings and updating the card, you MUST halt execution. Do not proceed to the Contract phase. You must use your environment's user notification tool (e.g., \`notify_user\`, \`ask_user\`) to request explicit permission to proceed.

## Output
- [ ] (Optional) New or revised Architecture Primitives in \`02_Architecture/\`.
- [ ] Research findings documented in \`04_Analysis/findings/\` and presented to the user.
`;
}

export function renderBoard(config: ProjectConfig): string {
    return `# BOARD · ${config.projectName}

**Status:** Deprecated Lifecycle Command
**Codename:** \`${config.codename}\`

## Canonical Change
\`BOARD\` is no longer a first-class lifecycle phase.

Canonical lifecycle:
1. Evaluate
2. Contract
3. Execute
4. Closeout

## Replacement Behavior
Board population is mandatory work embedded in \`CONTRACT\`:
- Create/update sequenced task cards via API/SQLite runtime.
- Bind all cards to active milestones.
- Verify visibility in \`/api/state\` and board UI.

## Operator Guidance
If \`/board\` is invoked, route to \`/contract\` behavior and continue with Contract-based task population.
`;
}

export function renderContract(config: ProjectConfig): string {
    return `# CONTRACT · ${config.projectName}

**Phase:** 2 (Planning & Agreement)
**Status:** Canonical Instruction Set
**Codename:** \`${config.codename}\`

## When to Use
Invoke this command after Evaluation is complete and scope is locked. This phase is for defining the "How" and securing operator approval before execution.

## Inputs
- [ ] Evaluation Findings
- [ ] Locked Acceptance Criteria (on Command Deck)
- [ ] Affected File Paths (AFPs)

## Instructions
1. **Contract Authoring (DB Canonical)**: Draft contract scope directly in milestone/card records (macro contract on milestone, micro-contracts on cards).
2. **Breakdown**: Divide work into sequenced, deterministic cards with sufficient execution detail.
3. **Board Population (Required)**: Create/update task cards through live Command Deck API-backed operations (SQLite canonical store).
4. **Risk Assessment**: identify potential side effects or breaking changes.
5. **AFP Enumeration**: List every file that will be created, modified, or deleted.
6. **Approval**: Present the contract card set to the operator for formal approval.
7. **Trigger-Based Execution**: Generating this contract does NOT authorize execution. Implementation must only begin after explicit operator approval and the invocation of the \`/execute\` command.

**CRITICAL AGENT INSTRUCTION:** After generating the Contract, you MUST halt execution. Do not proceed to the Execute phase. You must use your environment's user notification tool (e.g., \`notify_user\`, \`ask_user\`) to request explicit permission to proceed.

## Output
- [ ] Approved contract card set on board (milestone-bound, sequenced).
- [ ] Contract context stored canonically in DB-backed milestone/card records.
`;
}

export function renderExecute(config: ProjectConfig): string {
    return `# EXECUTE · ${config.projectName}

**Phase:** 3 (Implementation & Verification)
**Status:** Canonical Instruction Set
**Codename:** \`${config.codename}\`

## When to Use
Invoke this command ONLY when approved contract cards exist on the board for the active milestone.

## Inputs
- [ ] Approved Contract Cards
- [ ] Current Repository State
- [ ] Test Harness / Environment

## Instructions
1. **Implementation**: Execute the changes exactly as authorized by the contract. Do not deviate from the Approved AFPs.
2. **Verification**: Run all automated tests and perform manual validation as defined in the contract's Verification Plan.
3. **Iteration**: Fix bugs discovered during verification. If a fundamental design change is needed, stop and return to the Contract phase.
4. **Documentation**: Record outcomes and build details in milestone/card DB artifacts, and write local files only when explicitly required by tooling.

## Output
- [ ] Verified implementation matching all acceptance criteria.
- [ ] Card status + milestone context updated to reflect execution outcome.
`;
}

export function renderRemember(config: ProjectConfig): string {
    return `# REMEMBER · ${config.projectName}

**Type:** Utility Command (Non-Phase)
**Status:** Canonical Instruction Set
**Codename:** \`${config.codename}\`

## When to Use
Use this command to capture a compact memory checkpoint without changing lifecycle phase.

## Inputs
- [ ] Current contract context (if any)
- [ ] Durable decisions/troubleshooting outcomes worth preserving
- [ ] Current milestone/slice identifier

## Instructions
1. **Resolve Board Context**: Use active board context (or explicit \`boardId\`) as memory scope authority.
2. **Write Memory Events**: Record checkpoint facts via \`POST /api/memory/events\` with attested \`sourceType\` (\`user\`, \`operator\`, \`verified-system\`) and deterministic \`memoryKey\`.
3. **Materialized State Check**: Validate checkpoint presence via \`GET /api/memory/state\` or \`GET /api/memory/query\`.
4. **Compaction Control**: If needed, run \`POST /api/memory/compact\` to enforce bounded memory budgets.
5. **Compatibility Export (Optional)**: Produce \`.amphion/memory/agent-memory.json\` using \`POST /api/memory/export\` when downstream tooling expects file-based snapshot.
6. **No Phase Transition**: Confirm checkpoint completion and remain in current lifecycle phase.

## Guardrails
- \`/remember\` is utility-only and cannot replace Evaluate/Contract/Execute/Closeout.
- Canonical write boundary is \`/api/memory/*\` routes; avoid direct SQL mutation as standard workflow.
- Do not include long prose; use short slug-like entries.
- Do not write speculative or unverified facts into memory.

## Output
- [ ] Memory event(s) recorded in SQLite authority via \`/api/memory/events\`.
- [ ] Memory state verification evidence (\`/api/memory/state\` or \`/api/memory/query\`).
- [ ] Optional compatibility export updated at \`.amphion/memory/agent-memory.json\` (when required).
- [ ] Brief user-facing confirmation that memory checkpoint was recorded.
`;
}

export function renderCloseout(config: ProjectConfig): string {
    return `# CLOSEOUT · ${config.projectName}

**Phase:** 4 (Archiving & Release)
**Status:** Canonical Instruction Set
**Codename:** \`${config.codename}\`

## When to Use
Invoke this command when all contracted work for a version is verified and complete.

## Inputs
- [ ] All executed contracts for the version.
- [ ] Build Logs & Verification results.
- [ ] Final Repository State.
- [ ] DB-backed memory baseline (\`/api/memory/state\`) and optional compatibility export requirement.

## Instructions
1. **Milestone Closeout**: Close/archive the milestone through API, which appends deterministic outcomes artifact (\`outcomes\`) in DB.
2. **Memory Update**: Write closeout memory events through \`/api/memory/events\`, verify via \`/api/memory/state\` or \`/api/memory/query\`, and export compatibility snapshot only when needed.
3. **Validation**: Final check against Governance Guardrails and run closeout hygiene validation scripts from \`.amphion/control-plane\` or runtime tooling when available.
4. **Record Keeping**: Ensure outcomes artifact is complete and provenance is present.
5. **Persistence**: Ensure runtime state and required source edits are committed when applicable.
6. **Versioning**: Tag or finalize version metadata only if explicitly in scope.

## Output
- [ ] Outcomes artifact recorded for milestone closeout in DB.
- [ ] DB-backed memory checkpoint validated (\`/api/memory/*\`) with compatibility export updated when required.
- [ ] Final Git commit using the \`closeout:\` prefix.
`;
}
