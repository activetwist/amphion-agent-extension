# CONTRACT: Remediate MCD Guide Playbook Drift and Rebuild v1.25.0

**Phase:** 2.0 (Contract)  
**Status:** Proposed  
**Date:** 2026-02-22  
**Codename:** `BlackClaw`

## 1. Goal
Eliminate playbook content drift in fresh scaffolded environments by aligning scaffold template playbook content with canonical 5-phase MCD guidance, then rebuild and validate a corrected `1.25.0` VSIX artifact.

## 2. Approved AFPs (Affected File Paths)
- `referenceDocs/03_Contracts/active/202602221802-CONTRACT_PLAYBOOK_DRIFT_REMEDIATE_REBUILD_1250.md` (this contract)
- `ops/launch-command-deck/data/state.json` (observability card)
- `mcd-starter-kit-dev/extension/src/templates/playbook.ts`
- `mcd-starter-kit-dev/extension/out/templates/playbook.js`
- `mcd-starter-kit-dev/extension/CHANGELOG.md` (only if rebuild-note entry is required)
- `mcd-starter-kit-dev/extension/amphion-agent-1.25.0.vsix` (rebuilt artifact)
- `referenceDocs/05_Records/buildLogs/202602221802-EXECUTE_PLAYBOOK_DRIFT_REMEDIATE_REBUILD_1250.md` (new)
- `referenceDocs/05_Records/buildLogs/202602221802-WALKTHROUGH_PLAYBOOK_DRIFT_REMEDIATE_REBUILD_1250.md` (new)

## 3. Scope Boundaries
- **In Scope:**
  - Update scaffold template playbook to current 5-phase canonical guidance (including `/board` and Halt-and-Prompt framing).
  - Compile extension output so `out/templates/playbook.js` reflects source changes.
  - Repackage a corrected `amphion-agent-1.25.0.vsix`.
  - Validate by checking generated playbook content path and package success.
- **Out of Scope:**
  - New feature work unrelated to playbook drift.
  - Version bump beyond `1.25.0`.
  - Marketplace publish action.

## 4. Deterministic Execution Plan
1. **Template Alignment**
   - Replace stale 4-phase playbook text in `src/templates/playbook.ts` with canonical 5-phase content.
2. **Build Synchronization**
   - Run compile step to refresh `out/templates/playbook.js`.
3. **Artifact Rebuild**
   - Repackage extension and regenerate `amphion-agent-1.25.0.vsix`.
4. **Verification**
   - Confirm scaffold source now emits 5-phase playbook language.
   - Confirm package command succeeds with expected artifact path.
5. **Documentation**
   - Write execute + walkthrough records with verification evidence.

## 5. Risk Assessment
- **Copy Drift Recurrence (Medium):** Canonical docs and scaffold template may diverge again.
  **Mitigation:** Treat `src/templates/playbook.ts` as required parity target during governance copy updates.
- **Build Artifact Staleness (Low/Medium):** Source updates may not be reflected if output is not compiled before packaging.
  **Mitigation:** Mandatory compile before package and explicit verification of output file content.
- **Packaging Noise Risk (Low):** Rebuild may include stale artifacts.
  **Mitigation:** Re-run package validation and verify artifact timestamp/path.

## 6. Acceptance Criteria
- [ ] `src/templates/playbook.ts` reflects canonical 5-phase MCD playbook guidance.
- [ ] `out/templates/playbook.js` is regenerated and aligned.
- [ ] Rebuilt `amphion-agent-1.25.0.vsix` is generated successfully.
- [ ] Fresh scaffold output path is validated to include updated playbook wording.
- [ ] Execute and walkthrough records are created.

## 7. Operator Approval Gate
Execution is blocked pending operator approval.  
To begin implementation, invoke:

`/execute 202602221802-CONTRACT_PLAYBOOK_DRIFT_REMEDIATE_REBUILD_1250.md`
