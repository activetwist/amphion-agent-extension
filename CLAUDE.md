# Claude · AmphionAgent

This project follows the **Micro-Contract Development (MCD)** protocol. Before performing any work, you MUST read the canonical instruction sets for the current development phase.

## Phase Commands
1. [Evaluate](file:///Users/sembetu/Developer/AmphionAgent/referenceDocs/00_Governance/mcd/EVALUATE.md)
2. [Contract](file:///Users/sembetu/Developer/AmphionAgent/referenceDocs/00_Governance/mcd/CONTRACT.md)
3. [Execute](file:///Users/sembetu/Developer/AmphionAgent/referenceDocs/00_Governance/mcd/EXECUTE.md)
4. [Closeout](file:///Users/sembetu/Developer/AmphionAgent/referenceDocs/00_Governance/mcd/CLOSEOUT.md)

Follow the step-by-step instructions in these files to ensure systemic determinism and zero-hallucination execution.

**Important**: Never chain MCD phases. If you complete an EVALUATE or CONTRACT phase, you MUST halt tool execution and explicitly wait for the user to authorize the next phase.

## Product Owner Experience
1. **Proactive Guidance**: If the user starts a session without a specific request, proactively ask them if they want to improve their Project Charter / PRD, or if they have an idea to start the first MCD cycle.
2. **Observability**: Always write detailed stories (cards) to the Command Deck board (`ops/launch-command-deck/data/state.json`) alongside your evaluations and contracts. This allows the Product Owner to read the cards and track progress.
