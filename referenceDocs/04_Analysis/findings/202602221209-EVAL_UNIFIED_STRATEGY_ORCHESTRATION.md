# Research Findings: Surgical Strategy Consolidation (v1.24.0)

## Objective
Consolidate `/charter` and `/prd` into a single `/docs` command to simplify the onboarding flow without introducing the regressions seen in v1.23.x.

## Analysis of v1.22.1 (Restored Baseline)
- **Init Success**: Project initialization completes correctly.
- **Separate Commands**: `/charter` and `/prd` exist as separate workspace commands.
- **Sequential UI**: The webview uses a multi-step "Done" button approach.

## Gap Analysis
The multi-step process is functional but adds friction. The previous attempt (v1.23.0) failed likely due to over-engineering the scaffolder (recursion/non-blocking experiments).

## Proposed Surgical Orchestration
A single `/docs` command will be introduced. It will strictly concatenate the existing instructions into a single workflow.

### Unified `/docs` Content
1. **Source Discovery**: Read files in `helperContext/`.
2. **Charter Derivation**: Populate `referenceDocs/01_Strategy/` Charter placeholders.
3. **PRD Derivation**: Populate `referenceDocs/01_Strategy/` PRD placeholders (aligned with Charter).
4. **Resilience Cleanup**: Remove stubs and introductory instructions from both documents.
5. **Phase Handoff**: Explicit instruction to return to WebUI.

## Risk Assessment
The primary risk is re-introducing the initialization hang. By keeping `scaffolder.ts` logic identical to v1.22.1 (aside from the command list) and avoiding circular imports, we minimize this risk.

## Acceptance Criteria
- [ ] `/docs` command replaces `/charter` and `/prd` in all IDEs.
- [ ] Onboarding Webview presents a single-step `/docs` instruction.
- [ ] Initialization completing triggers the Webview's "Strategy Selection" view as expected.
- [ ] No regression of the "Initializing..." hang.
