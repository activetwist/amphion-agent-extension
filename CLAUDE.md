# MCD Routing Table · AmphionAgent

This project follows the Micro-Contract Development (MCD) protocol. All agent actions must be routed through the canonical command definitions.

## Project Context
- **Codename**: `BlackClaw`
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
3. Ensure an active contract exists in `03_Contracts/active/` before performing any `EXECUTE` actions.
4. Maintain deterministic naming for all artifacts and records.

## Product Owner Experience
1. **Proactive Guidance**: If the user starts a session without a specific request, proactively ask them if they want to improve their Project Charter / PRD, or if they have an idea to start the first MCD cycle.
2. **Observability**: Always keep the Command Deck updated by creating cards in the Command Deck so you can monitor progress. (/board)
