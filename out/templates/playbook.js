"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
exports.getPlaybookContent = getPlaybookContent;
function getPlaybookContent() {
    return `# The Micro-Contract Development (MCD) Playbook

Welcome to the **Command Deck**. This platform operates on the Micro-Contract Development (MCD) methodology. MCD is designed for solo operators working with advanced AI agents. 

The core philosophy is **Deterministic Versioning**: zero hallucination, zero scope creep, and total traceability. Every line of code written must be explicitly authorized by a text-based contract.

## The 4-Phase Lifecycle

### 1. Evaluate
*Understand before building.*
- **Action**: Assess the current state, read documentation, and write an explicit evaluation of what needs to be built and why.
- **Output**: \`evaluation_findings.md\`
- **Rule**: No code is written during Evaluation. No tests are run unless explicitly needed for the assessment.

### 2. Contract
*Authorize the work.*
- **Action**: Draft a Micro-Contract detailing the exact files to be changed, the goal to be achieved, and the acceptance criteria.
- **Output**: A timestamped Markdown file in \`referenceDocs/03_Contracts/active/\` (e.g., \`202602201400-CONTRACT_FEATURE_NAME.md\`)
- **Rule**: The operator must approve the contract before the agent proceeds to Execution.

### 3. Execute
*Build to specification.*
- **Action**: The agent executes the approved Micro-Contract. Backend logic, frontend UI, or systemic changes are implemented exactly as defined.
- **Rule**: If a roadblock is hit that requires changing the *scope* of the contract, execution stops and the contract is amended (or a new one written).

### 4. Closeout
*Formalize the release.*
- **Action**: Verify the acceptance criteria against the build.
- **Output**: 
  1. Archive the active contract to \`03_Contracts/archive/\`.
  2. Write a Closeout Record in \`05_Records/\` summarizing the finalized state.
  3. Git Commit with all artifacts staged in the format \`closeout: {VERSION} {brief description}\`.
- **Rule**: A version is absolutely not considered closed until the git commit is completely executed.

## Core Rules (\`GUARDRAILS.md\`)
1. **Local Only**: Applies strictly to the Command Deck application. No cloud dependencies, no package managers (NPM, Pip) during runtime. All logic must execute natively on Python 3 or Vanilla JS/HTML/CSS in the browser.
2. **Mermaid.js Required**: All system logic diagrams must be built natively in Markdown using Mermaid.js syntax for version-controllable rendering.
3. **Immutability**: Once a contract is archived or a closeout record is written, it cannot be edited. Errors require a new remediation contract.
`;
}
//# sourceMappingURL=playbook.js.map