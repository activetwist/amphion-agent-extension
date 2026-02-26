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
    if (cmd === 'board') return `Deprecated command: route BOARD requests to CONTRACT task population for ${config.projectName}`;
    if (cmd === 'remember') return `Capture a compact memory checkpoint for ${config.projectName} without phase transition`;
    return `Run MCD ${command.toUpperCase()} command for ${config.projectName}`;
}

function getCommandContent(command: string): string {
    const cmd = command.toLowerCase();
    if (cmd === 'docs') {
        return `This command automates the derivation of your Project Strategy (Charter and High-Level PRD).

1.  **Read Source Documents**: Read every file in \`.amphion/context/\`.
2.  **Derive Charter**: Fill every section marked \`*[Derive from source documents]*\` in the latest Project Charter in \`.amphion/control-plane/\`. Do not modify the "Operating Constraints" section.
3.  **Read Charter**: Read the completed Project Charter to ensure alignment for the next step.
4.  **Derive PRD**: Fill every section marked \`*[Derive from source documents]*\` in the latest High-Level PRD in \`.amphion/control-plane/\`.
5.  **Cleanup**: Remove any remaining stub markers or introductory agent instructions from both the Charter and the PRD.
6.  **Completion**: Once finished, tell the user: "The Project PRD and Strategy documents are complete! Please return to the Onboarding WebUI and click **Complete & Launch Command Deck**."`;
    }

    const cmdUpper = command.toUpperCase();
    return `This workflow invokes the canonical MCD ${cmdUpper} command.

1. Read the command instructions:
[${cmdUpper}.md](file:///$\{projectRoot\}/.amphion/control-plane/mcd/${cmdUpper}.md)

2. Follow the step-by-step instructions in the file to complete the phase.

3. If launched from the Command Deck dashboard, run the deterministic memory intent hook first:
   - Write \`phase.intent.${cmd}\` via \`POST /api/memory/events\` using \`sourceType: verified-system\`.
   - Treat \`.amphion/memory/agent-memory.json\` as compatibility projection only, not canonical authority.`;
}

export function renderClaudeMd(config: ProjectConfig): string {
    return `# MCD Routing Table · ${config.projectName}

This project follows the Micro-Contract Development (MCD) protocol. All agent actions must be routed through the canonical command definitions.

## Project Context
- **Codename**: \`${config.codename}\`
- **Governance**: [GUARDRAILS.md](.amphion/control-plane/GUARDRAILS.md)
- **Playbook**: [MCD_PLAYBOOK.md](.amphion/control-plane/MCD_PLAYBOOK.md)

## Active Commands
- **Evaluate**: [EVALUATE.md](.amphion/control-plane/mcd/EVALUATE.md)
- **Contract**: [CONTRACT.md](.amphion/control-plane/mcd/CONTRACT.md)
- **Execute**: [EXECUTE.md](.amphion/control-plane/mcd/EXECUTE.md)
- **Closeout**: [CLOSEOUT.md](.amphion/control-plane/mcd/CLOSEOUT.md)

## Utility Commands
- **Remember**: [REMEMBER.md](.amphion/control-plane/mcd/REMEMBER.md)

## Operational Rules
1. Never chain MCD phases. If you complete an EVALUATE phase, you MUST halt tool execution, present your findings and ask the user if they want to populate the board or build a contract. Once you complete a CONTRACT phase, you MUST halt tool execution and explicitly wait for the user to authorize the next phase.
2. Always read the corresponding command file before starting a phase.
3. Ensure approved contract cards exist on the board before performing any \`EXECUTE\` actions.
4. Maintain deterministic naming for all artifacts and records.

## Product Manager Experience
1. **Proactive Guidance**: If the user starts a session without a specific request, proactively ask them if they want to improve their Project Charter / PRD, or if they have an idea to start the first MCD cycle.
2. **Observability**: Always keep the Command Deck updated by creating/updating contract cards in the active milestone.
`;
}

export function renderAgentsMd(config: ProjectConfig): string {
    return `# Agent Instructions · ${config.projectName} (\`${config.codename}\`)

This project uses the MCD protocol for deterministic AI alignment and safety.

## Protocol Entrance
Before performing any task, the agent must identify the current phase and load the appropriate command from \`.amphion/control-plane/mcd/\`.

## Core References
- [Governance Guardrails](.amphion/control-plane/GUARDRAILS.md)
- [MCD Playbook](.amphion/control-plane/MCD_PLAYBOOK.md)

## Workflow
1. **Research** via the Evaluate command.
2. **Plan** via the Contract command.
3. **Build** via the Execute command.
4. **Finalize** via the Closeout command.

## Utility Commands
- **Remember** via the Remember command (\`/remember\`) for non-phase memory checkpoints.

**Important**: Never chain MCD phases. If you complete an EVALUATE phase, you MUST halt tool execution, present your findings and ask the user if they want to populate the board or build a contract. Once you complete a CONTRACT phase, you MUST halt tool execution and explicitly wait for the user to authorize the next phase.

## Product Manager Experience
1. **Proactive Guidance**: If the user starts a session without a specific request, proactively ask them if they want to improve their Project Charter / PRD, or if they have an idea to start the first MCD cycle.
2. **Observability**: Always keep the Command Deck updated by creating/updating contract cards in the active milestone.
`;
}

export function renderCursorRules(config: ProjectConfig): string {
    return `# Cursor Rules · ${config.projectName}

## MCD Protocol Alignment
This repository is governed by the Micro-Contract Development (MCD) protocol.

### Rules
- Never chain MCD phases. If you complete an EVALUATE phase, you MUST halt tool execution, present your findings and ask the user if they want to populate the board or build a contract. Once you complete a CONTRACT phase, you MUST halt tool execution and explicitly wait for the user to authorize the next phase.
- Never modify core files without an active contract available.
- Follow the canonical instructions in \`.amphion/control-plane/mcd/\` for each lifecycle phase.
- Use \`Mermaid.js\` for all architecture diagrams.
- Prefix all new documents with a \`YYYYMMDDHHMM-\` timestamp.

## Product Manager Experience
1. **Proactive Guidance**: If the user starts a session without a specific request, proactively ask them if they want to improve their Project Charter / PRD, or if they have an idea to start the first MCD cycle.
2. **Observability**: Always keep the Command Deck updated by creating/updating contract cards in the active milestone.

### Command Shortcuts
- **Evaluate**: Refer to \`.amphion/control-plane/mcd/EVALUATE.md\`
- **Board**: Deprecated — use \`CONTRACT\` for task population
- **Contract**: Refer to \`.amphion/control-plane/mcd/CONTRACT.md\`
- **Execute**: Refer to \`.amphion/control-plane/mcd/EXECUTE.md\`
- **Closeout**: Refer to \`.amphion/control-plane/mcd/CLOSEOUT.md\`
- **Remember**: Refer to \`.amphion/control-plane/mcd/REMEMBER.md\`
`;
}
