# EVALUATE: README Positioning + Screenshots Upgrade

**Date:** 2026-02-24 18:06 UTC  
**Phase:** Evaluate (Research & Scoping)  
**Status:** Complete

## Request
Evaluate how to improve the shipped README so it better communicates what AmphionAgent is for, and confirm whether screenshots can be added.

## Research Inputs
- `mcd-starter-kit-dev/extension/README.md`
- `mcd-starter-kit-dev/extension/package.json`
- `mcd-starter-kit-dev/extension/.vscodeignore`
- VS Code official publishing guidance:
  - `https://code.visualstudio.com/api/working-with-extensions/publishing-extension`
  - `https://code.visualstudio.com/api/references/extension-manifest`

## Findings
1. **Current README undersells outcome and audience.**
   - It describes generated files, but does not strongly articulate the business outcome: deterministic AI delivery governance with Command Deck visibility and controlled phase gates.
   - It lacks a crisp "who this is for" framing and "when to use" guidance.

2. **Current README lacks proof-oriented visuals.**
   - No screenshots/GIFs of guided onboarding, generated workspace structure, or Command Deck.
   - This weakens first-impression clarity in Marketplace and in-IDE details panel.

3. **Yes, screenshots are supported.**
   - Official guidance confirms README content is shown on Marketplace and supports relative image links.
   - Security constraints apply:
     - README image URLs must resolve to `https`.
     - README images cannot be SVG (except trusted badge providers).
   - With a public GitHub `repository` field, `vsce` adjusts relative links; base URLs can be overridden via `--baseImagesUrl`/`--baseContentUrl`.

4. **Current metadata can still under-communicate value.**
   - `package.json.description` is functional but generic. This affects extension-card copy and discoverability even if README improves.
   - This is adjacent optimization, not required to solve the README request.

## Gap Analysis
- **Positioning Gap:** README explains mechanics more than outcomes.
- **Narrative Gap:** No concise "problem -> solution -> result" story.
- **Evidence Gap:** No screenshots to substantiate UX and trust.
- **Decision Gap:** New users cannot quickly decide fit in under 20-30 seconds.

## Recommended README Direction
1. Start with a **strong value proposition** (1 short paragraph):
   - What AmphionAgent does, for whom, and what pain it removes.
2. Add **Who It's For / Not For** section.
3. Add **What You Get in <5 Minutes** section (concrete artifacts + outcomes).
4. Add **How It Works** section with the 5 MCD phases and operator-gated progression.
5. Add **Screenshots** section:
   - Guided onboarding screen
   - Command Deck dashboard
   - Generated `referenceDocs/` scaffold snapshot
6. Keep **Install/Requirements** current and minimal.
7. End with **Trust + Safety posture** (local runtime, deterministic workflow, explicit approval gates).

## Screenshot Feasibility and Constraints
### Feasible
- Add PNG screenshots to extension docs/assets and reference via Markdown in README.
- Use either:
  - Relative paths (preferred with public GitHub repository and `vsce` rewrite), or
  - Absolute `https` image URLs.

### Constraints
- Do not use SVG screenshots.
- Ensure image links resolve over `https` for Marketplace validation.
- Keep screenshots crisp and legible in both dark/light themes where possible.

## Scope Recommendation for Next Contract
### In-Scope
- Rewrite README narrative sections for stronger positioning.
- Add screenshot section and embed 2-3 PNG screenshots.
- Update Install/Requirements wording per latest release posture (if not already completed in separate contract).

### Optional (if approved)
- Improve `package.json.description` and keywords for Marketplace card clarity.

### Out-of-Scope
- Extension runtime logic changes.
- Workflow behavior changes.
- Packaging/publishing execution.

## Primitive Review
No new Architecture Primitive required. This is presentation/documentation quality alignment.

## Proposed Acceptance Criteria (for Contract)
- README opens with clear audience + outcome-oriented value proposition.
- README includes at least 2 screenshots that render in Marketplace-compliant manner.
- README includes a concise "How It Works" 5-phase section.
- README keeps install and requirements aligned to current release policy.
- No runtime code changes.
