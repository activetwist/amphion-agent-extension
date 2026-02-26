export function getPlaybookContent(): string {
    return `# The Micro-Contract Development (MCD) Playbook: Operator's Guide

Welcome directly to the **Command Deck**. This platform operates on the Micro-Contract Development (MCD) methodology. MCD is designed for solo operators working alongside advanced AI agents in modern IDEs like Windsurf and Cursor.

The core philosophy is **Deterministic Versioning**: zero hallucination, zero scope creep, and total traceability. Every line of code written must be explicitly authorized by a text-based contract, and AI agents are structurally barred from chaining operations together without operator consent.

## The "Halt and Prompt" Safety Rail
The most critical rule of the MCD protocol is **Halt and Prompt**.
An AI agent executing a phase (like Evaluate or Contract) is strictly forbidden from automatically starting the next phase. Once a phase's outputs are generated, the agent MUST explicitly halt tool execution, present the results to the human Operator, and prompt the user for the next Slash Command. This prevents runaway agent logic and guarantees the human is always the supreme arbiter of state.

---

## The 4-Phase Sequence & IDE Slash Commands
To utilize the MCD protocol, the human Operator guides the AI through these discrete phases using explicit Slash Commands in the IDE chat interface:

### 1. \`@[/evaluate]\`
*Understand before building.*
- **Action**: Assess the current state of the application, read related documentation, and write a formal evaluation determining what needs to be built or fixed.
- **Output**: A new markdown file in \`04_Analysis/findings/\`.
- **Rule**: Absolutely no project code is modified during Evaluation.

### 2. \`@[/contract]\`
*Authorize the work.*
- **Action**: Drafts binding contract scope and sequenced micro-contract cards in the Command Deck API-backed board runtime.
- **Output**: Milestone/card contract records with deterministic issue sequencing and acceptance criteria.
- **Rule**: The operator must grant approval before the agent proceeds to Execution.

### 3. \`@[/execute]\`
*Build to specification.*
- **Action**: The AI modifies the Approved File Paths (AFPs) exactly as defined in the active contract.
- **Rule**: If a roadblock occurs that requires changing the *scope* of the contract, the execute phase halts immediately. A new contract must be evaluated and authorized.

### 4. \`@[/closeout]\`
*Formalize the release.*
- **Action**: Verifies acceptance criteria, closes/archives the milestone, appends outcomes artifact, and commits code when applicable.
- **Output**: 
  1. Outcomes artifact appended to milestone records in DB.
  2. Milestone archived/closed in board runtime.
  3. Updated DB-backed memory state via \`/api/memory/*\` with optional compatibility projection (\`.amphion/memory/agent-memory.json\`).
  4. Strict \`closeout: {description}\` Git Commit.

---

## Utility Command: \`@[/remember]\`
\`/remember\` is a utility checkpoint, not a lifecycle phase.

- **Purpose**: Manually capture compact operational context into DB-backed memory authority (\`amphion.db\`) through \`/api/memory/*\`, with optional compatibility projection.
- **When to Use**:
  1. Long sessions where context continuity is at risk.
  2. Material scope shifts under approved contracts.
  3. Durable troubleshooting/architecture decisions worth preserving.
- **Mandatory Use**: At closeout completion for each completed version/slice.
- **Rule**: \`/remember\` does not auto-transition phases and does not authorize code changes by itself.

---

## Core Operational Rules (\`GUARDRAILS.md\`)
1. **Local Only**: MCD runs locally. No cloud dependencies or unprompted package manager usage.
2. **Mermaid.js Required**: All systemic architecture documents utilize Mermaid.js syntax for version-controllable diagrams.
3. **Immutability**: Once a contract is archived or a closeout record is spun down, it cannot be edited. Remediating errors requires an entirely fresh Evaluation -> Contract pipeline.
`;
}
