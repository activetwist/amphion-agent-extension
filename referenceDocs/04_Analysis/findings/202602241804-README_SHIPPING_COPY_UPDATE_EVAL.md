# EVALUATE: README Shipping Copy Update

**Date:** 2026-02-24 18:04 UTC  
**Phase:** Evaluate (Research & Scoping)  
**Status:** Complete

## Request
Evaluate and scope a final update to the extension README shipping content so Install/Requirements reflect the current release posture.

Requested target copy:
- VSIX example should use current stable version (replace placeholder `1.XX.X` with real stable value).
- Requirements should state:
  - **AI-Enabled** VS Code-based IDE
  - Git
  - Python 3 (only) for Command Deck server runtime

## Research Findings
1. The shipped README source is `mcd-starter-kit-dev/extension/README.md`.
2. Current Install section is outdated and includes old version examples:
   - `amphion-agent-1.24.4.vsix` (test build)
   - `amphion-agent-1.25.0.vsix` (current release line)
3. Current Requirements section still allows either Python or Node runtime, which no longer matches requested release policy.
4. Current stable extension version is `1.28.1` (`mcd-starter-kit-dev/extension/package.json`, line 5), and matching VSIX artifact exists in extension root.

## Gap Analysis
- **Version Drift:** README VSIX examples do not reflect current stable line.
- **Runtime Drift:** README requirements still advertise Node.js runtime path that should be removed for this release posture.
- **Host Framing Drift:** Requirement wording should be tightened from generic host/runtime compatibility to **AI-Enabled VS Code-based IDE**.

## Scope
### In-Scope
- Update `Install > From VSIX` copy in extension `README.md` to use current stable package version (`1.28.1`) as the example release line.
- Remove the legacy test-build example line.
- Update `Requirements` copy to:
  - `AI-Enabled VS Code-based IDE`
  - `Git`
  - `Local runtime for Command Deck server: Python 3`

### Out-of-Scope
- Any README sections outside Install/Requirements.
- Package/version bumps.
- Marketplace publisher changes.
- Scaffold/runtime architecture changes.

## Primitive Review
No new Architecture Primitive is required. This is documentation alignment only.

## Contract Recommendation
Proceed with a focused contract that modifies only:
- `mcd-starter-kit-dev/extension/README.md`

Acceptance criteria should include:
- Install section shows a single current release example: `amphion-agent-1.28.1.vsix`.
- Requirements section exactly reflects AI-enabled IDE + Git + Python 3 only.
- No unrelated README or code paths are changed.
