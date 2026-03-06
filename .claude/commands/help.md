---
name: help
description: "Get help with AmphionAgent usage and MCD methodology. Answers are grounded in the canonical help source."
argument-hint: "[question about MCD or AmphionAgent]"
---

This skill invokes the canonical MCD HELP command.

## Instructions

1. **Read the command instructions** at `.amphion/control-plane/mcd/HELP.md`.

2. **Load canonical source**: Read `.amphion/control-plane/MCD_HELP_SOURCE.md` as the primary authority.

3. **Answer the question**: `$ARGUMENTS`
   - Use the canonical help source as the primary authority for MCD and AmphionAgent guidance.
   - If required details are missing, use `.amphion/control-plane/MCD_PLAYBOOK.md` and `.amphion/control-plane/GUARDRAILS.md` as fallback sources.

4. **No side effects**: Do not modify board state, files, or lifecycle phase while serving `/help`.

5. Provide direct, actionable help. Clearly label assumptions.
