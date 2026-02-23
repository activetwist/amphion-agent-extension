# CONTRACT: Extension-Only Public Repo and Marketplace Publish Assist

**Phase:** 2.0 (Contract)  
**Status:** Proposed  
**Date:** 2026-02-22  
**Codename:** `BlackClaw`

## 1. Goal
Publish with clean provenance by using an extension-only public GitHub repository (no full-workspace spillover), then complete Marketplace submission support for the rebuilt `1.25.0` extension.

## 2. Approved AFPs (Affected File Paths)
- `referenceDocs/03_Contracts/active/202602221818-CONTRACT_EXTENSION_ONLY_REPO_AND_MARKETPLACE_PUBLISH.md` (this contract)
- `ops/launch-command-deck/data/state.json` (observability card)
- `mcd-starter-kit-dev/extension/package.json` (repository URL finalization if target repo differs)
- `mcd-starter-kit-dev/extension/README.md` (repository link/reference alignment only if needed)
- `referenceDocs/05_Records/buildLogs/202602221818-EXECUTE_EXTENSION_ONLY_REPO_AND_MARKETPLACE_PUBLISH.md` (new)
- `referenceDocs/05_Records/buildLogs/202602221818-WALKTHROUGH_EXTENSION_ONLY_REPO_AND_MARKETPLACE_PUBLISH.md` (new)

## 3. Scope Boundaries
- **In Scope:**
  - Create/attach a dedicated extension-only GitHub repository target.
  - Push extension-only source history to that repository (without rewriting current workspace history).
  - Update extension metadata links to extension-only repository, if required.
  - Validate packaging from extension directory (`amphion-agent-1.25.0.vsix`).
  - Execute Marketplace publish-assist flow, pausing for operator interactive inputs (publisher/token/confirmation) as required.
  - Produce explicit step-by-step walkthrough for repeatable future releases.
- **Out of Scope:**
  - Destructive rewrite/force-clean of existing full-workspace public repository.
  - Runtime feature work unrelated to publication/provenance.
  - Version bump beyond `1.25.0` unless operator explicitly requests it.

## 4. Deterministic Execution Plan
1. **Interactive Target Confirmation**
   - Confirm extension-only GitHub repo owner/name with operator before write actions.
2. **Extension-Only Repo Provisioning**
   - Create/connect target repo.
   - Push extension-only source tree/history as canonical public provenance.
3. **Metadata Alignment**
   - Update `package.json` (and README reference if needed) to point to extension-only repo URL.
4. **Validation Build**
   - Re-run package validation from `mcd-starter-kit-dev/extension`.
5. **Marketplace Submission Assist**
   - Run `vsce`/publish steps with operator-provided interactive credentials/tokens.
   - Capture resulting listing URL/version confirmation.
6. **Documentation**
   - Write execute + walkthrough artifacts including exact commands and interactive checkpoints.

## 5. Risk Assessment
- **Repo Target Risk (Medium):** Publishing to wrong owner/repo.
  **Mitigation:** mandatory interactive owner/repo confirmation gate before repo creation/push.
- **Scope Leakage Risk (Medium):** Non-extension files accidentally pushed.
  **Mitigation:** extension-only push strategy with explicit post-push file-tree verification.
- **Credential/Publish Risk (Medium):** Marketplace token/publisher issues during publish.
  **Mitigation:** pause at interactive steps; validate publisher/token scope before publish.
- **Metadata Drift Risk (Low/Medium):** Package links still point to old repo.
  **Mitigation:** explicit metadata verification checklist before final publish.

## 6. Acceptance Criteria
- [ ] Extension-only public repository exists and contains only extension-relevant source tree.
- [ ] Non-extension workspace content is not included in the extension-only public repo.
- [ ] `package.json` repository URL is aligned to extension-only target.
- [ ] `1.25.0` package validation passes.
- [ ] Marketplace submission steps are completed or blocked with explicit actionable reason.
- [ ] Execute and walkthrough records are created with repeatable release instructions.

## 7. Operator Approval Gate
Execution is blocked pending operator approval.  
To begin implementation, invoke:

`/execute 202602221818-CONTRACT_EXTENSION_ONLY_REPO_AND_MARKETPLACE_PUBLISH.md`
