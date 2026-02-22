# EVALUATE: MCD Playbook Revision (v1.25.0 Alignment)

## 1. Research & Analysis
The user requested an evaluation of `referenceDocs/00_Governance/MCD_PLAYBOOK.md` to ensure it accurately explains how to operate the Command Deck environment using the newly implemented slash-command rails (`/evaluate`, `/board`, `/contract`, `/execute`, `/closeout`).

**Findings:**
1. **Outdated Phase Structure**: The current `MCD_PLAYBOOK.md` documents an older 4-phase lifecycle. It is missing the pivotal `1.5 - Board Population` phase which orchestrates the generation of task cards in `state.json`.
2. **Missing IDE Integration Details**: The playbook explicitly mentions "working with advanced AI agents" but lacks any instruction on *how* to invoke those agents using the modern Windsurf/Cursor slash-command triggers that we recently formalized.
3. **Missing "Halt and Prompt"**: The core safety mechanism of the v1.24.0 ruleset—forcing the agent to drop out of continuous execution to explicitly ask the Product Owner for input before transitioning phases—is entirely absent from the philosophical overview.

## 2. Gap Analysis
The current playbook is functionally inaccurate. A new operator (or a newly spawned AI agent) reading this playbook would not know how to generate cards onto the Command Deck board, nor would they utilize the formalized slash commands to execute deterministic workflows.

## 3. Scoping & Action Plan
**Proposed Architecture: The Modernized Operator's Guide**
We must rewrite `MCD_PLAYBOOK.md` to serve as the definitive "Operator's Guide". The rewrite will focus on three core pillars:

1. **The 'Halt and Prompt' Philosophy**: Explicitly defining the guardrail that prevents AI agents from runaway execution spanning multiple lifecycle phases.
2. **The 5-Phase Slash Command Workflow**:
   - `@[/evaluate]`: Research and Scoping.
   - `@[/board]`: Task definition and visual tracking within the Command Deck UI.
   - `@[/contract]`: Binding the agent to explicitly enumerated Approved File Paths (AFPs).
   - `@[/execute]`: Blind execution of the contract.
   - `@[/closeout]`: Artifact archiving and Git formalization.
3. **The 'Why'**: Explaining *why* the user should use these commands (to enforce deterministic execution, guarantee rollback capabilities, and maintain perfect state tracking on the Command Deck board).

## 4. Primitive Review
No new primitives required. The core `referenceDocs/00_Governance/mcd/` instruction files are already accurate; we are solely rewriting the high-level playbook to map to them.

## 5. Conclusion
**HALT.** Evaluation complete. The playbook rewrite is essential for complete `v1.25.0` orchestration parity. 

*Would you like to build a contract based on these findings so we can draft the new playbook?*
