# Implementation Plan: Guided Completion Parity (Command Deck-First)

## Overview
This plan removes the redundant post-init review prompt sequence from Guided onboarding and aligns Guided completion UX with the existing quick onboarding success state.

## Planned Changes

### 1. Guided Completion Control Flow
#### [MODIFY] `mcd-starter-kit-dev/extension/src/onboardingWebview.ts`
- Remove import and invocation of `promptPostInitReview` from the `submitGuided` message handler.
- After Guided artifact generation succeeds, send the same webview message used by quick onboarding completion (`manualComplete`) instead of leaving the webview flow.
- Keep existing terminal `git add` / `git commit` behavior unchanged.

### 2. Completion Screen CTA Text
#### [VERIFY/MODIFY if needed] `mcd-starter-kit-dev/extension/src/onboardingWebview.ts`
- Ensure success CTA label is exactly `Launch Command Deck` with no trailing period.
- Confirm no alternate guided-specific success button introduces punctuation drift.

### 3. Release Metadata
#### [MODIFY] `mcd-starter-kit-dev/extension/package.json`
- Bump patch version from `1.28.0` to `1.28.1`.

## Verification Plan

### Automated
1. Run `npm run compile`.

### Packaging
1. Build `amphion-agent-1.28.1.vsix`.

### Manual
1. Initialize project and select Guided onboarding.
2. Complete Guided form and click `Generate Strategy Artifacts`.
3. Verify no review modal/quickpick sequence appears.
4. Verify success state matches quick onboarding pattern.
5. Verify CTA text: `Launch Command Deck`.
6. Verify CTA launches Command Deck.
