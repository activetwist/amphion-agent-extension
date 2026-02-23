# EVALUATE: Marketplace + GitHub Readiness (Re-Evaluation)

## 1. Research & Analysis
Operator wants to resume Marketplace publishing prep, specifically from the GitHub step. Current repository and extension state was rechecked.

### Current State Findings
1. **GitHub CLI Not Available**
   - `gh` is not installed on this machine (`command -v gh` returns no path).
2. **No Git Remote Configured**
   - `git remote -v` returns no remotes.
   - Provenance/publish workflow is blocked until remote is created and linked.
3. **Extension Metadata Still Incomplete for Marketplace**
   - `mcd-starter-kit-dev/extension/package.json` currently lacks:
     - `license`
     - `repository`
     - `author`
   - `publisher` is set to `stanton-brooks`; may need alignment with intended final Publisher ID strategy.
4. **Packaging Hygiene Not Yet Applied**
   - `mcd-starter-kit-dev/extension/.vscodeignore` does not exclude `*.vsix`.
   - Extension directory contains many historical `.vsix` binaries; next package risks bloat if not ignored.
5. **Marketplace Docs Still Outdated**
   - `mcd-starter-kit-dev/extension/README.md` remains older “MCD Starter Kit” messaging, includes legacy/offline install references, and does not reflect current slash-command-driven MCD operation model.
   - No root-level extension `CHANGELOG.md` exists.
6. **Repository Is Actively Dirty**
   - `git status` shows substantial in-progress local modifications and new docs/contracts/build logs.
   - Publishing flow should be sequenced after deciding what to include/exclude in a release commit.

## 2. Gap Analysis
The publish path remains blocked by two hard prerequisites:
1) GitHub tooling/remote setup, and 2) Marketplace packaging/listing hygiene.

Even with feature/UI progress complete, extension release packaging and listing quality are not yet aligned to a production Marketplace submission.

## 3. Scoping
### In Scope
- Install/authenticate GitHub CLI **or** perform equivalent manual remote workflow.
- Create/link remote and push canonical branch history.
- Finalize extension metadata (`license`, `repository`, `author`, `publisher` decision check).
- Update `.vscodeignore` to exclude `*.vsix`.
- Refresh README and add CHANGELOG.
- Run package validation (`vsce package`) and inspect artifact size.

### Out of Scope
- New feature work unrelated to release.
- Marketplace publish command itself unless explicitly authorized after readiness pass.

## 4. Primitive Review
No new architecture primitives required. This is release operations and documentation/metadata hardening.

## 5. Conclusion
**HALT.** Re-evaluation confirms publishing prep is not yet complete and remains blocked at GitHub setup + marketplace polish.
