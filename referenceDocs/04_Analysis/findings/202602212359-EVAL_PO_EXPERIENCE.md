# Evaluation: Product Owner Experience & Observability (v1.15.0)

**Date:** 2026-02-21
**Phase:** 1 (Evaluate)
**Topic:** Enhancing the Product Owner experience by enforcing proactive guidance and increasing agent observability via the Command Deck.

## 1. Research & Current State
The user raised two primary concerns regarding the "Product Owner" experience:
1. **Lack of Proactive Guidance**: When a user first enters the workspace after scaffolding, the agent is passive. It does not proactively offer to refine the generated Strategy documents or start the first development cycle.
2. **Poor Observability (Missing Cards)**: The agent moves so fast that it often skips writing the actual Kanban cards (`state.json`) to the Command Deck. The product owner relies on these cards to slow down, review the scope, and ensure high-quality software development. If the cards aren't written, the deterministic architecture breaks down from a human-review perspective.

## 2. Gap Analysis
* **Command Deck Interaction**: The `EVALUATE.md` template instructs the agent to "Update the Command Deck card," but lacks technical specificity on *how* to do so (i.e., modifying `ops/launch-command-deck/data/state.json` or calling the API). Without explicit pathing, LLMs often assume it's a metaphorical instruction or skip it.
* **Agent Initialization**: There is no instruction in the agent adapters (`.cursorrules`, `CLAUDE.md`, `AGENTS.md`) dictating how the agent should behave upon initial greeting or when the user is undirected.

## 3. Proposed Direction (v1.15.0)

### Fix 1: Explicit Board Observability
* Update `EVALUATE.md` (and the agent adapters) to heavily emphasize **Observability**.
* Be mechanically explicit: Instruct the agent that it must write detailed stories/cards directly to `ops/launch-command-deck/data/state.json` before writing any code. The instruction must clarify that this is for the *Product Owner's observability*.

### Fix 2: Proactive Guidance
* Add a `Product Owner Experience` section to all agent adapters (`.cursorrules`, `CLAUDE.md`, `AGENTS.md`).
* Instruct the agent: "If the user starts a session without a specific request, proactively guide them. Ask if they want to improve their Project Charter / PRD, or if they have an idea to start the first MCD cycle."

By adding these specific rules to the template ecosystem, any agent initialized into an MCD project will actively court the user's input and leave legible, highly observable Kanban cards for every task.
