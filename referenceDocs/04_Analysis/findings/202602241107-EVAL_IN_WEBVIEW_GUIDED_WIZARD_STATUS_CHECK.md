# EVALUATE: In-Webview Guided Wizard Status Check

**Phase:** 1 (Research & Scoping)  
**Date:** 2026-02-24  
**Codename:** `BlackClaw`

## 1. Research Snapshot
- Active contract exists but is still draft: `referenceDocs/03_Contracts/active/202602241054-CONTRACT_IN_WEBVIEW_GUIDED_WIZARD.md`.
- Handoff task list marks v1.28.0 execute tasks as incomplete.
- Local working tree contains partial uncommitted UI work in `mcd-starter-kit-dev/extension/src/onboardingWebview.ts`.
- No commit has been made after `v1.27.3` (`c1fe73e`).

## 2. Gap Analysis (Contract vs Current Code)
1. **18-field guided form**
   - Partially implemented in Webview HTML (`guided-view` exists with fields).
2. **Payload collection in Webview JS**
   - Missing `btn-submit-guided` listener and missing `vscode.postMessage` payload dispatch.
3. **Backend handler migration**
   - Still uses `startGuided` + `runGuidedWizard` native QuickPick/InputBox flow.
   - No `submitGuided` command handling path.
4. **Legacy cleanup**
   - `src/onboarding/guidedWizard.ts` still present and active.
5. **Release target**
   - `package.json` still at `1.27.3`; no `1.28.0` build/package evidence.

## 3. Scope Boundary
**In-Scope to complete contract**
- Finish guided Webview submit logic and field validation/mapping.
- Replace backend guided flow to accept Webview payload and generate foundation/artifacts directly.
- Delete `guidedWizard.ts`.
- Bump to `1.28.0`, compile, package, and verify.

**Out-of-Scope**
- Foundation schema redesign.
- Artifact template redesign.
- Non-SIP onboarding flows.

## 4. Primitive Review
No new architecture primitive is required. Existing `FoundationState` remains the canonical model; only collection/transport changes.

## 5. Current Status Determination
- **MCD phase status:** EVALUATE is complete for this checkpoint.
- **Contract status:** Draft exists and is not yet approved.
- **Execution status:** Not complete; current code is in a partial state where guided onboarding is likely non-functional from the new in-Webview path.

## 6. Verification Notes
- `npm run compile` succeeds on current workspace.
- Compile success does not validate Webview runtime behavior; guided submit path is still unimplemented.
