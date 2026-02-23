# WALKTHROUGH: Playbook Drift Remediation and v1.25.0 Rebuild

## Goal
Ensure fresh scaffolds from the rebuilt `1.25.0` package show the updated 5-phase MCD Guide content.

## Steps
1. Install rebuilt package:
   - `mcd-starter-kit-dev/extension/amphion-agent-1.25.0.vsix`
2. Create a fresh test workspace/folder.
3. Run `MCD: Initialize New Project`.
4. Complete onboarding and launch Command Deck.
5. Open **MCD Guide** and verify content markers:
   - `The "Halt and Prompt" Safety Rail`
   - `The 5-Phase Sequence & IDE Slash Commands`
   - `@[/board]` phase appears between Evaluate and Contract.
6. Confirm no stale heading appears:
   - `The 4-Phase Lifecycle` should not be present.

## Expected Results
- Fresh scaffolded environment reflects updated 5-phase playbook text.
- `/board` appears in playbook lifecycle guidance.
- Package installs and initializes without regression in onboarding flow.

## Rollback (if needed)
- Reinstall prior known-good VSIX build for temporary testing continuity.
- Re-open contract phase for template/content reconciliation if any drift remains.
