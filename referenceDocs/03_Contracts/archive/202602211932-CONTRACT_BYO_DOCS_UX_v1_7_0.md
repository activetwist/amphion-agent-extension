# CONTRACT · BYO Docs Flow UX Improvements (v1.7.0)

**Phase:** 2 (Planning & Agreement)
**Status:** PROPOSED
**Codename:** `BlackClaw`

## Objective
Improve the "Bring Your Own (BYO) Docs" experience by guiding the operator through a sequential prompt-pasting flow. This ensures the AI agent correctly derives strategy documents from source materials and cleans up instructional metadata once finished.

## Proposed Changes

### [Wizard]
- **MODIFY**: `charterWizard.ts` to implement sequential dialogs for Charter and PRD prompts.
- **IMPROVE**: Automated prompt delivery (Sequential InputBoxes for easy copying).

### [Strategy]
- **UPDATE**: `prdStub.ts` template to include systemic cleanup instructions for the AI agent.

### [Metadata]
- **BUMP**: `package.json` to version `1.7.0`.

## Acceptance Criteria
- [ ] User is presented with a Charter prompt dialog after importing source docs.
- [ ] User is presented with a PRD prompt dialog after acknowledging the Charter prompt.
- [ ] The PRD prompt includes the instruction: *"Once the derivation is complete, review both this PRD and the Project Charter to remove any introductory instructions, stub markers... ensuring the finalized documents are clean and professional."*
- [ ] Project root remains clean (no new temporary files).
- [ ] Extension builds successfully with zero errors.
