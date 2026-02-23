export function getPlaybookContent(): string {
    return `# The Micro-Contract Development (MCD) Playbook: Operator's Guide

Welcome directly to the **Command Deck**. This platform operates on the Micro-Contract Development (MCD) methodology. MCD is designed for solo operators working alongside advanced AI agents in modern IDEs like Windsurf and Cursor.

The core philosophy is **Deterministic Versioning**: zero hallucination, zero scope creep, and total traceability. Every line of code written must be explicitly authorized by a text-based contract, and AI agents are structurally barred from chaining operations together without operator consent.

## The "Halt and Prompt" Safety Rail
The most critical rule of the MCD protocol is **Halt and Prompt**.
An AI agent executing a phase (like Evaluate or Contract) is strictly forbidden from automatically starting the next phase. Once a phase's outputs are generated, the agent MUST explicitly halt tool execution, present the results to the human Operator, and prompt the user for the next Slash Command. This prevents runaway agent logic and guarantees the human is always the supreme arbiter of state.

---

## The 5-Phase Sequence & IDE Slash Commands
To utilize the MCD protocol, the human Operator guides the AI through these discrete phases using explicit Slash Commands in the IDE chat interface:

### 1. \`@[/evaluate]\`
*Understand before building.*
- **Action**: Assess the current state of the application, read related documentation, and write a formal evaluation determining what needs to be built or fixed.
- **Output**: A new markdown file in \`04_Analysis/findings/\`.
- **Rule**: Absolutely no project code is modified during Evaluation.

### 2. \`@[/board]\`
*Track the work visually.*
- **Action**: Translates the evaluation findings into atomic work units by generating Task Cards inside the local Command Deck database (\`state.json\`).
- **Output**: Distinct task cards bearing \`issueNumber\` badges (e.g., \`AM-042\`) rendered natively inside the Command Deck browser UI.

### 3. \`@[/contract]\`
*Authorize the work.*
- **Action**: Drafts a binding Micro-Contract detailing the exact files to be changed (AFPs), the acceptance criteria, and the scope boundaries.
- **Output**: A timestamped Markdown file in \`03_Contracts/active/\` (e.g., \`202602221500-CONTRACT_FEATURE.md\`).
- **Rule**: The operator must grant approval before the agent proceeds to Execution.

### 4. \`@[/execute]\`
*Build to specification.*
- **Action**: The AI modifies the Approved File Paths (AFPs) exactly as defined in the active contract.
- **Rule**: If a roadblock occurs that requires changing the *scope* of the contract, the execute phase halts immediately. A new contract must be evaluated and authorized.

### 5. \`@[/closeout]\`
*Formalize the release.*
- **Action**: Verifies the acceptance criteria, archives the contract, writes a persistent formal record, and commits the code to the repository.
- **Output**:
  1. Contract moved to \`03_Contracts/archive/\`.
  2. Closeout Record mapped to \`05_Records/\`.
  3. Strict \`closeout: {description}\` Git Commit.

---

## Core Operational Rules (\`GUARDRAILS.md\`)
1. **Local Only**: MCD runs locally. No cloud dependencies or unprompted package manager usage.
2. **Mermaid.js Required**: All systemic architecture documents utilize Mermaid.js syntax for version-controllable diagrams.
3. **Immutability**: Once a contract is archived or a closeout record is spun down, it cannot be edited. Remediating errors requires an entirely fresh Evaluation -> Contract pipeline.
`;
}
