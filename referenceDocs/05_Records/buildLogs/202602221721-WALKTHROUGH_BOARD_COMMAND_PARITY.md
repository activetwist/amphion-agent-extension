# WALKTHROUGH: `/board` Command Parity

## Goal
Confirm `/board` command availability in Cursor and verify board command parity across repository and extension scaffold sources.

## Steps
1. Open command files and verify Cursor artifacts exist:
   - `.cursor/rules/board.mdc`
   - `.cursor/commands/board.md`
2. Confirm Board command exists in agent workflow surface:
   - `.agents/workflows/board.md`
3. In Cursor, invoke `/board` and verify command appears in the slash-command picker.
4. Execute `/board` once and confirm it routes to canonical:
   - `referenceDocs/00_Governance/mcd/BOARD.md`
5. Verify extension scaffold sources still include Board generation:
   - `mcd-starter-kit-dev/extension/src/scaffolder.ts`
   - `mcd-starter-kit-dev/extension/src/templates/commands.ts`
   - `mcd-starter-kit-dev/extension/src/templates/adapters.ts`

## Expected Results
- `/board` is discoverable and executable in Cursor.
- Cursor command/rule and agent workflow surfaces are parity-aligned for Board.
- Extension scaffold source remains board-capable for packaged outputs.

## Rollback (if needed)
- Remove `.cursor/rules/board.mdc` and `.cursor/commands/board.md` only if a downstream tool incompatibility is proven.
- Re-run parity check before any rollback is finalized.
