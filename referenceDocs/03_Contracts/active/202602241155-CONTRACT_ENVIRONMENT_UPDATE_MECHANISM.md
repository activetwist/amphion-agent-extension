# CONTRACT: Environment Update Mechanism (Release Stabilization)

**Phase:** 2 (Planning & Agreement)  
**Date:** 2026-02-24  
**Status:** DRAFT (Awaiting Approval)  
**Codename:** `BlackClaw`

## 1. Objective
Implement a deterministic environment-update mechanism so existing Amphion project workspaces can safely sync generator-owned governance/adapter surfaces when extension versions advance.

## 2. Source Evaluations
- `referenceDocs/04_Analysis/findings/202602241145-ENVIRONMENT_UPDATE_MECHANISM_EVAL.md`
- `referenceDocs/04_Analysis/findings/202602241153-EVAL_REVIEW_ENVIRONMENT_UPDATE_MECHANISM_FINDINGS.md`

## 3. Conflict Flag (Active Contract Overlap)
Potential overlap with active contracts touching scaffold/governance surfaces:
- `202602240946-CONTRACT_SIP1_ONBOARDING.md` (historical overlap on scaffold surfaces)
- `202602241134-CONTRACT_AGENT_MEMORY_AND_REMEMBER_UNIFIED.md` (confirmed execution touched `scaffolder.ts` + governance generation)

Execution guardrail:
- Do not run this contract concurrently with any other execution modifying `extension.ts`, `scaffolder.ts`, or generator-owned governance/template files.
- Apply as a dedicated migration slice.

## 4. Scope Boundaries
**In-Scope**
- Add `mcdVersion` to scaffolded `ops/amphion.json` context.
- Add activation-time version check in `extension.ts` for existing `referenceDocs` workspaces.
- Implement `migrateEnvironment(...)` in `scaffolder.ts` for deterministic allowlist updates of generator-owned files.
- Add dirty-repo warning and pre-migration safety prompt.
- Add defer/snooze behavior (persisted in workspace state) to avoid prompt spam.
- Ensure migration includes current governance/memory additions (`REMEMBER.md`, `06_AgentMemory/*`) when missing.

**Out-of-Scope**
- Mutating user-authored strategy docs (`01_Strategy/*`), contracts, or records.
- Automatic git commit/push.
- Destructive deletion of unknown files.
- Broad content redesign of templates unrelated to migration/versioning.

## 5. Affected File Paths (AFPs)
**Modify**
- `mcd-starter-kit-dev/extension/src/extension.ts`
- `mcd-starter-kit-dev/extension/src/scaffolder.ts`
- `mcd-starter-kit-dev/extension/src/wizard.ts` *(if type updates are required for `mcdVersion` flow)*

**Potential Generated Output**
- `mcd-starter-kit-dev/extension/out/extension.js`
- `mcd-starter-kit-dev/extension/out/extension.js.map`
- `mcd-starter-kit-dev/extension/out/scaffolder.js`
- `mcd-starter-kit-dev/extension/out/scaffolder.js.map`

## 6. Implementation Plan
See:
- `referenceDocs/03_Contracts/active/202602241155-IMPLEMENTATION_PLAN_ENVIRONMENT_UPDATE_MECHANISM.md`

## 7. Acceptance Criteria
- [ ] Newly scaffolded `ops/amphion.json` contains `mcdVersion` aligned to extension package version.
- [ ] On activation, existing workspaces with `referenceDocs` run version comparison and surface a non-blocking update prompt when stale.
- [ ] Prompt supports defer/snooze semantics to avoid repetitive startup prompts.
- [ ] `migrateEnvironment(...)` updates only generator-owned allowlist files.
- [ ] Migration warns on dirty git state before applying updates.
- [ ] Migration updates `ops/amphion.json` to new `mcdVersion` after successful sync.
- [ ] No user strategy/contracts/records are overwritten.
- [ ] Extension compiles successfully.

## 8. Risks & Mitigations
- **Risk:** Overwriting user-customized files.
  **Mitigation:** strict allowlist limited to generator-owned governance/adapter surfaces.
- **Risk:** Activation prompt fatigue.
  **Mitigation:** workspace-state defer/snooze and only prompt on version mismatch.
- **Risk:** Partial migration leaves version metadata inconsistent.
  **Mitigation:** update `mcdVersion` only after successful migration path completion.
- **Risk:** Dirty git state obscures migration impact.
  **Mitigation:** explicit preflight warning + recommend checkpoint commit before apply.

## 9. Verification Plan
- Automated:
  - `npm run compile` for extension.
- Manual:
  1. Simulate stale workspace (`mcdVersion` below current).
  2. Confirm activation prompt appears once with defer/apply options.
  3. Apply migration and verify allowlist files are refreshed.
  4. Verify `ops/amphion.json` `mcdVersion` is updated.
  5. Verify user strategy/contract/record files remain untouched.

## 10. Approval Required
Operator approval required. If approved, execute by referencing this contract filename.
