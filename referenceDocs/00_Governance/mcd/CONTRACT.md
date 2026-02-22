# CONTRACT · AmphionAgent

**Phase:** 2 (Planning & Agreement)
**Status:** Canonical Instruction Set
**Codename:** `BlackClaw`

## When to Use
Invoke this command after Evaluation is complete and the user has chosen to build a contract (without populating the board). This phase is for defining the "How" and securing operator approval before execution.

## Inputs
- [ ] Evaluation Findings
- [ ] Affected File Paths (AFPs)

## Instructions
1. **Drafting**: Create a new contract file in `03_Contracts/active/` using the standard MCD template.
2. **Breakdown**: Divide the work into logical, deterministic steps.
3. **Risk Assessment**: identify potential side effects or breaking changes.
4. **AFP Enumeration**: List every file that will be created, modified, or deleted.
5. **Approval**: Present the contract to the operator for formal approval. Let them know they can invoke execution by referencing the new contract name.

## Output
- [ ] Approved Contract file in `03_Contracts/active/`.
- [ ] Implementation Plan artifact created and reviewed.
