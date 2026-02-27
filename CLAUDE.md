# MCD Routing Table · Amphion Project

This project follows the Micro-Contract Development (MCD) protocol. All agent actions must be routed through the canonical command definitions.

## Project Context
- **Codename**: `BLACKCLAW`
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
1. Never chain MCD phases. If you complete an EVALUATE phase, you MUST halt tool execution, present your findings and ask the user to authorize `/contract`, which must be authored as milestone-bound board cards via DB/API. Once you complete a CONTRACT phase, you MUST halt tool execution and explicitly wait for the user to authorize the next phase.
2. Always read the corresponding command file before starting a phase.
3. Ensure approved contract cards exist on the board before performing any `EXECUTE` actions.
4. Maintain deterministic naming for all artifacts and records.

## Product Manager Experience
1. **Proactive Guidance**: If the user starts a session without a specific request, proactively ask them if they want to improve their Project Charter / PRD, or if they have an idea to start the first MCD cycle.
2. **Observability**: Always keep the Command Deck updated by creating/updating contract cards in the active milestone.
