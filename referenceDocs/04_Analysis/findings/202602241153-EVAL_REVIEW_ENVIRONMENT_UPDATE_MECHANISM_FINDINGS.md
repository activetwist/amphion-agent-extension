# EVALUATE: Review of Environment Update Mechanism Findings

**Phase:** 1 (Research & Scoping)  
**Date:** 2026-02-24  
**Codename:** `BlackClaw`

## 1. Reviewed Source
- `referenceDocs/04_Analysis/findings/202602241145-ENVIRONMENT_UPDATE_MECHANISM_EVAL.md`

## 2. Validation Against Current Codebase
### Confirmed Accurate
1. `extension.ts` is the right interception point for environment checks when `referenceDocs/` exists.
2. `ops/amphion.json` currently lacks version-tracking for scaffold/environment parity.
3. Scaffold/template architecture is centralized in `scaffolder.ts` + template renderers, which supports deterministic migration targets.

### Important Current-State Context
- Repository now includes new governance/memory surfaces from recent execution (`REMEMBER.md`, `06_AgentMemory/`, template updates). Any migration mechanism must include these as first-class update targets.
- `extension.ts` currently auto-opens dashboard whenever `referenceDocs` exists; introducing migration checks here must avoid blocking startup with repeated intrusive prompts.

## 3. Gap Review (Additions to Original Findings)
The original findings are directionally strong, but these additional gaps should be included before contracting:

1. **Idempotency gap**
   - Migration must be safe to run repeatedly without accumulating duplicate/unstable output.

2. **Prompt fatigue gap**
   - Activation-time update checks can become noisy. Need a defer/snooze option and last-seen-version tracking.

3. **Target-surface precision gap**
   - "Overwrite files" needs a strict allowlist of generator-owned files to avoid clobbering user-edited project docs.

4. **Rollback clarity gap**
   - "Warn if dirty" is not enough; migration should present impacted file list and recommend commit/checkpoint before applying.

## 4. Refined Scope
**In-Scope (Refined)**
- Add `mcdVersion` to `ops/amphion.json` for new scaffolds and migration bookkeeping.
- Add activation-time version comparison in `extension.ts` with non-blocking UX.
- Implement `migrateEnvironment` in `scaffolder.ts` with deterministic allowlist updates for generator-owned governance/adapter/command files.
- Update migration to include memory/governance additions (`REMEMBER.md`, `06_AgentMemory/*`) where missing.

**Out-of-Scope (Refined)**
- User strategy/project documents (`01_Strategy`, active contracts, records).
- Automatic commit/push behavior.
- Bulk destructive cleanup of unknown files.

## 5. Primitive Review
No new architecture primitive is required. This is a lifecycle maintenance mechanism over existing scaffold/template primitives.

## 6. Execution Readiness
The reviewed findings are contract-ready after adding:
- idempotency requirement,
- defer/snooze UX behavior,
- strict migration allowlist,
- explicit inclusion of new memory/governance generated assets.
