import { ProjectConfig } from '../wizard';

export function renderAntigravityWorkflow(command: string, config: ProjectConfig): string {
    const cmdUpper = command.toUpperCase();
    const description = getCommandDescription(command, config);
    const content = getCommandContent(command);

    return `---
description: ${description}
---

# ${cmdUpper}

${content}
`;
}

export function renderCursorRule(command: string, config: ProjectConfig): string {
    const description = getCommandDescription(command, config);
    const content = getCommandContent(command);

    // .mdc format for Cursor
    return `---
description: ${description}
globs: 
---

${content}
`;
}

export function renderCursorCommand(command: string, config: ProjectConfig): string {
    const content = getCommandContent(command);
    return content;
}

export function renderWindsurfWorkflow(command: string, config: ProjectConfig): string {
    const description = getCommandDescription(command, config);
    const content = getCommandContent(command);

    return `---
description: ${description}
---

${content}
`;
}

function getCommandDescription(command: string, config: ProjectConfig): string {
    const cmd = command.toLowerCase();
    if (cmd === 'docs') return `Generate Project Strategy (Charter & PRD) from source documents for ${config.projectName}`;
    if (cmd === 'board') return `Populate the Command Board and draft contracts based on Evaluate findings for ${config.projectName}`;
    return `Run MCD ${command.toUpperCase()} command for ${config.projectName}`;
}

function getCommandContent(command: string): string {
    const cmd = command.toLowerCase();
    if (cmd === 'docs') {
        return `This command automates the derivation of your Project Strategy (Charter and High-Level PRD).

1.  **Read Source Documents**: Read every file in \`referenceDocs/05_Records/documentation/helperContext/\`.
2.  **Derive Charter**: Fill every section marked \`*[Derive from source documents]*\` in the latest Project Charter in \`referenceDocs/01_Strategy/\`. Do not modify the "Operating Constraints" section.
3.  **Read Charter**: Read the completed Project Charter to ensure alignment for the next step.
4.  **Derive PRD**: Fill every section marked \`*[Derive from source documents]*\` in the latest High-Level PRD in \`referenceDocs/01_Strategy/\`.
5.  **Cleanup**: Remove any remaining stub markers or introductory agent instructions from both the Charter and the PRD.
6.  **Completion**: Once finished, tell the user: "The Project PRD and Strategy documents are complete! Please return to the Onboarding WebUI and click **Complete & Launch Command Deck**."`;
    }

    const cmdUpper = command.toUpperCase();
    return `This workflow invokes the canonical MCD ${cmdUpper} command.

1. Read the command instructions:
[${cmdUpper}.md](file:///$\{projectRoot\}/referenceDocs/00_Governance/mcd/${cmdUpper}.md)

2. Follow the step-by-step instructions in the file to complete the phase.`;
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
- **Board**: [BOARD.md](referenceDocs/00_Governance/mcd/BOARD.md)
- **Contract**: [CONTRACT.md](referenceDocs/00_Governance/mcd/CONTRACT.md)
- **Execute**: [EXECUTE.md](referenceDocs/00_Governance/mcd/EXECUTE.md)
- **Closeout**: [CLOSEOUT.md](referenceDocs/00_Governance/mcd/CLOSEOUT.md)

## Operational Rules
1. Never chain MCD phases. If you complete an EVALUATE phase, you MUST halt tool execution, present your findings and ask the user if they want to populate the board or build a contract. Once you complete a CONTRACT phase, you MUST halt tool execution and explicitly wait for the user to authorize the next phase.
2. Always read the corresponding command file before starting a phase.
3. Ensure an active contract exists in \`03_Contracts/active/\` before performing any \`EXECUTE\` actions.
4. Maintain deterministic naming for all artifacts and records.

## Product Owner Experience
1. **Proactive Guidance**: If the user starts a session without a specific request, proactively ask them if they want to improve their Project Charter / PRD, or if they have an idea to start the first MCD cycle.
2. **Observability**: Always write detailed stories (cards) to the Command Deck board (\`ops/launch-command-deck/data/state.json\`) alongside your evaluations and contracts. This allows the Product Owner to read the cards and track progress.
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
2. **Board** (Optional) via the Board command.
3. **Plan** via the Contract command.
4. **Build** via the Execute command.
5. **Finalize** via the Closeout command.

**Important**: Never chain MCD phases. If you complete an EVALUATE phase, you MUST halt tool execution, present your findings and ask the user if they want to populate the board or build a contract. Once you complete a CONTRACT phase, you MUST halt tool execution and explicitly wait for the user to authorize the next phase.

## Product Owner Experience
1. **Proactive Guidance**: If the user starts a session without a specific request, proactively ask them if they want to improve their Project Charter / PRD, or if they have an idea to start the first MCD cycle.
2. **Observability**: Always write detailed stories (cards) to the Command Deck board (\`ops/launch-command-deck/data/state.json\`) alongside your evaluations and contracts. This allows the Product Owner to read the cards and track progress.
`;
}

export function renderCursorRules(config: ProjectConfig): string {
    return `# Cursor Rules · ${config.projectName}

## MCD Protocol Alignment
This repository is governed by the Micro-Contract Development (MCD) protocol.

### Rules
- Never chain MCD phases. If you complete an EVALUATE phase, you MUST halt tool execution, present your findings and ask the user if they want to populate the board or build a contract. Once you complete a CONTRACT phase, you MUST halt tool execution and explicitly wait for the user to authorize the next phase.
- Never modify core files without an active contract in \`referenceDocs/03_Contracts/active/\`.
- Follow the canonical instructions in \`referenceDocs/00_Governance/mcd/\` for each lifecycle phase.
- Use \`Mermaid.js\` for all architecture diagrams.
- Prefix all new documents with a \`YYYYMMDDHHMM-\` timestamp.

## Product Owner Experience
1. **Proactive Guidance**: If the user starts a session without a specific request, proactively ask them if they want to improve their Project Charter / PRD, or if they have an idea to start the first MCD cycle.
2. **Observability**: Always write detailed stories (cards) to the Command Deck board (\`ops/launch-command-deck/data/state.json\`) alongside your evaluations and contracts. This allows the Product Owner to read the cards and track progress.

### Command Shortcuts
- **Evaluate**: Refer to \`referenceDocs/00_Governance/mcd/EVALUATE.md\`
- **Board**: Refer to \`referenceDocs/00_Governance/mcd/BOARD.md\`
- **Contract**: Refer to \`referenceDocs/00_Governance/mcd/CONTRACT.md\`
- **Execute**: Refer to \`referenceDocs/00_Governance/mcd/EXECUTE.md\`
- **Closeout**: Refer to \`referenceDocs/00_Governance/mcd/CLOSEOUT.md\`
`;
}
