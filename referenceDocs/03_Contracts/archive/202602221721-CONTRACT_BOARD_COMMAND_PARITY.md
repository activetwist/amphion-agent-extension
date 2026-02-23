# CONTRACT: Restore `/board` Command Parity

**Phase:** 2.0 (Contract)  
**Status:** Proposed  
**Date:** 2026-02-22  
**Codename:** `BlackClaw`

## 1. Goal
Restore `/board` availability in this repository's Cursor command surface and ensure extension scaffolding continues to generate Board command artifacts for packaged distribution.

## 2. Approved AFPs (Affected File Paths)
- `referenceDocs/03_Contracts/active/202602221721-CONTRACT_BOARD_COMMAND_PARITY.md` (this contract)
- `ops/launch-command-deck/data/state.json` (observability card)
- `.cursor/rules/board.mdc` (new)
- `.cursor/commands/board.md` (new)
- `mcd-starter-kit-dev/extension/src/scaffolder.ts` (verify/update only if parity gap is found)
- `mcd-starter-kit-dev/extension/src/templates/commands.ts` (verify/update only if parity gap is found)
- `mcd-starter-kit-dev/extension/src/templates/adapters.ts` (verify/update only if parity gap is found)
- `referenceDocs/05_Records/buildLogs/202602221721-EXECUTE_BOARD_COMMAND_PARITY.md` (new)
- `referenceDocs/05_Records/buildLogs/202602221721-WALKTHROUGH_BOARD_COMMAND_PARITY.md` (new)

## 3. Scope Boundaries
- **In Scope:**
  - Restore missing Cursor Board command files in this repo using canonical Board command content.
  - Confirm parity across command surfaces (`.agents/workflows`, `.cursor/rules`, `.cursor/commands`) for Board.
  - Validate extension scaffolder/templates still include Board generation and patch only if mismatch is found.
  - Document execution and verification artifacts.
- **Out of Scope:**
  - Command Deck runtime UI/backend changes.
  - Marketplace metadata/readme/changelog/GitHub CLI enablement workstream.
  - Any new MCD lifecycle behavior changes beyond parity restoration.

## 4. Deterministic Execution Plan
1. **Restore Cursor Rule**
   - Create `.cursor/rules/board.mdc` mirroring canonical Board invocation pattern.
2. **Restore Cursor Command**
   - Create `.cursor/commands/board.md` with canonical Board command body.
3. **Parity Validation**
   - Verify Board exists and content routes correctly across `.agents/workflows`, `.cursor/rules`, `.cursor/commands`.
4. **Extension Safeguard**
   - Re-check extension scaffold/templates for Board support and patch only if a real parity defect exists.
5. **Verification**
   - Confirm `/board` appears in Cursor command surface.
   - Confirm scaffold generation path retains Board command output.
6. **Documentation**
   - Write execute build log and walkthrough verification artifacts.

## 5. Risk Assessment
- **Command Drift Risk (Medium):** Regenerated or manual command files may diverge again.
  **Mitigation:** Use canonical command body and verify all three command surfaces in one pass.
- **Surface Mismatch Risk (Low/Medium):** Board could exist in one IDE surface but not another.
  **Mitigation:** Explicit parity validation checklist across `.agents`, `.cursor/rules`, and `.cursor/commands`.
- **Scaffold Regression Risk (Low):** Extension packaging could omit Board if templates drift.
  **Mitigation:** Validate scaffold/template source during execution and patch only when mismatch is confirmed.

## 6. Acceptance Criteria
- [ ] `.cursor/rules/board.mdc` exists and routes to canonical `BOARD.md`.
- [ ] `.cursor/commands/board.md` exists and routes to canonical `BOARD.md`.
- [ ] Board command parity verified across `.agents/workflows`, `.cursor/rules`, `.cursor/commands`.
- [ ] Extension scaffold/template Board support is validated and corrected only if needed.
- [ ] `/board` is available in Cursor command surface after sync.
- [ ] Build log and walkthrough records are created.

## 7. Operator Approval Gate
Execution is blocked pending operator approval.  
To begin implementation, invoke:

`/execute 202602221721-CONTRACT_BOARD_COMMAND_PARITY.md`
