# CONTRACT: README Positioning + Screenshot Packaging Alignment

**Phase:** 2 (Planning & Agreement)  
**Date:** 2026-02-24  
**Status:** DRAFT (Awaiting Approval)  
**Codename:** `BlackClaw`

## 1. Objective
Upgrade the extension shipping README so it clearly communicates AmphionAgent value, includes validated product screenshots (explicitly including Charts Viewer), and aligns manifest/packaging behavior for stable Marketplace-ready rendering.

## 2. Source Evaluations
- `referenceDocs/04_Analysis/findings/202602241804-README_SHIPPING_COPY_UPDATE_EVAL.md`
- `referenceDocs/04_Analysis/findings/202602241806-README_POSITIONING_AND_SCREENSHOTS_EVAL.md`
- `referenceDocs/04_Analysis/findings/202602241842-EVAL_README_SCREENSHOTS_20260224_INCLUSION.md`

## 3. Conflict Flag (Active Contract Overlap)
Potential overlap with any active work touching extension release docs/metadata surfaces.

Execution guardrail:
- Do not run concurrently with any other execute phase that modifies `mcd-starter-kit-dev/extension/README.md` or `mcd-starter-kit-dev/extension/package.json`.
- Apply as a single documentation + packaging validation slice.

## 4. Scope Boundaries
**In-Scope**
- Rewrite README opening narrative to better communicate audience, purpose, and outcome.
- Add concise structure clarifying what AmphionAgent does, who it is for, and how the 5-phase MCD flow works.
- Update Install copy to reference current stable VSIX line (`amphion-agent-1.28.1.vsix`).
- Update Requirements copy to:
  - `AI-Enabled VS Code-based IDE`
  - `Git`
  - `Local runtime for Command Deck server: Python 3`
- Include screenshot section with captions using canonical assets and explicit inclusion of:
  - `01-Project-Onboarding.png`
  - `02-Kanban-Board.png`
  - `04-Charts-Viewer.png` (required)
  - `05-IDE-Control-Panel.png`
- Copy selected screenshots into extension-root media path for deterministic packaging.
- Validate packaging output to confirm README image links and screenshot assets are included in VSIX.
- Apply targeted manifest copy improvement (`description`/keywords) only if needed for alignment with README value proposition.

**Out-of-Scope**
- Extension runtime code changes.
- UX feature implementation changes.
- Marketplace publish action.
- New screenshot capture sessions outside provided canonical set.

## 5. Affected File Paths (AFPs)
**Modify**
- `mcd-starter-kit-dev/extension/README.md`
- `mcd-starter-kit-dev/extension/package.json` *(optional, manifest copy alignment only)*

**Create**
- `mcd-starter-kit-dev/extension/media/screenshots/20260224/01-Project-Onboarding.png`
- `mcd-starter-kit-dev/extension/media/screenshots/20260224/02-Kanban-Board.png`
- `mcd-starter-kit-dev/extension/media/screenshots/20260224/04-Charts-Viewer.png`
- `mcd-starter-kit-dev/extension/media/screenshots/20260224/05-IDE-Control-Panel.png`

**Potential Generated Output**
- `mcd-starter-kit-dev/extension/amphion-agent-1.28.1.vsix` *(packaging validation artifact)*

## 6. Implementation Plan
See:
- `referenceDocs/03_Contracts/active/202602241845-IMPLEMENTATION_PLAN_README_POSITIONING_SCREENSHOT_PACKAGING_ALIGNMENT.md`

## 7. Acceptance Criteria
- [ ] README opening clearly states AmphionAgent purpose, target user, and outcomes.
- [ ] README includes a concise 5-phase workflow explanation.
- [ ] Install section references `amphion-agent-1.28.1.vsix` as current release example.
- [ ] Requirements section matches AI-enabled IDE + Git + Python 3 only.
- [ ] README screenshot section includes `01`, `02`, `04` (Charts Viewer), and `05` with meaningful captions.
- [ ] Screenshot assets are present under extension-root `media/screenshots/20260224/` and referenced via relative README paths.
- [ ] VSIX packaging validation confirms screenshot files and README image links are preserved.
- [ ] No runtime behavior/code changes are introduced.

## 8. Risks & Mitigations
- **Risk:** Image links fail in packaged or Marketplace rendering.
  **Mitigation:** keep assets in extension root and use relative paths validated in packaged artifact.
- **Risk:** README copy drifts from actual product behavior.
  **Mitigation:** tie wording to existing shipped capabilities only; no speculative claims.
- **Risk:** Screenshot payload increases package size.
  **Mitigation:** include only curated canonical set (4 images) and monitor VSIX size delta.
- **Risk:** Rapid UI iteration makes screenshots stale.
  **Mitigation:** canonical naming/date path and explicit refresh trigger in future release notes.

## 9. Verification Plan
- Automated:
  - `npm run package` (extension root)
- Manual:
  1. Open README in extension root and confirm narrative + install/requirements changes.
  2. Confirm all four screenshot files exist under `media/screenshots/20260224/`.
  3. Confirm README image paths resolve locally.
  4. Inspect packaged VSIX file list and verify screenshot assets are included.
  5. Verify no `src/` runtime files changed.

## 10. Approval Required
Operator approval required. If approved, execute by referencing this contract filename.
