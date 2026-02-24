# CLOSEOUT · AmphionAgent

**Phase:** 4 (Archiving & Release)
**Status:** Canonical Instruction Set
**Codename:** `BlackClaw`

## When to Use
Invoke this command when all contracted work for a version is verified and complete.

## Inputs
- [ ] All executed contracts for the version.
- [ ] Build Logs & Verification results.
- [ ] Final Repository State.
- [ ] `referenceDocs/06_AgentMemory/agent-memory.json` baseline (existing or to be initialized).

## Instructions
1. **Archiving**: Move executed contracts from `03_Contracts/active/` to `03_Contracts/archive/`.
2. **Memory Update**: Update compact operational memory in `referenceDocs/06_AgentMemory/agent-memory.json`.
3. **Validation**: Final check against Governance Guardrails and run closeout hygiene validation (`referenceDocs/04_Analysis/scripts/validate_closeout_hygiene.py` when available).
4. **Record Keeping**: Write a formal Closeout Record in `05_Records/`.
5. **Persistence**: Ensure all artifacts are staged and committed to the repository.
6. **Versioning**: Tag or finalize the version in `package.json` or relevant metadata.

## Output
- [ ] Formal Closeout Record in `05_Records/`.
- [ ] Updated `referenceDocs/06_AgentMemory/agent-memory.json`.
- [ ] Clean directory state (`03_Contracts/active/` is empty).
- [ ] Final Git commit using the `closeout:` prefix.
