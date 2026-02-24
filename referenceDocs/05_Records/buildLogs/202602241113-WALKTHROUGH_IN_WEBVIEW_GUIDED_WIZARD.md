# Walkthrough: In-Webview Guided Wizard (v1.28.0)

## Objective
Validate that SIP-1 guided onboarding runs fully inside the onboarding webview and produces strategy artifacts without VS Code QuickPick/InputBox interruptions.

## Preconditions
1. Install `mcd-starter-kit-dev/extension/amphion-agent-1.28.0.vsix`.
2. Run `MCD: Initialize New Project` in a test workspace.

## Test Steps
1. Complete Project Initialization and click `Initialize Project`.
2. On strategy selection screen, click `Start Guided Walkthrough`.
3. Confirm guided form view appears in-webview with sections A-H and 18 fields.
4. Fill all required fields and select at least one option in each multi-select list.
5. Click `Generate Strategy Artifacts`.
6. Confirm no native `showQuickPick` / `showInputBox` prompts appear.
7. Confirm files are generated under `referenceDocs/01_Strategy/`:
   - `foundation.json` (or timestamped foundation variant if collision handling was selected)
   - `*-PROJECT_CHARTER.md`
   - `*-HIGH_LEVEL_PRD.md`
8. Confirm onboarding panel closes and post-init review prompt sequence appears.

## Expected Result
- Guided flow is webview-native end-to-end.
- `FoundationState` artifacts are generated from webview payload.
- Legacy guided native prompt chain is no longer reachable.
