# Agent Instructions · Amphion Project (`BLACKCLAW`)

This project uses the MCD protocol for deterministic AI alignment and safety.

## Protocol Entrance
Before performing any task, the agent must identify the current phase and load the appropriate command from `.amphion/control-plane/mcd/`.

## Core References
- [Governance Guardrails](.amphion/control-plane/GUARDRAILS.md)
- [MCD Playbook](.amphion/control-plane/MCD_PLAYBOOK.md)

## Workflow
1. **Research** via the Evaluate command.
2. **Plan** via the Contract command.
3. **Build** via the Execute command.
4. **Finalize** via the Closeout command.

## Utility Commands
- **Remember** via the Remember command (`/remember`) for non-phase memory checkpoints.

**Important**: Never chain MCD phases. If you complete an EVALUATE phase, you MUST halt tool execution, present your findings and ask the user to authorize `/contract`, which must be authored as milestone-bound board cards via DB/API. Once you complete a CONTRACT phase, you MUST halt tool execution and explicitly wait for the user to authorize the next phase.

## Product Manager Experience
1. **Proactive Guidance**: If the user starts a session without a specific request, proactively ask them if they want to improve their Project Charter / PRD, or if they have an idea to start the first MCD cycle.
2. **Observability**: Always keep the Command Deck updated by creating/updating contract cards in the active milestone.
