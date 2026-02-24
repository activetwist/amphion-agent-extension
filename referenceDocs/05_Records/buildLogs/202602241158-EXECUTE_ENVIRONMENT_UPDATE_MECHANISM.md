# EXECUTE LOG: Environment Update Mechanism (Release Stabilization)

**Date (UTC):** 2026-02-24T17:58:55Z  
**Contract:** `referenceDocs/03_Contracts/active/202602241155-CONTRACT_ENVIRONMENT_UPDATE_MECHANISM.md`

## AFP Compliance
### Modified
- `mcd-starter-kit-dev/extension/src/extension.ts`
- `mcd-starter-kit-dev/extension/src/scaffolder.ts`

### Optional AFP Note
- `mcd-starter-kit-dev/extension/src/wizard.ts` was not modified (not required for implementation).

## Implementation Completed
1. Added activation-time environment version check in `extension.ts` for workspaces where `referenceDocs` exists.
2. Added non-blocking update prompt with options:
   - `Update Environment`
   - `Later`
3. Added defer/snooze persistence via workspace state key to reduce startup prompt repetition.
4. Added deterministic version compare helper logic.
5. Added scaffold-time `mcdVersion` + `initialVersion` persistence in `ops/amphion.json`.
6. Implemented `migrateEnvironment(root, extensionUri, targetVersion)` in `scaffolder.ts`:
   - dirty git warning via `git status --porcelain`
   - strict allowlist refresh for generator-owned governance/command/adapter files
   - workflow regeneration via template surfaces
   - ensure missing memory/governance additions (`REMEMBER.md`, `06_AgentMemory/*`) are present
   - update `ops/amphion.json` `mcdVersion` only on successful migration completion

## Verification
### Automated
- `npm run compile` (extension): PASS

### Contract Criteria Mapping
- [x] Newly scaffolded `ops/amphion.json` includes `mcdVersion` aligned to extension package version.
- [x] Activation-time stale version prompt implemented for existing `referenceDocs` workspaces.
- [x] Prompt includes defer (`Later`) behavior persisted in workspace state.
- [x] Migration flow applies strict generator-owned allowlist.
- [x] Dirty git warning present pre-migration.
- [x] Migration updates `mcdVersion` post-success.
- [x] User strategy/contracts/records are outside migration allowlist and not targeted.
- [x] Extension compiles successfully.

## Notes
- This execution did not build a new VSIX package; packaging remains a separate release step.
