# CONTRACT: GitHub First-Push Transport Remediation

**Phase:** 2.0 (Contract)  
**Status:** Proposed  
**Date:** 2026-02-22  
**Codename:** `BlackClaw`

## 1. Goal
Resolve the first push transport failure (`HTTP 400` + sideband disconnect) and deterministically establish `origin/main` on GitHub for repository provenance.

## 2. Approved AFPs (Affected File Paths)
- `referenceDocs/03_Contracts/active/202602221748-CONTRACT_GITHUB_FIRST_PUSH_REMEDIATION.md` (this contract)
- `ops/launch-command-deck/data/state.json` (observability card)
- `referenceDocs/05_Records/buildLogs/202602221748-EXECUTE_GITHUB_FIRST_PUSH_REMEDIATION.md` (new)
- `referenceDocs/05_Records/buildLogs/202602221748-WALKTHROUGH_GITHUB_FIRST_PUSH_REMEDIATION.md` (new)

## 3. Scope Boundaries
- **In Scope:**
  - Run focused transport diagnostics for push path (`git` + HTTPS to GitHub).
  - Apply safe, non-destructive transport remediations and retry first push.
  - Verify remote branch creation via both git and GitHub API.
  - Record full execution evidence and final status.
- **Out of Scope:**
  - Destructive git history rewriting (reset/filter-repo/force-push).
  - Extension/runtime feature changes or additional marketplace copy edits.
  - Publishing to marketplace (`vsce publish`).

## 4. Deterministic Execution Plan
1. **Preflight Snapshot**
   - Capture local `HEAD`, remote URL, and current remote refs state.
2. **Transport Diagnostics**
   - Run one push attempt with git transport tracing enabled to identify failure stage.
3. **Safe Remediation Attempts**
   - Apply deterministic, reversible remediations (e.g., protocol tuning / explicit refspec push) one at a time.
   - Re-test push after each remediation.
4. **Branch Verification**
   - Confirm `origin/main` exists using `git ls-remote --heads origin main`.
   - Confirm GitHub repo `defaultBranchRef` reflects `main` once established.
5. **Documentation**
   - Write execution log and walkthrough with exact commands and outcomes.

## 5. Risk Assessment
- **Transport Instability Risk (Medium):** Intermittent HTTPS/session issues may persist.
  **Mitigation:** Use stepwise remediations with trace evidence and explicit verification gates.
- **Credential Drift Risk (Low/Medium):** Push may silently use wrong credentials.
  **Mitigation:** Validate active GitHub auth context before retries.
- **State Misread Risk (Low):** Misinterpreting `Everything up-to-date` as success.
  **Mitigation:** Require remote-ref and GitHub API verification before declaring success.

## 6. Acceptance Criteria
- [ ] Push remediation attempts are executed with traceable command evidence.
- [ ] `origin/main` is created and visible via `git ls-remote --heads origin main`.
- [ ] GitHub repository default branch is established (or explicitly documented why not).
- [ ] No destructive git operations are used.
- [ ] Execute and walkthrough artifacts are created.

## 7. Operator Approval Gate
Execution is blocked pending operator approval.  
To begin implementation, invoke:

`/execute 202602221748-CONTRACT_GITHUB_FIRST_PUSH_REMEDIATION.md`
