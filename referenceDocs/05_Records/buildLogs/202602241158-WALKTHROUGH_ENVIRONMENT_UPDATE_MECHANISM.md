# Walkthrough: Environment Update Mechanism

## Objective
Validate that stale local MCD environments are detected on extension activation and can be safely migrated using generator-owned allowlist updates.

## Preconditions
1. Existing workspace with `referenceDocs/` present.
2. `ops/amphion.json` exists with stale or missing `mcdVersion`.

## Steps
1. Launch/reload extension in a workspace with `referenceDocs`.
2. Confirm dashboard opens as usual (non-blocking behavior preserved).
3. Confirm update prompt appears when `mcdVersion` is stale/missing.
4. Select `Later` and verify no repeat prompt during defer window.
5. After defer expiry (or by resetting workspace state), select `Update Environment`.
6. If repo is dirty, confirm warning modal appears with Continue/Abort behavior.
7. Continue migration and verify these outcomes:
   - `ops/amphion.json` now includes updated `mcdVersion`
   - generator-owned governance/command files refreshed
   - adapter/workflow files regenerated
   - `referenceDocs/06_AgentMemory/*` and `referenceDocs/00_Governance/mcd/REMEMBER.md` exist when previously missing
8. Verify user-authored strategy/contracts/records were not targeted by migration.

## Expected Result
- Migration is safe, idempotent, and limited to generator-owned surfaces.
- Version metadata is synchronized after successful update.
