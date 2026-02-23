# WALKTHROUGH: Extension-Only Repo and Marketplace Publish

## Goal
Keep public provenance scoped to extension source only, then publish `1.25.0` to Marketplace.

## Part A: Extension-Only Public Repo
1. Confirm target repo:
   - `activetwist/amphion-agent-extension`
2. Create repo if missing:
   - `gh repo create activetwist/amphion-agent-extension --public`
3. Export extension-only tree (exclude heavy/non-source artifacts):
   - from `mcd-starter-kit-dev/extension`
   - exclude `.git`, `node_modules`, `*.vsix`
4. Initialize and push extension-only `main`.
5. Verify remote root only includes extension files:
   - `src/`, `out/`, `assets/`, `package.json`, `README.md`, `CHANGELOG.md`, etc.

## Part B: Metadata + Package Validation
1. Ensure `package.json.repository.url` points to:
   - `https://github.com/activetwist/amphion-agent-extension.git`
2. Run package validation:
   - `npm run package`
3. Confirm artifact:
   - `amphion-agent-1.25.0.vsix`

## Part C: Marketplace Submission (Interactive)
1. Confirm publisher ownership:
   - Publisher ID: `active-twist`
2. Authenticate with publisher context:
   - `npx @vscode/vsce login active-twist`
3. Publish:
   - `npx @vscode/vsce publish --packagePath amphion-agent-1.25.0.vsix`

## Known Blocker Signature
If you hit:
`TF400813: user ... is not authorized to access this resource`
then PAT/publisher authorization is incorrect. Regenerate PAT and ensure account has access to publisher `active-twist`.
