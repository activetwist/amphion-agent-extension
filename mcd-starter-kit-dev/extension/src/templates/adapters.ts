import { ProjectConfig } from '../wizard';

export function renderAntigravityWorkflow(phase: string, config: ProjectConfig): string {
    const phaseUpper = phase.toUpperCase();
    return `---
description: Run MCD ${phaseUpper} command for ${config.projectName}
---

# ${phaseUpper}

This workflow invokes the canonical MCD ${phaseUpper} command.

1. Read the command instructions:
[${phaseUpper}.md](file:///$\{projectRoot\}/referenceDocs/00_Governance/mcd/${phaseUpper}.md)

2. Follow the step-by-step instructions in the file to complete the phase.
`;
}

export function renderClaudeMd(config: ProjectConfig): string {
    return `# MCD Routing Table · ${config.projectName}

This project follows the Micro-Contract Development (MCD) protocol. All agent actions must be routed through the canonical command definitions.

## Project Context
- **Codename**: \`${config.codename}\`
- **Governance**: [GUARDRAILS.md](referenceDocs/00_Governance/GUARDRAILS.md)
- **Playbook**: [MCD_PLAYBOOK.md](referenceDocs/00_Governance/MCD_PLAYBOOK.md)

## Active Commands
- **Evaluate**: [EVALUATE.md](referenceDocs/00_Governance/mcd/EVALUATE.md)
- **Contract**: [CONTRACT.md](referenceDocs/00_Governance/mcd/CONTRACT.md)
- **Execute**: [EXECUTE.md](referenceDocs/00_Governance/mcd/EXECUTE.md)
- **Closeout**: [CLOSEOUT.md](referenceDocs/00_Governance/mcd/CLOSEOUT.md)

## Operational Rules
1. Always read the corresponding command file before starting a phase.
2. Ensure an active contract exists in \`03_Contracts/active/\` before performing any \`EXECUTE\` actions.
3. Maintain deterministic naming for all artifacts and records.
`;
}

export function renderAgentsMd(config: ProjectConfig): string {
    return `# Agent Instructions · ${config.projectName} (\`${config.codename}\`)

This project uses the MCD protocol for deterministic AI alignment and safety.

## Protocol Entrance
Before performing any task, the agent must identify the current phase and load the appropriate command from \`referenceDocs/00_Governance/mcd/\`.

## Core References
- [Governance Guardrails](referenceDocs/00_Governance/GUARDRAILS.md)
- [MCD Playbook](referenceDocs/00_Governance/MCD_PLAYBOOK.md)
- [Active Contracts](referenceDocs/03_Contracts/active/)

## Workflow
1. **Research** via the Evaluate command.
2. **Plan** via the Contract command.
3. **Build** via the Execute command.
4. **Finalize** via the Closeout command.
`;
}

export function renderCursorRules(config: ProjectConfig): string {
    return `# Cursor Rules · ${config.projectName}

## MCD Protocol Alignment
This repository is governed by the Micro-Contract Development (MCD) protocol.

### Rules
- Never modify core files without an active contract in \`referenceDocs/03_Contracts/active/\`.
- Follow the canonical instructions in \`referenceDocs/00_Governance/mcd/\` for each lifecycle phase.
- Use \`Mermaid.js\` for all architecture diagrams.
- Prefix all new documents with a \`YYYYMMDDHHMM-\` timestamp.

### Command Shortcuts
- **Evaluate**: Refer to \`referenceDocs/00_Governance/mcd/EVALUATE.md\`
- **Contract**: Refer to \`referenceDocs/00_Governance/mcd/CONTRACT.md\`
- **Execute**: Refer to \`referenceDocs/00_Governance/mcd/EXECUTE.md\`
- **Closeout**: Refer to \`referenceDocs/00_Governance/mcd/CLOSEOUT.md\`
`;
}
