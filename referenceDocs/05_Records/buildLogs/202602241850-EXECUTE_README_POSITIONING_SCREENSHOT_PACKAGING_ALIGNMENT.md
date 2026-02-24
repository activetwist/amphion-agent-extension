# EXECUTE LOG: README Positioning + Screenshot Packaging Alignment

**Date (UTC):** 2026-02-24T18:50:00Z  
**Contract:** `referenceDocs/03_Contracts/active/202602241845-CONTRACT_README_POSITIONING_SCREENSHOT_PACKAGING_ALIGNMENT.md`

## AFP Compliance
### Modified
- `mcd-starter-kit-dev/extension/README.md`
- `mcd-starter-kit-dev/extension/package.json`

### Created
- `mcd-starter-kit-dev/extension/media/screenshots/20260224/01-Project-Onboarding.png`
- `mcd-starter-kit-dev/extension/media/screenshots/20260224/02-Kanban-Board.png`
- `mcd-starter-kit-dev/extension/media/screenshots/20260224/04-Charts-Viewer.png`
- `mcd-starter-kit-dev/extension/media/screenshots/20260224/05-IDE-Control-Panel.png`

### Generated
- `mcd-starter-kit-dev/extension/amphion-agent-1.28.1.vsix`

## Implementation Completed
1. Rewrote README opening copy to improve value proposition, audience fit, and outcome framing.
2. Added concise 5-phase “How It Works” section.
3. Updated install copy to current release line (`amphion-agent-1.28.1.vsix`).
4. Updated requirements to:
   - AI-Enabled VS Code-based IDE
   - Git
   - Local runtime for Command Deck server: Python 3
5. Added screenshot section with required canonical images, explicitly including Charts Viewer (`04-Charts-Viewer.png`).
6. Staged screenshots inside extension-root media path for deterministic packaging.
7. Updated manifest copy (`description` + keywords) to align with README positioning.
8. Packaged extension and validated screenshot assets + README image links inside VSIX.

## Verification
### Automated
- `npm run package` (extension root): PASS with environment preload shim for Node 16 compatibility

### Manual
- Verified screenshot files exist under `media/screenshots/20260224/`.
- Inspected VSIX file list and confirmed all four screenshot assets are included.
- Inspected packaged `extension/README.md` and confirmed screenshot links resolve to `https` GitHub raw URLs after `vsce` rewrite.
- Confirmed no runtime source files were edited as part of this contract.

## Contract Criteria Mapping
- [x] README opening clearly states AmphionAgent purpose, target user, and outcomes.
- [x] README includes a concise 5-phase workflow explanation.
- [x] Install section references `amphion-agent-1.28.1.vsix` as current release example.
- [x] Requirements section matches AI-enabled IDE + Git + Python 3 only.
- [x] README screenshot section includes `01`, `02`, `04` (Charts Viewer), and `05` with meaningful captions.
- [x] Screenshot assets are present under extension-root `media/screenshots/20260224/` and referenced via relative README paths.
- [x] VSIX packaging validation confirms screenshot files and README image links are preserved.
- [x] No runtime behavior/code changes are introduced.

## Notes
- Default `npm run package` failed under local Node `v16.15.0` due missing web globals in transitive `undici` path.
- Packaging succeeded by running with `NODE_OPTIONS=--require /tmp/vsce-web-stream-polyfill.cjs` (runtime-only shim; no repo code changes required).
