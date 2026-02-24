# Walkthrough: Agent Memory + `/remember` Unified Integration

## Objective
Validate deterministic memory lifecycle support and `/remember` utility integration across governance, dashboard UX, and scaffold/template generation.

## Preconditions
1. Open workspace with updated extension source.
2. Ensure `referenceDocs/06_AgentMemory/agent-memory.json` exists.

## Steps
1. Open Command Deck Dashboard and confirm `/remember` appears in Command Flow.
2. Click `/remember` and verify chat opens with prefilled `/remember` text.
3. Open `referenceDocs/00_Governance/mcd/REMEMBER.md` and confirm utility-only instructions are present.
4. Open `referenceDocs/00_Governance/mcd/CLOSEOUT.md` and confirm memory update + hygiene validation are required.
5. Run:
   - `python3 referenceDocs/04_Analysis/scripts/validate_closeout_hygiene.py --root .`
6. Confirm validator passes and reports only legacy timestamp warnings if present.
7. Run extension compile:
   - `npm run compile` in `mcd-starter-kit-dev/extension`.
8. Review scaffold/template sources to confirm remember propagation:
   - `scaffolder.ts` writes `REMEMBER.md` and `06_AgentMemory/*`.
   - adapters/templates include remember workflow generation.

## Expected Result
- `/remember` is available as utility command with no phase transition semantics.
- Memory artifacts and governance requirements are consistent.
- Validator and compile checks pass.
