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

## Product Owner Experience
1. **Proactive Guidance**: If the user starts a session without a specific request, proactively ask them if they want to improve their Project Charter / PRD, or if they have an idea to start the first MCD cycle.
2. **Observability**: Always write detailed stories (cards) to the Command Deck board (`ops/launch-command-deck/data/state.json`) alongside your evaluations and contracts. This allows the Product Owner to read the cards and track progress.
