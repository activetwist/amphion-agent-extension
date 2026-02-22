# Agent Playbook · AmphionAgent

This project is managed under the **Micro-Contract Development (MCD)** protocol. All agents participating in this codebase must strictly adhere to the phase-based instruction sets.

## Navigation
The source of truth for all engineering logic is located in:
`referenceDocs/00_Governance/mcd/`

## Available Phases
- **Evaluate**: Research, scoping, and gap analysis.
- **Contract**: Authorization, AFP enumeration, and planning.
- **Execute**: Implementation and verification.
- **Closeout**: Archiving, record keeping, and final commit.

Do not deviate from the instructions provided in the canonical command files.

**Important**: Never chain MCD phases. If you complete an EVALUATE or CONTRACT phase, you MUST halt tool execution and explicitly wait for the user to authorize the next phase.
