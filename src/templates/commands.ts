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
- [ ] Target board + milestone context

## Instructions
1. **Research**: Analyze the codebase and existing documentation relevant to the user request.
2. **Gap Analysis**: Identify what is missing or what needs to change in the current system.
3. **Scoping**: Define boundaries. What is in-scope? What is strictly out-of-scope?
4. **Primitive Review**: Determine whether new Architecture Primitives are required.
5. **DB Findings Write (Required)**: Record findings in milestone artifacts via API (\`artifactType: findings\`). Filesystem findings documents are not canonical.
6. **Visibility Verification**: Verify the findings artifact revision and milestone/card visibility in \`/api/state\` or board UI before closing Evaluate.
7. **Phase Isolation**: Do not draft implementation details beyond scoping in this phase.

**CRITICAL AGENT INSTRUCTION:** If board/API runtime is unavailable, halt as **blocked** and request runtime recovery. Do not emit chat text or local files as a substitute for canonical findings artifacts.

**CRITICAL AGENT INSTRUCTION:** After recording findings artifacts and updating board context, halt execution and request explicit \`/contract\` authorization.

## Output
- [ ] Findings artifact recorded in DB milestone artifacts.
- [ ] Scope summary presented to operator with target milestone context.
- [ ] (Optional) New or revised Architecture Primitives.
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
Invoke this command after Evaluate is complete and scope is locked. This phase defines the implementation "How" and secures operator approval before execution.

## Inputs
- [ ] Evaluation findings artifact (DB)
- [ ] Active board context
- [ ] Target milestone (new milestone for net-new work)
- [ ] Affected File Paths (AFPs)

## Instructions
1. **Runtime Gate**: Confirm Command Deck API is reachable and board context resolves.
2. **Blocked Behavior**: If API/board is unavailable, halt as blocked. Do not emit a chat-only or file-only contract as authority.
3. **Macro Contract Metadata**: Populate milestone-level contract metadata (\`metaContract\`, \`goals\`, \`nonGoals\`, \`risks\`).
4. **Micro-Contract Cards (Required)**: Create/update sequenced contract cards on board, each milestone-bound and acceptance-driven.
5. **AFP Enumeration**: Include exact files to be created/modified/deleted in card descriptions/acceptance.
6. **Risk Coverage**: Explicitly capture side effects and failure handling in contract scope.
7. **Approval Handoff**: Present milestone ID + issue-numbered contract cards for formal operator approval.
8. **Trigger-Based Execution**: \`/execute\` may begin only after explicit approval of the board-authored contract set.

**CRITICAL AGENT INSTRUCTION:** Chat summaries are explanatory only. Board/DB contract cards are the sole execution authority.

**CRITICAL AGENT INSTRUCTION:** After contract cards are authored and presented, halt and await explicit \`/execute\` authorization.

## Output
- [ ] Approved, milestone-bound contract card set on board (DB canonical).
- [ ] Milestone contract metadata recorded.
- [ ] Operator-facing summary with milestone ID + issue IDs.
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
5. **No Phase Transition**: Confirm checkpoint completion and remain in current lifecycle phase.

## Guardrails
- \`/remember\` is utility-only and cannot replace Evaluate/Contract/Execute/Closeout.
- Canonical write boundary is \`/api/memory/*\` routes; avoid direct SQL mutation as standard workflow.
- Do not include long prose; use short slug-like entries.
- Do not write speculative or unverified facts into memory.

## Output
- [ ] Memory event(s) recorded in SQLite authority via \`/api/memory/events\`.
- [ ] Memory state verification evidence (\`/api/memory/state\` or \`/api/memory/query\`).
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
- [ ] All executed contracts for the version
- [ ] Verification evidence
- [ ] Final repository state
- [ ] DB-backed memory baseline (\`/api/memory/state\`)

## Instructions
1. **Milestone Closeout**: Close/archive the milestone through API; outcomes artifact is appended in DB.
2. **Memory Update**: Write closeout memory events through \`/api/memory/events\` and verify via \`/api/memory/state\` or \`/api/memory/query\`.
3. **Validation**: Run final governance and hygiene checks.
4. **Record Keeping**: Ensure outcomes artifact provenance is complete.
5. **Persistence**: Commit required source/runtime changes when applicable.
6. **Versioning**: Tag/finalize version metadata only when explicitly in scope.
7. **OpenVSX Handoff Policy**: OpenVSX release is operator-manual via upload. Agents must not run OpenVSX publish flows; report VSIX path/version for operator upload.

## Output
- [ ] Outcomes artifact recorded for milestone closeout in DB.
- [ ] DB-backed memory checkpoint validated (\`/api/memory/*\`).
- [ ] Final Git commit using the \`closeout:\` prefix.
- [ ] OpenVSX manual-upload handoff prepared.
`;
}
