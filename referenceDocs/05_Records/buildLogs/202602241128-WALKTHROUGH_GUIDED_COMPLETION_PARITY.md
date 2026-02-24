# Walkthrough: Guided Completion Parity (v1.28.1)

## Objective
Validate that Guided onboarding completion no longer shows review prompts and now lands on the same completion screen pattern as quick onboarding.

## Preconditions
1. Install `mcd-starter-kit-dev/extension/amphion-agent-1.28.1.vsix`.
2. Run `MCD: Initialize New Project` in a test workspace.

## Steps
1. Complete project initialization.
2. Select `Start Guided Walkthrough`.
3. Fill required Guided fields and click `Generate Strategy Artifacts`.
4. Confirm no post-init review modal / quick-pick sequence appears.
5. Confirm success screen appears (same quick-onboarding success pattern).
6. Confirm CTA text is exactly `Launch Command Deck` (no trailing period).
7. Click `Launch Command Deck` and confirm launch behavior still works.

## Expected Result
- Guided completion is Command Deck-first, without redundant review prompts.
- User lands on the same in-webview success UI used by quick onboarding.
