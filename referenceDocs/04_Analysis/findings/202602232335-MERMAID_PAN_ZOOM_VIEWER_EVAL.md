# EVALUATION: Mermaid Viewer Pan + Zoom Capability

**Phase:** 1 (Evaluate)  
**Status:** Complete  
**Date (UTC):** 2026-02-23T23:35:04Z  
**Codename:** `BlackClaw`

## 1. Objective
Assess how to add two features to the Mermaid viewer with minimal regression risk:
1. Pannable chart area (drag to move diagram in its viewer container)
2. Zoomable chart area

Constraint from operator intent: keep implementation lightweight and focused; do not rebuild Mermaid-site-level functionality.

## 2. Current State (Research)
### Runtime (`ops/launch-command-deck/public`)
- Mermaid render flow is centralized in `renderMermaidBlocks(container)` and called from:
  - Charts preview panel rendering
  - Guide document rendering
  - Docs modal rendering
- Mermaid currently renders diagrams but no pan/zoom interaction layer exists after render.
- No Mermaid-specific viewport CSS exists (`styles.css` has no `.mermaid` interaction selectors).

### Mirror Copies
- `mcd-starter-kit-dev/extension/assets/launch-command-deck/public` has the same richer Mermaid pipeline (charts + guide + docs modal).
- `mcd-starter-kit-dev/command-deck-source/public` has Mermaid rendering for guide/docs but no charts view and older direct `mermaid.init` usage pattern.
- Script sourcing differs:
  - runtime uses local vendor assets (`/vendor/marked.min.js`, `/vendor/mermaid.min.js`)
  - mirror copies currently use CDN script URLs for marked/mermaid

## 3. Gap Analysis
1. **Interaction gap:** No drag/pan handlers and no zoom controls/wheel behavior are attached to rendered Mermaid SVG.
2. **Viewport gap:** Rendered diagrams are not wrapped in an explicit pan/zoom viewport/stage model.
3. **Lifecycle gap:** Mermaid diagrams are rerendered on theme/view changes; any interaction model must be idempotent and reattach safely.
4. **Parity gap:** Runtime and mirror copies are functionally similar but not identical; patching only one surface will recreate drift.

## 4. Feasible Implementation Direction (Minimal + Safe)
### Recommended
Implement a small native pan/zoom layer in frontend JS (no external package requirement):
- After Mermaid render, detect rendered SVG nodes.
- Wrap each SVG in a dedicated viewport/stage structure (or attach transform state to parent container).
- Maintain per-diagram transform state: `{scale, tx, ty}`.
- Pan: pointer drag on diagram surface.
- Zoom: wheel zoom centered on pointer with clamped scale range (for example `0.4` to `3.0`).
- Add quick reset action (`Reset`) and optional `+/-` controls.
- Ensure event wiring is idempotent across rerenders.

### Why this path
- Meets operator request directly (pan + zoom).
- Avoids introducing an additional external runtime dependency.
- Keeps scope constrained to viewer interaction and styling.

## 5. Scope Definition
### In Scope (for contract)
- Add pan + zoom interactions to Mermaid diagram viewer(s).
- Add minimal viewer UI affordances (reset, optional +/- controls).
- Add CSS for viewport boundaries and cursor states.
- Apply to runtime plus designated mirror copy set to avoid drift.

### Out of Scope
- Full Mermaid editor or navigation UI parity with mermaid.live.
- Diagram authoring feature changes.
- Backend/API/schema changes.
- Multi-touch gesture suite beyond practical baseline unless explicitly requested.

## 6. Risks and Mitigations
- **Scroll conflict risk (Medium):** Wheel zoom can conflict with container scroll.
  - Mitigation: zoom only while pointer is over active SVG viewport and clamp behavior; preserve parent scrolling outside viewport.
- **Rerender binding risk (Medium):** Theme toggles/reloads can orphan interaction handlers.
  - Mitigation: idempotent attach routine and per-node initialization guard.
- **Parity drift risk (High):** runtime/mirror divergence if only one copy patched.
  - Mitigation: include mirror AFPs in same contract.
- **Usability overreach risk (Low):** feature scope balloons toward full diagram tooling.
  - Mitigation: enforce two-feature scope only (pan + zoom + reset).

## 7. Primitive Review
No new architecture primitive is required. This is a frontend interaction enhancement within existing rendering surfaces.

## 8. Contract-Ready Slices
1. **Interaction Engine Slice**
   - Build idempotent Mermaid pan/zoom attach function in `app.js`.
2. **Viewer UX Slice**
   - Add viewport/control styling and minimal controls in `styles.css` (and `index.html` only if static controls are chosen).
3. **Parity + Verification Slice**
   - Synchronize runtime and mirrors; verify charts/guide/docs Mermaid behavior and no regressions in existing navigation.

## 9. Candidate AFPs (for contract)
- `ops/launch-command-deck/public/app.js`
- `ops/launch-command-deck/public/styles.css`
- `ops/launch-command-deck/public/index.html` (optional; only if static control markup is used)
- `mcd-starter-kit-dev/extension/assets/launch-command-deck/public/app.js`
- `mcd-starter-kit-dev/extension/assets/launch-command-deck/public/styles.css`
- `mcd-starter-kit-dev/extension/assets/launch-command-deck/public/index.html` (optional)
- `mcd-starter-kit-dev/command-deck-source/public/app.js`
- `mcd-starter-kit-dev/command-deck-source/public/styles.css`
- `mcd-starter-kit-dev/command-deck-source/public/index.html` (optional)
- `ops/launch-command-deck/data/state.json` (observability cards)

## 10. Bottom Line
This request is feasible and can be implemented safely as a focused viewer interaction enhancement. The cleanest path is a lightweight native pan/zoom layer attached after Mermaid renders, with parity sync across Command Deck frontend copies.
