# EVALUATE · {{PROJECT_NAME}}

**Phase:** 1 (Research & Scoping)
**Status:** Canonical Instruction Set
**Codename:** `{{CODENAME}}`

## When to Use
Invoke this command when starting a new milestone, feature, or complex bug fix. This phase is for understanding the "Why" and "What" before deciding "How".

## Inputs
- [ ] Project Charter
- [ ] High-Level PRD
- [ ] Current Architecture (Architecture Primitives)
- [ ] Governance Guardrails
- [ ] Target board + milestone context

## Instructions
1. **Research**: Analyze the codebase and existing documentation relevant to the user request.
2. **Gap Analysis**: Identify what is missing or what needs to change in the current system.
3. **Scoping**: Define boundaries. What is in-scope? What is strictly out-of-scope?
4. **Primitive Review**: Determine whether new Architecture Primitives are required.
5. **DB Findings Write (Required)**: Record findings in milestone artifacts via API (`artifactType: findings`). Filesystem findings documents are not canonical.
6. **Visibility Verification**: Verify the findings artifact revision and milestone/card visibility in `/api/state` or board UI before closing Evaluate.
7. **Phase Isolation**: Do not draft implementation details beyond scoping in this phase.

**CRITICAL AGENT INSTRUCTION:** If board/API runtime is unavailable, halt as **blocked** and request runtime recovery. Do not emit chat text or local files as a substitute for canonical findings artifacts.

**CRITICAL AGENT INSTRUCTION:** After recording findings artifacts and updating board context, halt execution and request explicit `/contract` authorization.

## Output
- [ ] Findings artifact recorded in DB milestone artifacts.
- [ ] Scope summary presented to operator with target milestone context.
- [ ] (Optional) New or revised Architecture Primitives.
