# CONTRACT: MCD Playbook Revision (v1.25.0)

**Phase:** 2.0 (Contract)
**Status:** Approved
**Date:** 2026-02-22  

## 1. Goal
Completely rewrite the Command Deck's central `MCD_PLAYBOOK.md` to serve as a definitive, modern "Operator's Guide" for the v1.25.0 platform. The new playbook must explicitly instruct operators and AI agents on how to execute the 5-phase deterministic methodology utilizing the integrated IDE Slash Commands, and must heavily emphasize the "Halt and Prompt" execution safety rail.

## 2. Approved AFPs (Approved File Paths)
- `referenceDocs/00_Governance/MCD_PLAYBOOK.md`
- `mcd-starter-kit-dev/extension/assets/referenceDocs/00_Governance/MCD_PLAYBOOK.md`

## 3. Scope Boundaries
- **In Scope:** 
  - Overwriting `MCD_PLAYBOOK.md` with the new 5-stage architectural flow.
  - Defining `@[/evaluate]`, `@[/board]`, `@[/contract]`, `@[/execute]`, and `@[/closeout]` macros.
  - Explaining the underlying philosophy of "Deterministic Versioning".
  - Mirroring the updated playbook into the extension's structural templates so future projects inherit the correct documentation.
- **Out of Scope:** Making functional changes to any Python/Node backends or IDE adapter logic.

## 4. Acceptance Criteria
- [ ] `MCD_PLAYBOOK.md` clearly outlines the 5 explicit phases of the v1.25.0 MCD sequence.
- [ ] The playbook documents the specific IDE `/commands` used to trigger each phase.
- [ ] The playbook explicitly warns against "chaining" phases without operator intervention (the "Halt and Prompt" rule).
- [ ] The new playbook is successfully copied into `mcd-starter-kit-dev/extension/assets/referenceDocs/00_Governance/`.

## 5. Execution Plan
1. See `implementation_plan.md` for the exact markdown replacement content.
