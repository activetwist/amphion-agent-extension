# Agent Instructions · AmphionAgent (`BlackClaw`)

This project uses the MCD protocol for deterministic AI alignment and safety.

## Protocol Entrance
Before performing any task, the agent must identify the current phase and load the appropriate command from `referenceDocs/00_Governance/mcd/`.

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
2. **Observability**: Always keep the Command Deck updated by creating cards in the Command Deck so you can monitor progress. (/board)
