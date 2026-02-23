# CONTRACT: Marketplace Polish + GitHub CLI Enablement (v1.25.0)

**Phase:** 2.0 (Contract)  
**Status:** Proposed  
**Date:** 2026-02-22  
**Codename:** `BlackClaw`

## 1. Goal
Enable a reliable GitHub-native release workflow by installing/authenticating GitHub CLI, connecting the repository remote, and completing marketplace-facing polish so the extension is ready for packaging and publication hygiene checks.

## 2. Approved AFPs (Affected File Paths)
- `referenceDocs/03_Contracts/active/202602221636-CONTRACT_MARKETPLACE_POLISH_GH_ENABLEMENT.md` (this contract)
- `ops/launch-command-deck/data/state.json` (contract card observability)
- `mcd-starter-kit-dev/extension/.vscodeignore`
- `mcd-starter-kit-dev/extension/package.json`
- `mcd-starter-kit-dev/extension/README.md`
- `mcd-starter-kit-dev/extension/CHANGELOG.md` (new)
- `mcd-starter-kit-dev/extension/icon.png`
- `mcd-starter-kit-dev/extension/src/templates/adapters.ts`
- `referenceDocs/00_Governance/MCD_PLAYBOOK.md`
- `mcd-starter-kit-dev/extension/assets/referenceDocs/00_Governance/MCD_PLAYBOOK.md`

## 3. Scope Boundaries
- **In Scope:**
  - Install and verify GitHub CLI availability on the local machine.
  - Authenticate GitHub CLI and create or connect a public GitHub remote.
  - Push `main` to remote with upstream tracking.
  - Harden package payload boundaries by excluding `*.vsix` and other release-noise artifacts.
  - Normalize extension listing metadata (`license`, `publisher`, `author`, `repository`) to the operator-approved values.
  - Refresh marketplace documentation (`README.md`, `CHANGELOG.md`) to reflect current slash-command MCD flow.
  - Execute targeted terminology normalization from "Product Owner" to "Product Manager" in scoped product-facing docs/templates.
  - Sync governance terminology changes between source and extension asset mirror files.
- **Out of Scope:**
  - New runtime features, UI redesigns, or backend architecture changes.
  - Marketplace publish action (`vsce publish`) unless separately authorized.
  - Broad repository-wide refactors beyond explicitly listed AFPs.

## 4. Deterministic Execution Plan
1. **Tooling Enablement**
   - Install `gh` using the host package manager and verify with `gh --version`.
   - Run `gh auth login` and verify account context.
2. **Remote Provenance Setup**
   - Create (or attach) the target public repository.
   - Configure `origin`, then push `main` with upstream tracking.
3. **Marketplace Payload Hygiene**
   - Update `.vscodeignore` to exclude `*.vsix` and confirm package artifact boundaries.
4. **Listing Metadata Finalization**
   - Update `package.json` with approved proprietary licensing posture, publisher ID, author identity, and repository URL.
5. **Documentation Modernization**
   - Rewrite `README.md` to current MCD slash-command operation model.
   - Add `CHANGELOG.md` for the current release lineage.
6. **Terminology Normalization**
   - Replace "Product Owner" with "Product Manager" in scoped files only.
   - Mirror relevant governance wording updates into extension asset documentation.
7. **Validation**
   - Run build/lint/package checks required for release confidence.
   - Confirm git status and provide final execution summary.

## 5. Risk Assessment
- **Credential/Account Risk:** `gh auth login` requires interactive auth; wrong account context could publish to the wrong namespace.
- **Remote Safety Risk:** Incorrect remote URL or branch push target can cause provenance drift.
- **Metadata Compliance Risk:** Invalid publisher or repository values can fail Marketplace validation or reduce listing trust.
- **Bulk Replace Risk:** Terminology replacement can unintentionally alter unrelated copy; replacement is restricted to AFP scope and reviewed before write.
- **Packaging Regression Risk:** Missing ignore rules can reintroduce artifact bloat and inflate `.vsix` size.

## 6. Acceptance Criteria
- [ ] `gh` is installed and authenticated on the operator machine.
- [ ] GitHub remote is configured and `main` is pushed with upstream tracking.
- [ ] `.vscodeignore` excludes `*.vsix` artifacts.
- [ ] `package.json` reflects approved release metadata and repository URL.
- [ ] `README.md` reflects slash-command-based MCD workflow and current guidance.
- [ ] `CHANGELOG.md` exists with current release entries.
- [ ] Scoped terminology updates are applied and mirrored where required.
- [ ] Validation checks run successfully with no new blocking errors.

## 7. Operator Approval Gate
Execution is blocked pending operator approval.  
To begin build work, invoke:

`/execute 202602221636-CONTRACT_MARKETPLACE_POLISH_GH_ENABLEMENT.md`
