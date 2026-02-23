# EXECUTE LOG: Extension-Only Repo and Marketplace Publish Assist

**Contract:** `202602221818-CONTRACT_EXTENSION_ONLY_REPO_AND_MARKETPLACE_PUBLISH.md`  
**Date:** 2026-02-22  
**Executed At (UTC):** 2026-02-23T00:29:58Z  
**Codename:** `BlackClaw`

## Implementation Completed
1. Interactive target confirmed:
   - Repo target: `activetwist/amphion-agent-extension`
   - Continue to publish assist: **Yes**
2. Extension-only public repo provisioned:
   - Created repo: `https://github.com/activetwist/amphion-agent-extension`
   - Exported extension source tree only from `mcd-starter-kit-dev/extension` (excluded `.git`, `node_modules`, `*.vsix`)
   - Initialized/pushed clean extension-only `main` branch to target repo.
3. Metadata alignment completed:
   - Updated `mcd-starter-kit-dev/extension/package.json` repository URL to:
     - `https://github.com/activetwist/amphion-agent-extension.git`
4. Validation build completed:
   - `npm run package` succeeded.
   - Rebuilt artifact: `mcd-starter-kit-dev/extension/amphion-agent-1.25.0.vsix`

## Verification Evidence
- Extension-only repo root contents:
  - `.vscodeignore`, `CHANGELOG.md`, `README.md`, `assets/`, `icon.png`, `icon.svg`, `out/`, `package*.json`, `src/`, `tsconfig.json`
- GitHub repo status:
  - URL: `https://github.com/activetwist/amphion-agent-extension`
  - Default branch: `main`
- Package output:
  - `amphion-agent-1.25.0.vsix` generated successfully.

## Marketplace Publish Assist Status
- Attempted publish command:
  - `npx @vscode/vsce publish --packagePath amphion-agent-1.25.0.vsix --pat "${VSCE_PAT:-}"`
- Result:
  - `ERROR  TF400813: The user 'aaaaaaaa-aaaa-aaaa-aaaa-aaaaaaaaaaaa' is not authorized to access this resource.`

## Blocker Analysis (Actionable)
- Marketplace publish is blocked by **publisher/token authorization mismatch**.
- Required operator actions:
  1. Ensure Marketplace publisher `active-twist` exists and your account is an owner/member.
  2. Generate a fresh Azure DevOps/VS Marketplace PAT authorized for Marketplace publishing.
  3. Login with publisher context and retry publish from extension folder:
     - `npx @vscode/vsce login active-twist`
     - `npx @vscode/vsce publish --packagePath amphion-agent-1.25.0.vsix`

## Acceptance Criteria Status
- [x] Extension-only public repository exists and contains only extension-relevant source tree.
- [x] Non-extension workspace content is not included in extension-only repo.
- [x] `package.json` repository URL aligned to extension-only target.
- [x] `1.25.0` package validation passes.
- [ ] Marketplace submission completed (blocked by authorization mismatch; actionable remediation documented).
- [x] Execute and walkthrough records created.

## Notes
- Non-blocking packaging warning remains: missing `LICENSE` file in extension root.
