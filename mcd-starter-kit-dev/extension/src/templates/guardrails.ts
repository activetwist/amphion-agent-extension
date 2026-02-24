import { ProjectConfig } from '../wizard';

export function renderGuardrails(config: ProjectConfig): string {
    return `# ${config.projectName} - Governance Guardrails

Codename: \`${config.codename}\`
Initial Version: \`${config.initialVersion}\`

## Execution Model
All work follows this strict sequence:
1. Evaluate
2. Board (Optional)
3. Contract
4. Execute
5. Closeout

No phase skipping is permitted.

## Phase Rules
### 1) Evaluate
- Define objective, scope, constraints, and assumptions.
- Do not produce implementation code in this phase.
- Capture risks and unknowns before committing execution steps.

### 2) Contract
- Create or reference an explicit contract before modifying core files.
- Contracts must include acceptance criteria and affected file paths.
- If a request conflicts with an active contract, stop and flag the conflict.

### 3) Execute
- Implement only what the active contract authorizes.
- Keep versioning and build naming deterministic.
- Record meaningful changes and outcomes in project records.

## Utility Commands
Utility commands can run between lifecycle phases but never replace phase transitions.

### \`/remember\` (Utility-Only)
- \`/remember\` is a manual checkpoint command, not a lifecycle phase.
- Purpose: update compact operational memory in \`referenceDocs/06_AgentMemory/agent-memory.json\`.
- Allowed triggers:
  - Long sessions where context continuity risk increases.
  - Material scope changes under approved contracts.
  - Durable troubleshooting breakthroughs and architecture/runtime decisions.
- Mandatory trigger:
  - Closeout completion for a version/slice.
- Guardrail: \`/remember\` must not auto-advance the lifecycle or execute code changes by itself.

## Agent Memory Policy
- Canonical memory directory: \`referenceDocs/06_AgentMemory/\`
- Canonical memory file: \`referenceDocs/06_AgentMemory/agent-memory.json\`
- Memory model: compact bounded snapshot with rolling \`hist\` context window.
- Memory updates must remain concise, deduplicated, and constrained by documented caps.
- Human-readable records in \`05_Records/\` remain the source for detailed narrative evidence.

## Closeout Procedure
Closeout is a governed step that follows the completion of all contracted work within a version. A version is not considered closed until all of the following are satisfied:

### Closeout Requirements
1. **Contracts resolved**: All active contracts have been executed and archived to \`03_Contracts/archive/\`.
2. **Compliance verified**: The compliance checklist below has been reviewed and all items pass.
3. **Closeout record written**: A closeout record has been created in \`05_Records/\` documenting contracts executed, deliverables produced, and compliance status.
4. **Artifacts staged**: All generated artifacts are present and accounted for, including:
   - Updated strategy/architecture/governance documents
   - Agent memory artifact (\`referenceDocs/06_AgentMemory/agent-memory.json\`)
   - Build logs (\`05_Records/buildLogs/\`)
   - Chat logs (\`05_Records/chatLogs/\`)
   - Closeout record (\`05_Records/\`)
5. **Git commit**: A commit must be made with all artifacts staged. No version closeout is valid without a committed state.

### Commit Message Format
Closeout commits must follow this deterministic format:

\`\`\`
closeout: {VERSION} {brief description}
\`\`\`

The commit body should list contracts executed, files changed, and any notable decisions.

## Document Naming Convention
All project documents must be prefixed with a creation/revision timestamp in the following format:

\`\`\`
YYYYMMDDHHMM-[DOCUMENT_TITLE].md
\`\`\`

- \`YYYY\`: Four-digit year
- \`MM\`: Two-digit month
- \`DD\`: Two-digit day
- \`HH\`: Two-digit hour (24-hour format)
- \`MM\`: Two-digit minute

This convention applies to all documents across all reference directories (Governance, Strategy, Architecture, Contracts, Records). When a document is substantively revised, it receives a new timestamp prefix reflecting the revision time.

**Exception**: \`GUARDRAILS.md\` retains its basename without timestamp prefix for operator discoverability.

## Documentation Standards
- **Architecture Diagrams**: All system architecture diagrams and flowcharts must be written natively using \`Mermaid.js\` syntax. Visualizing architectures via text allows diagrams to be version-controlled, easily reproducible, and rendered directly within the Command Deck dashboard.

## Change Safety
- Core file modifications require a referenced active contract.
- Uncontracted work must be deferred until contract approval.
- Unexpected repository changes should be surfaced before continuing.

## Compliance Checklist
- [ ] Current phase is explicit.
- [ ] Contract exists for core-file changes.
- [ ] Work matches contract scope.
- [ ] Naming/versioning remains deterministic.
- [ ] Document naming convention followed (YYYYMMDDHHMM prefix).
- [ ] Conflicts with active contracts have been flagged.
- [ ] Agent memory updated and validated (\`referenceDocs/06_AgentMemory/agent-memory.json\`) when applicable.
- [ ] Closeout record exists (when closing a version).
- [ ] Git commit completed with all artifacts staged (when closing a version).
`;
}
