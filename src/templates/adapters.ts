import { ProjectConfig } from '../wizard';

interface ApiPolicyOptions {
    headingLevel?: number;
    includeContextWindows?: boolean;
}

function renderCommandDeckApiPolicy(options?: ApiPolicyOptions): string {
    const requestedHeading = options?.headingLevel ?? 2;
    const headingLevel = Number.isInteger(requestedHeading)
        ? Math.min(6, Math.max(1, requestedHeading))
        : 2;
    const heading = `${'#'.repeat(headingLevel)} Command Deck API`;
    const contextWindows = options?.includeContextWindows ?? true;
    const contextWindowSection = contextWindows ? `
## Discrete Context Windows

Each MCD contract card is a discrete context window. Treat each card as an isolated task.

**Task start (fresh session):**
1. \`GET /api/find\` (or \`GET /api/state\`) to resolve active board + milestone.
2. \`GET /api/memory/query?key=task.{issueNumber}.handoff\` to load prior handoff state if it exists.
3. \`GET /api/conventions?intent={entityType}\` to validate payload schema before writes.

**Task completion (before ending session):**
\`\`\`
POST /api/memory/events
{
  "memoryKey": "task.{issueNumber}.handoff",
  "eventType": "upsert",
  "sourceType": "verified-system",
  "bucket": "ref",
  "ttlSeconds": 604800,
  "value": {
    "issueNumber": "...",
    "cardTitle": "...",
    "completedAt": "...",
    "outcomeArtifactId": "... or null",
    "summary": "1-2 sentence completion summary",
    "residualNotes": "anything the next session should know"
  }
}
\`\`\`
` : '';

    return `${heading}

**ALL board writes MUST use the Command Deck API. Direct SQLite writes, Python scripts, and filesystem substitutes are non-canonical and violate GUARDRAILS write-boundary policy.**

Resolve API location:
1. Read \`port\` from \`.amphion/config.json\`.
2. If \`port\` is missing/invalid, use default \`8765\`.
3. Base URL is \`http://localhost:{resolvedPort}\`.

Before any write operation:
- Call \`GET /api/conventions?intent={type}\` for the scoped payload schema.
- Valid intents: \`chart\` | \`milestone\` | \`card\` | \`findings\` | \`outcomes\` | \`memory\` | \`board-artifact\`.

For full session orientation:
- Call \`GET /api/conventions\` to load the API operation catalog and schema map.

| Action | Method | Route | Required Fields |
|---|---|---|---|
| Read state | GET | \`/api/state\` | — |
| Find (board map) | GET | \`/api/find\` | — (optional: \`?q=\`, \`?milestoneId=\`, \`?list=\`) |
| Conventions (scoped) | GET | \`/api/conventions?intent={type}\` | — |
| Create chart | POST | \`/api/charts\` | \`boardId\`, \`title\`; opt: \`markdown\`, \`description\` |
| Create milestone | POST | \`/api/milestones\` | \`boardId\`, \`title\`, \`code\` |
| Create card | POST | \`/api/cards\` | \`boardId\`, \`milestoneId\`, \`listId\`, \`title\` |
| Write findings | POST | \`/api/milestones/{id}/artifacts\` | \`boardId\`, \`artifactType:findings\`, \`title\`, \`summary\`, \`body\` |
| Write memory | POST | \`/api/memory/events\` | \`memoryKey\`, \`value\`, \`sourceType\`, \`eventType:upsert\` |
${contextWindowSection}`;
}

function renderCommandDeckApiCommandContent(): string {
    return `Use this command to align agent behavior to the canonical Command Deck API contract before any board write activity.

1. Resolve API base URL from \`.amphion/config.json\`:
   - read \`port\`
   - if missing/invalid, use \`8765\`
   - base URL \`http://localhost:{resolvedPort}\`
2. Call \`GET /api/conventions\` for the operation catalog.
3. Call \`GET /api/conventions?intent={type}\` for every entity write.
4. Resolve board context with \`GET /api/find\` (or \`GET /api/state\`).
5. Perform writes only through canonical API routes. Never write SQLite/files directly.

${renderCommandDeckApiPolicy({ headingLevel: 2, includeContextWindows: true })}`;
}

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
    if (cmd === 'command-deck-api') return `Resolve Command Deck API contract and schema conventions for ${config.projectName}`;
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
    if (cmd === 'command-deck-api') {
        return renderCommandDeckApiCommandContent();
    }

    const cmdUpper = command.toUpperCase();
    return `This workflow invokes the canonical MCD ${cmdUpper} command.

1. Read the command instructions:
[${cmdUpper}.md](file:///$\{projectRoot\}/.amphion/control-plane/mcd/${cmdUpper}.md)

2. Follow the step-by-step instructions in the file to complete the phase.

3. If launched from the Command Deck dashboard, run the deterministic memory intent hook first:
   - Write \`phase.intent.${cmd}\` via \`POST /api/memory/events\` using \`sourceType: verified-system\`.`;
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
1. Never chain MCD phases. If you complete an EVALUATE phase, you MUST halt tool execution, present your findings and ask the user to authorize \`/contract\`, which must be authored as milestone-bound board cards via DB/API. Once you complete a CONTRACT phase, you MUST halt tool execution and explicitly wait for the user to authorize the next phase.
2. Always read the corresponding command file before starting a phase.
3. Ensure approved contract cards exist on the board before performing any \`EXECUTE\` actions.
4. Maintain deterministic naming for all artifacts and records.

${renderCommandDeckApiPolicy({ headingLevel: 2, includeContextWindows: true })}

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

**Important**: Never chain MCD phases. If you complete an EVALUATE phase, you MUST halt tool execution, present your findings and ask the user to authorize \`/contract\`, which must be authored as milestone-bound board cards via DB/API. Once you complete a CONTRACT phase, you MUST halt tool execution and explicitly wait for the user to authorize the next phase.

## Product Manager Experience
1. **Proactive Guidance**: If the user starts a session without a specific request, proactively ask them if they want to improve their Project Charter / PRD, or if they have an idea to start the first MCD cycle.
2. **Observability**: Always keep the Command Deck updated by creating/updating contract cards in the active milestone.

${renderCommandDeckApiPolicy({ headingLevel: 2, includeContextWindows: true })}
`;
}

export function renderCursorRules(config: ProjectConfig): string {
    return `# Cursor Rules · ${config.projectName}

## MCD Protocol Alignment
This repository is governed by the Micro-Contract Development (MCD) protocol.

### Rules
- Never chain MCD phases. If you complete an EVALUATE phase, you MUST halt tool execution, present your findings and ask the user to authorize \`/contract\`, which must be authored as milestone-bound board cards via DB/API. Once you complete a CONTRACT phase, you MUST halt tool execution and explicitly wait for the user to authorize the next phase.
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
- **Bug**: Refer to \`.amphion/control-plane/mcd/BUG.md\`
- **Test**: Refer to \`.amphion/control-plane/mcd/TEST.md\`

${renderCommandDeckApiPolicy({ headingLevel: 2, includeContextWindows: true })}
`;
}

export function renderClineRules(config: ProjectConfig): string {
    return renderCursorRules(config).replace('# Cursor Rules', '# Cline Rules');
}
