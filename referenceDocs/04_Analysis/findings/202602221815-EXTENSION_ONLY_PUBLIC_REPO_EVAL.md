# Evaluate Findings: Extension-Only Public Repository Strategy

**Timestamp:** 2026-02-22 18:15 local  
**Phase:** EVALUATE  
**Codename:** `BlackClaw`

## User Request
Determine how to publish only necessary extension code to GitHub (not entire workspace), where that should live, whether agent assistance is possible, and whether a walkthrough can be provided.

## Research Evidence
1. Current `origin/main` contains broad workspace scope:
   - `git ls-tree -r --name-only origin/main` reports **3455** tracked files.
   - Includes non-extension areas (`referenceDocs/`, `ops/`, historical docs, etc.).
2. Extension package metadata currently points to:
   - `repository.url = https://github.com/activetwist/amphion-agent.git`
3. Packaging boundary (`.vscodeignore`) controls VSIX contents only; it does **not** control what is in GitHub history.

## Findings
1. **Your concern is valid**: current public repo branch is not extension-only.
2. **Surgical ignore alone will not fix already-tracked history**:
   - `.gitignore`/`.vscodeignore` cannot remove files already pushed to GitHub.
3. **Built VSIX is not the repository strategy**:
   - VSIX is distributable artifact.
   - Public repo provenance should still be source-centric (minimal extension source tree).

## Best-Practice Options
### Option A (Recommended, safest): Dedicated extension-only public repo
- Create/repurpose a repo whose root is logically the extension project (`mcd-starter-kit-dev/extension` contents only).
- Keep current full workspace repo local/private if desired.
- Point `package.json.repository.url` to that extension-only repo.

### Option B (Higher risk): Rewrite current public repo history to extension-only
- Requires forceful history rewrite and force-push.
- Operationally riskier and unnecessary given Option A.

## Answers to User Questions
1. **How do I get this?**  
   By publishing from an extension-only source tree/repo, not from the full workspace root.
2. **Where?**  
   In a dedicated public GitHub repo for extension source only (recommended).
3. **Can the agent assist?**  
   Yes. Agent can perform the full surgical migration path (prepare extension-only tree, initialize/push, update metadata, validate package).
4. **Need walkthrough?**  
   Yes. A deterministic step-by-step walkthrough should be produced during execute phase.

## Scope (Next Phase Candidate)
### In Scope
- Define and execute extension-only repo migration strategy.
- Update `repository.url` to extension-only repo target.
- Validate package/build from extension-only tree.
- Provide explicit walkthrough artifact.

### Out of Scope
- Runtime feature changes.
- Marketplace publish action itself (unless separately authorized).

## Conclusion
To achieve "public repo shows only what is necessary for the extension package," use a dedicated extension-only repository strategy. This is the lowest-risk, most deterministic path.
