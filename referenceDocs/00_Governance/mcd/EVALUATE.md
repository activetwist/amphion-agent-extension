# EVALUATE · AmphionAgent

**Phase:** 1 (Research & Scoping)
**Status:** Canonical Instruction Set
**Codename:** `BlackClaw`

## When to Use
Invoke this command when starting a new milestone, feature, or complex bug fix. This phase is for understanding the "Why" and "What" before deciding "How".

## Inputs
- [ ] Project Charter
- [ ] High-Level PRD
- [ ] Current Architecture (Architecture Primitives)
- [ ] Governance Guardrails

## Instructions
1. **Research**: Analyze the codebase and existing documentation relevant to the user request.
2. **Gap Analysis**: Identify what is missing or what needs to change in the current system.
3. **Scoping**: Define the specific boundaries of the work. What is in-scope? What is strictly out-of-scope?
4. **Primitive Review**: Determine if new Architecture Primitives are required.
5. **HALT AND PRESENT**: You MUST stop execution here. Present your findings explicitly to the user. Do not write a contract yet.
6. **PROMPT THE USER**: End your message with the exact string: *"Would you like to populate the Command Board or build a contract based on these findings?"*

## Output
- [ ] (Optional) New or revised Architecture Primitives in `02_Architecture/`.
- [ ] Research findings documented in `04_Analysis/findings/` and presented to the user.
