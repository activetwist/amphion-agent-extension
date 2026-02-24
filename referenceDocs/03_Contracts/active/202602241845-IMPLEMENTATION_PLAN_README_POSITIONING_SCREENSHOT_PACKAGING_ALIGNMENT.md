# Implementation Plan: README Positioning + Screenshot Packaging Alignment

## Overview
Implement a documentation-quality release slice that improves Marketplace positioning, ships curated screenshots (including Charts Viewer), and validates package integrity without runtime code changes.

## Planned Changes

### 1. Curate and Stage Screenshot Assets
#### [CREATE] `mcd-starter-kit-dev/extension/media/screenshots/20260224/*`
- Copy canonical screenshots from workspace source into extension-root media path.
- Include exactly:
  - `01-Project-Onboarding.png`
  - `02-Kanban-Board.png`
  - `04-Charts-Viewer.png`
  - `05-IDE-Control-Panel.png`

### 2. Rewrite README Positioning Narrative
#### [MODIFY] `mcd-starter-kit-dev/extension/README.md`
- Strengthen opening value proposition and target-audience framing.
- Add concise “How It Works” explanation for the 5 MCD phases.
- Add screenshot section with outcome-oriented captions.

### 3. Align Install + Requirements Copy
#### [MODIFY] `mcd-starter-kit-dev/extension/README.md`
- Replace VSIX examples with current stable release line:
  - `amphion-agent-1.28.1.vsix`
- Update requirements to:
  - AI-Enabled VS Code-based IDE
  - Git
  - Local runtime for Command Deck server: Python 3

### 4. Manifest Copy Alignment (Optional)
#### [MODIFY IF NEEDED] `mcd-starter-kit-dev/extension/package.json`
- Adjust `description` and/or keywords only if needed to align extension card copy with README narrative.
- No behavioral metadata changes (activation/events/commands) in this contract.

### 5. Packaging Validation
#### [VERIFY] extension packaging output
- Run extension package build.
- Confirm screenshot assets and README image references survive VSIX packaging.

## Verification Plan

### Automated
1. `npm run package` (from `mcd-starter-kit-dev/extension`)

### Manual
1. Review README sections for positioning clarity and factual correctness.
2. Confirm screenshot files exist in extension media folder.
3. Validate markdown image paths are relative and valid.
4. Inspect VSIX contents for `media/screenshots/20260224/*`.
5. Confirm no runtime source files changed.
