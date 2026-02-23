# Evaluate Findings: Extension Architecture Mermaid Test

**Timestamp:** 2026-02-22 19:32 local  
**Phase:** EVALUATE  
**Codename:** `BlackClaw`

## User Request
Create and test a Mermaid architecture chart for the extension, ideally visible in the Core Reference Library path (temporarily acceptable).

## Research Summary
1. **Mermaid rendering pipeline is present and active**
   - `ops/launch-command-deck/public/index.html` loads `mermaid.min.js`.
   - `ops/launch-command-deck/public/app.js` calls `mermaid.init(...)` when rendering Guide and docs modal content.
2. **Core Reference Library docs currently contain no Mermaid blocks**
   - API checks for `charter`, `prd`, `guardrails`, `contract`, `playbook` return valid content, but no ` ```mermaid ` blocks.
   - This explains "no charts" despite working renderer.
3. **Architecture source mapping for extension is clear**
   - Entry/command registration: `src/extension.ts`
   - Orchestration/scaffold generation: `src/scaffolder.ts`
   - Onboarding flow/webview UX: `src/onboardingWebview.ts`
   - Wizard data model/input capture: `src/wizard.ts`
   - Template generators (commands/playbook/guardrails/etc.): `src/templates/*`

## Gap Analysis
- Missing element is **diagram content**, not rendering capability.
- Core Reference Library does not have a dedicated "Architecture" button; it surfaces specific docs only.

## Scoping
### In Scope (next phase candidate)
- Add a temporary Mermaid extension-architecture diagram to a Core Reference Library-backed doc (`guardrails` or active `contract`) for immediate visual test.
- Optionally add a permanent architecture primitive doc in `referenceDocs/02_Architecture/primitives/` and link it through an existing surfaced doc for ongoing visibility.
- Verify chart appears as rendered SVG in Dashboard doc modal (not raw markdown code fence).

### Out of Scope
- Reworking Dashboard to add a new Core Reference Library button (unless separately contracted).
- Broader UI redesign.

## Proposed Architecture Diagram Coverage
- VS Code command activation (`mcd.init`)
- Onboarding webview interaction and message handoff
- Scaffold pipeline (dir/doc/template/deck copy)
- Command Deck launch path and runtime selection (Node/Python)
- Artifact outputs (`referenceDocs`, `.cursor`, `.agents`, `ops/launch-command-deck`)

## Conclusion
You can absolutely test Mermaid now. The deterministic path is to add a temporary Mermaid diagram block to a doc already exposed in Core Reference Library, then validate rendering in the Dashboard modal.
