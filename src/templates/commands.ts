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
5. **Card Update**: Create or update a Kanban card in \`ops/launch-command-deck/data/state.json\` with your findings and acceptance criteria to ensure the Product Owner can observe the plan.

**CRITICAL AGENT INSTRUCTION:** After generating the Evaluation Findings and updating the card, you MUST halt execution. Do not proceed to the Contract phase. You must use your environment's user notification tool (e.g., \`notify_user\`, \`ask_user\`) to request explicit permission to proceed.

## Output
- [ ] (Optional) New or revised Architecture Primitives in \`02_Architecture/\`.
- [ ] Research findings documented in \`04_Analysis/findings/\` and presented to the user.
`;
}

export function renderBoard(config: ProjectConfig): string {
    return `# BOARD · ${config.projectName}

**Phase:** 1.5 (Board Population)
**Status:** Canonical Instruction Set
**Codename:** \`${config.codename}\`

## When to Use
Invoke this command after an Evaluation has been presented, and the user has chosen to populate the Command Board.

## Inputs
- [ ] Evaluation Findings

## Instructions
1. **Drafting**: Create new contract file(s) in \`03_Contracts/active/\` based on the evaluation findings, using the standard MCD template.
2. **Breakdown**: Divide the work into logical, deterministic steps within the contract.
3. **Board Population**: Create corresponding task cards in the Command Deck (\`ops/launch-command-deck/data/state.json\`) for each contract drafted. 
   - Note the parent board's \`codename\` and \`nextIssueNumber\`.
   - On the new card object, assign \`"issueNumber": "{codename}-{00X}"\` where \`00X\` is the zero-padded \`nextIssueNumber\`.
   - Increment the board's \`nextIssueNumber\` by 1 for each new card.
   - Ensure the task cards reference the contract name and include acceptance criteria.
4. **AFP Enumeration**: List every file that will be created, modified, or deleted in the contract.
5. **Approval**: Inform the user that the Command Deck has been populated and the contracts are ready. Tell them they can request execution of a specific issue number or contract name.

## Output
- [ ] Drafted Contract file(s) in \`03_Contracts/active/\`.
- [ ] Populated task cards in the Command Deck.
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
1. **Drafting**: Create a new contract file in \`03_Contracts/active/\` using the standard MCD template.
2. **Breakdown**: Divide the work into logical, deterministic steps.
3. **Risk Assessment**: identify potential side effects or breaking changes.
4. **AFP Enumeration**: List every file that will be created, modified, or deleted.
5. **Approval**: Present the contract to the operator for formal approval.

**CRITICAL AGENT INSTRUCTION:** After generating the Contract, you MUST halt execution. Do not proceed to the Execute phase. You must use your environment's user notification tool (e.g., \`notify_user\`, \`ask_user\`) to request explicit permission to proceed.

## Output
- [ ] Approved Contract file in \`03_Contracts/active/\`.
- [ ] Implementation Plan artifact created and reviewed.
`;
}

export function renderExecute(config: ProjectConfig): string {
    return `# EXECUTE · ${config.projectName}

**Phase:** 3 (Implementation & Verification)
**Status:** Canonical Instruction Set
**Codename:** \`${config.codename}\`

## When to Use
Invoke this command ONLY when an approved contract exists in \`03_Contracts/active/\`.

## Inputs
- [ ] Approved Contract
- [ ] Current Repository State
- [ ] Test Harness / Environment

## Instructions
1. **Implementation**: Execute the changes exactly as authorized by the contract. Do not deviate from the Approved AFPs.
2. **Verification**: Run all automated tests and perform manual validation as defined in the contract's Verification Plan.
3. **Iteration**: Fix bugs discovered during verification. If a fundamental design change is needed, stop and return to the Contract phase.
4. **Documentation**: Record outcomes and build details in \`05_Records/buildLogs/\`.

## Output
- [ ] Verified implementation matching all Acceptance Criteria.
- [ ] Build Log documenting the execution results.
- [ ] Walkthrough artifact demonstrating the completed work.
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
1. **Read Current Memory**: Load \`referenceDocs/06_AgentMemory/agent-memory.json\` if it exists; initialize it if missing.
2. **Capture Snapshot**: Update \`cur\` with concise state (\`st\`, \`ms\`, \`ct\`, \`dec\`, \`trb\`, \`lrn\`, \`nx\`, \`ref\`) and refresh \`upd\` timestamp.
3. **Bounded History**: Push previous \`cur\` into \`hist\` and keep only the latest bounded window (2-3 snapshots).
4. **Density Control**: Keep entries compact, deduplicated, and within documented cap limits.
5. **No Phase Transition**: Confirm checkpoint completion and remain in current lifecycle phase.

## Guardrails
- \`/remember\` is utility-only and cannot replace Evaluate/Board/Contract/Execute/Closeout.
- Do not include long prose; use short slug-like entries.
- Do not write speculative or unverified facts into memory.

## Output
- [ ] Updated \`referenceDocs/06_AgentMemory/agent-memory.json\`.
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
- [ ] \`referenceDocs/06_AgentMemory/agent-memory.json\` baseline (existing or to be initialized).

## Instructions
1. **Archiving**: Move executed contracts from \`03_Contracts/active/\` to \`03_Contracts/archive/\`.
2. **Memory Update**: Update compact operational memory in \`referenceDocs/06_AgentMemory/agent-memory.json\`.
3. **Validation**: Final check against Governance Guardrails and run closeout hygiene validation (\`referenceDocs/04_Analysis/scripts/validate_closeout_hygiene.py\` when available).
4. **Record Keeping**: Write a formal Closeout Record in \`05_Records/\`.
5. **Persistence**: Ensure all artifacts are staged and committed to the repository.
6. **Versioning**: Tag or finalize the version in \`package.json\` or relevant metadata.

## Output
- [ ] Formal Closeout Record in \`05_Records/\`.
- [ ] Updated \`referenceDocs/06_AgentMemory/agent-memory.json\`.
- [ ] Clean directory state (\`03_Contracts/active/\` is empty).
- [ ] Final Git commit using the \`closeout:\` prefix.
`;
}
