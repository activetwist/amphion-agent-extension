# Evaluate Findings: `/board` Command Missing in Cursor

**Timestamp:** 2026-02-22 17:19 local  
**Phase:** EVALUATE  
**Codename:** `BlackClaw`

## User Request
Confirm why `/board` is not available in this project and ensure the command is available in both:
- this repository's Cursor command surface, and
- the packaged extension scaffolding output.

## Findings
1. **Canonical MCD documentation includes Board**
   - `referenceDocs/00_Governance/mcd/BOARD.md` exists and is valid.
   - Governance/routing files (`.cursorrules`, `AGENTS.md`, `CLAUDE.md`) all reference Board as an active command.

2. **Cursor command surface is missing Board in this repository**
   - `.cursor/rules/` contains: `evaluate.mdc`, `contract.mdc`, `execute.mdc`, `closeout.mdc`, `charter.mdc`, `prd.mdc`.
   - `.cursor/commands/` contains: `evaluate.md`, `contract.md`, `execute.md`, `closeout.md`, `charter.md`, `prd.md`.
   - `board.mdc` and `board.md` are absent from Cursor-specific command files, which explains why `/board` does not appear in Cursor command picker.

3. **Antigravity workflow copy *does* include Board in this repository**
   - `.agents/workflows/board.md` exists.
   - This indicates command routing drift between `.agents` and `.cursor` surfaces.

4. **Extension scaffolding source currently supports Board generation**
   - `mcd-starter-kit-dev/extension/src/scaffolder.ts` includes `board` in generated command list.
   - `mcd-starter-kit-dev/extension/src/templates/commands.ts` and `.../templates/adapters.ts` include Board content/description.
   - Conclusion: current extension source appears capable of generating `/board` in newly scaffolded projects, but this repo's Cursor command files are out of sync.

## Root Cause
Local routing artifact drift: Cursor command/rule files in this repository were not synchronized with the canonical command set (or were generated before Board inclusion), while other command surfaces and canonical docs were updated.

## Scope
### In Scope (next phase candidates)
- Restore missing Cursor command files:
  - `.cursor/rules/board.mdc`
  - `.cursor/commands/board.md`
- Verify command parity across supported workflow surfaces:
  - `.agents/workflows/`
  - `.cursor/rules/`
  - `.cursor/commands/`
- Validate extension scaffold output produces Board files for fresh project generation.

### Out of Scope
- Any behavior change to Command Deck runtime UI/backend.
- Marketplace metadata/licensing/readme/changelog updates (separate readiness workstream).

## Recommendation
Proceed with **BOARD** phase to draft a tight sync contract that restores `/board` parity in this repository and adds a lightweight parity check to prevent recurrence.
