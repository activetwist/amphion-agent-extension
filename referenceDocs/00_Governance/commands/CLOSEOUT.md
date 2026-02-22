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

## Instructions
1. **Archiving**: Move executed contracts from `03_Contracts/active/` to `03_Contracts/archive/`.
2. **Validation**: Final check against the project's Governance Guardrails.
3. **Record Keeping**: Write a formal Closeout Record in `05_Records/`.
4. **Persistence**: Ensure all artifacts are staged and committed to the repository.
5. **Versioning**: Tag or finalize the version in `package.json` or relevant metadata.

## Output
- [ ] Formal Closeout Record in `05_Records/`.
- [ ] Clean directory state (`03_Contracts/active/` is empty).
- [ ] Final Git commit using the `closeout:` prefix.
