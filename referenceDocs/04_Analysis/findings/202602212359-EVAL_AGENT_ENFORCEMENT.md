# Evaluation: Agent State Enforcement (v1.14.0)

**Date:** 2026-02-21
**Phase:** 1 (Evaluate)
**Topic:** Investigating why the AI agent sometimes proceeds through the MCD sequences without explicit user approval.

## 1. Research & Current State

The orchestrator currently provides the following rules to the agent regarding pacing and approval:
*   **MCD Playbook**: "- **Rule**: The operator must approve the contract before the agent proceeds to Execution."
*   **CONTRACT.md**: "5. **Approval**: Present the contract to the operator for formal approval."

These instructions are clear for a human engineer, but highly ambiguous for an autonomous agent executing in a loop. 

## 2. Root Cause Analysis

The current setup suffers from **Lack of Explicit "Halt" Directives mapping to Tool Mechanics**.

Autonomous agents (like Antigravity, Cline, or Cursor's composer) are fundamentally designed to optimize for completion. If given a prompt like "Evaluate and fix this," the agent will chain operations. 
When it reads "Present the contract for approval," it does exactly that—it writes the contract to the file system (presenting it), but because it wasn't explicitly told to *stop the execution loop and await input*, its logic dictates it should immediately proceed to `EXECUTE.md` in the very next tool call to fulfill the overarching user prompt.

It is not "over-zealousness" on the agent's part, but rather a lack of mechanical boundary constraints in our governance files.

## 3. Proposed Direction (v1.14.0)

To achieve strict enforcement of the MCD sequence, we must update the canonical instructions in `mcd-starter-kit-dev` to speak the language of agent tools.

1.  **Update `CONTRACT.md`:** 
    We must add an explicit mechanical instruction instructing the agent *how* to pause. 
    *Example addition:* "CRITICAL AGENT INSTRUCTION: After generating the Contract, you MUST pause execution. Do not proceed to the Execute phase. You must use your environment's user notification tool (e.g., `notify_user`, `ask_user`) to request explicit permission to proceed."
2.  **Update `EVALUATE.md`:** 
    Similar logic should be applied here. After evaluation findings are written, the agent should be explicitly told to halt and await the user command to `CONTRACT`.
3.  **Update `adapters.ts` (`.cursorrules` & `.clinerules`):**
    Inject a global operational rule: "Never chain MCD phases. If you complete an `EVALUATE` or `CONTRACT` phase, you MUST halt tool execution and explicitly wait for the user to authorize the next phase."

By providing these mechanical stops, the agent will reliably break its loop and return control to the operator, ensuring the "Micro-Contract" is actually agreed upon before code is written.
