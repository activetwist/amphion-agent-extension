# CLOSEOUT: AmphionAgent v1.21.0 — Slash Command Onboarding Flow 🚀🏗️

**Release ID**: 202602220145-CLOSEOUT_AMPHIONAGENT_v1_21_0
**Version**: `1.21.0`
**Protocol**: MCD 2.1 (Deterministic Onboarding Rails)

## Executive Summary
This release completes the transformation of the onboarding experience from a "Copy-Paste" technical hurdle to a "Slash-Command" architectural flow. By leveraging the agentic workflow system, we have drastically reduced the friction of project initialization while maintaining total methodology integrity.

## Core Features Delivered
1. **Automated Onboarding Rails**:
   - `/charter`: Deterministically reads `helperContext/` and populates the Project Charter stub.
   - `/prd`: Deterministically derives the High-Level PRD and performs strategy document cleanup.
2. **Onboarding UX Refactor**:
   - Refactored the `OnboardingPanel` to focus on guidance over technical payloads.
   - Eliminated large prompt code blocks in favor of a guided command sequence.
3. **Workflow Scaffolding**:
   - Updated the `Scaffolder` to deploy `.agents/workflows/charter.md` and `prd.md` by default.

## Verification Proof
- **Build**: Successfully packaged as `amphion-agent-1.21.0.vsix`.
- **Infrastructure**: Verified `adapters.ts` rendering and `scaffolder.ts` file writing.
- **Documentation**: Updated the "Soup to Nuts" Pre-Release Build Notes to include Slash Command Rails.

## Deployment Checklist
- [x] Version Bump to 1.21.0
- [x] Implementation Plan Complete (CT-041)
- [x] Webview UX Refactored
- [x] Templates Simplified
- [x] VSIX Packaged
- [x] Walkthrough Updated

**Next Milestone**: v1.22.0 — (TBD - Operational Stabilization)
