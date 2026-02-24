# EVALUATE: README Screenshot Set (`screenshots/20260224`) for Manifest + Packaging Inclusion

**Date:** 2026-02-24 18:42 UTC  
**Phase:** Evaluate (Research & Scoping)  
**Status:** Complete

## Request
Evaluate screenshot assets in `screenshots/20260224` for inclusion in extension README and Marketplace packaging/manifest flow.

## Assets Reviewed
- `01-Project-Onboarding.png` (1280x1043, 205 KB)
- `02-Kanban-Board.png` (1440x702, 300 KB)
- `03-Dashboard.png` (3982x1940, 909 KB)
- `04-Charts-Viewer.png` (3982x1926, 738 KB)
- `05-IDE-Control-Panel.png` (3012x1940, 721 KB)

All files are PNG (Marketplace-compatible image format).

## Inclusion Assessment
1. **01-Project-Onboarding.png**
   - **Recommendation:** Include (Primary)
   - **Why:** Strongly communicates first-run setup and project bootstrap outcome.

2. **02-Kanban-Board.png**
   - **Recommendation:** Include (Primary)
   - **Why:** Clearly demonstrates operational planning surface and active task workflow.

3. **03-Dashboard.png**
   - **Recommendation:** Optional / Secondary
   - **Why:** Good surface coverage, but partially redundant with Board + IDE control panel narrative.

4. **04-Charts-Viewer.png**
   - **Recommendation:** Include (Secondary)
   - **Why:** Shows Mermaid/architecture visualization capability not obvious in other screenshots.

5. **05-IDE-Control-Panel.png**
   - **Recommendation:** Include (Primary)
   - **Why:** Best proof that AmphionAgent is IDE-native and controls MCD flow from inside the host.

## Recommended README Set
Use 3 primary images for clarity and brevity:
- `01-Project-Onboarding.png`
- `02-Kanban-Board.png`
- `05-IDE-Control-Panel.png`

Optional 4th image for architecture/chart depth:
- `04-Charts-Viewer.png`

## Manifest + Packaging Evaluation
### Current State
- Extension manifest has valid `repository` field (`package.json`) and standard packaging script.
- `.vscodeignore` does **not** exclude media/screenshot folders by default.

### Inclusion Guidance
- For deterministic packaging and local VSIX rendering, screenshot assets should live **inside** extension root (not workspace-level `screenshots/` only).
- Recommended destination:
  - `mcd-starter-kit-dev/extension/media/screenshots/20260224/`
- README should reference relative paths from extension root (e.g. `./media/screenshots/20260224/01-Project-Onboarding.png`).

### Packaging Impact
- If all 5 are included, added payload is ~2.87 MB.
- This increase is acceptable for Marketplace/VSIX distribution and materially improves listing quality.

## Risks
- **Readability drift:** very wide images can render with small text on Marketplace cards.
- **Product drift:** screenshots can become stale after UI updates.
- **Link drift:** README image paths fail if files stay outside extension root.

## Scope Recommendation for Contract
### In-Scope
- Copy selected screenshots into extension-root media folder.
- Add README screenshot section with meaningful captions.
- Keep Install/Requirements updates aligned with current stable release policy.
- Validate package includes screenshot assets and README links resolve.

### Out-of-Scope
- Runtime code changes.
- New UX implementation work.

## Proposed Acceptance Criteria
- Selected screenshots are stored under extension root and referenced by README relative paths.
- README renders at least 3 screenshots with captions tied to core extension value.
- Package validation confirms image assets and README links survive VSIX packaging.
- No runtime/feature behavior changes.
