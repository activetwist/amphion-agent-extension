# CONTRACT: Command Deck Mermaid Viewer Pan + Zoom

**Phase:** 2.0 (Contract)  
**Status:** Drafted (Pending Operator Approval)  
**Date:** 2026-02-23  
**Codename:** `BlackClaw`

**Source Evaluation:** `referenceDocs/04_Analysis/findings/202602232335-MERMAID_PAN_ZOOM_VIEWER_EVAL.md`

## 1. Goal
Implement a focused Mermaid viewer interaction upgrade for Command Deck that adds exactly two high-value capabilities without widening scope:
1. Pannable diagrams (drag to move within the viewer container)
2. Zoomable diagrams (wheel and minimal controls)

This contract intentionally avoids rebuilding Mermaid-site-level tooling and preserves existing rendering behavior.

## 2. Approved AFPs (Affected File Paths)
- `referenceDocs/03_Contracts/active/202602232354-CONTRACT_COMMAND_DECK_MERMAID_PAN_ZOOM_VIEWER.md` (this contract)
- `ops/launch-command-deck/public/app.js`
- `ops/launch-command-deck/public/styles.css`
- `ops/launch-command-deck/public/index.html` (optional; only if static control markup is required)
- `mcd-starter-kit-dev/extension/assets/launch-command-deck/public/app.js`
- `mcd-starter-kit-dev/extension/assets/launch-command-deck/public/styles.css`
- `mcd-starter-kit-dev/extension/assets/launch-command-deck/public/index.html` (optional)
- `mcd-starter-kit-dev/command-deck-source/public/app.js`
- `mcd-starter-kit-dev/command-deck-source/public/styles.css`
- `mcd-starter-kit-dev/command-deck-source/public/index.html` (optional)
- `ops/launch-command-deck/data/state.json` (board observability updates)
- `referenceDocs/05_Records/buildLogs/202602232354-EXECUTE_COMMAND_DECK_MERMAID_PAN_ZOOM_VIEWER.md`
- `referenceDocs/05_Records/buildLogs/202602232354-WALKTHROUGH_COMMAND_DECK_MERMAID_PAN_ZOOM_VIEWER.md`

## 3. Scope Boundaries
### In Scope
- Add idempotent post-render Mermaid SVG interaction wiring for pan and zoom.
- Maintain bounded transform state per rendered diagram (`scale`, `tx`, `ty`).
- Provide minimal viewer controls (Reset required; +/- optional).
- Add viewer/interaction CSS (viewport boundaries, cursor states, control layout).
- Ensure rerender safety across charts/guide/docs Mermaid rendering flows.
- Sync runtime and mirror copies in one contract slice to avoid drift.

### Out of Scope
- Mermaid authoring/editor features.
- Full navigation suite parity with mermaid.live.
- Backend/API/schema updates.
- New external pan/zoom dependency unless explicitly approved.

## 4. Deterministic Execution Plan
1. **Preflight + Active Contract Guard**
   - Validate no objective collision with active `202602231730-CONTRACT_WEBVIEW_DASHBOARD.md`.
   - Treat this contract as the sole authority for Mermaid interaction enhancement scope.
2. **Runtime Interaction Engine Pass**
   - Extend Mermaid render lifecycle in `app.js` to attach pan/zoom handlers after SVG render.
   - Implement pointer-drag pan, wheel zoom with clamp, and reset action.
   - Ensure idempotent setup to prevent duplicate listeners on rerender.
3. **Runtime Viewer UX Pass**
   - Add CSS for Mermaid viewport/stage behavior and interaction states.
   - Add minimal controls markup only if required by implementation strategy.
4. **Mirror Synchronization Pass**
   - Apply equivalent frontend updates to extension asset and command-deck-source copies.
   - Preserve each mirror’s existing script-loading approach while matching behavior.
5. **Verification + Evidence Pass**
   - Smoke-test Mermaid interaction in Charts, Guide, and Docs modal surfaces where present.
   - Validate no regressions in theme toggle, routing, and Mermaid rerender flows.
   - Record execute log and walkthrough artifacts in `referenceDocs/05_Records/buildLogs/`.

## 5. Risk Assessment
- **Scroll Conflict (Medium):** Wheel zoom may interfere with container scroll.
  - **Mitigation:** Restrict zoom handling to active Mermaid viewport hover context and clamp scale.
- **Rerender Listener Duplication (Medium):** Re-renders can attach duplicate handlers.
  - **Mitigation:** Add per-node initialization guard/idempotent attach routine.
- **Parity Drift (High):** Runtime/mirror mismatch if only one surface is patched.
  - **Mitigation:** Execute mirror synchronization in same contract slice and verify behavior parity.
- **Scope Creep (Low):** Expansion toward full Mermaid tooling.
  - **Mitigation:** Enforce strict two-feature scope (pan + zoom, with reset only).

## 6. Acceptance Criteria
- [ ] Mermaid diagrams can be dragged/panned within their viewer container.
- [ ] Wheel zoom functions with bounded scale and stable pointer-centered behavior.
- [ ] Reset returns diagram transform to default state.
- [ ] Interaction wiring remains stable after rerenders/theme changes (no duplicated handlers).
- [ ] Runtime and both mirror copies are synchronized for this feature slice.
- [ ] Charts/Guide/Docs Mermaid rendering remains functional with no blocking regressions.
- [ ] Execute log and walkthrough records are created in `referenceDocs/05_Records/buildLogs/`.

## 7. Work Item Mapping
- `AM-080`: Mermaid pan/zoom interaction engine
- `AM-081`: Mermaid viewer UX + styling
- `AM-082`: Mermaid parity + QA
- `AM-083`: Contract artifact + execute authorization gate

## 8. Active Contract Conflict Check
- Existing active contract: `referenceDocs/03_Contracts/active/202602231730-CONTRACT_WEBVIEW_DASHBOARD.md`
- Assessment: no direct AFP collision; objectives are distinct (VS Code webview dashboard creation vs frontend Mermaid viewer interaction upgrade).
- Guardrail action: execute Mermaid scope changes independently without modifying the dashboard contract objective.

## 9. Operator Approval Gate
Ready for execution upon explicit operator authorization.

Invoke execution with:
`/execute 202602232354-CONTRACT_COMMAND_DECK_MERMAID_PAN_ZOOM_VIEWER.md`
