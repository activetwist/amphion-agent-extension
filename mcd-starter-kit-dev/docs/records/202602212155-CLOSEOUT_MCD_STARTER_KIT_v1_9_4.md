# Closeout Record: MCD Starter Kit v1.9.4 — External Browser and Agent Trigger Fix

**Date:** 2026-02-21
**Version:** `1.9.4` (CT-027)
**Status:** COMPLETED

## Summary of Changes

Resolved two critical UX gaps in the "Product Owner" evaluation phase regarding IDE focus trapping and passive agent failures.

### External OS Browser Enforcement
- **Action**: Bypassed `vscode.env.openExternal` due to its inability to break out of Agent IDE internal webview tabs for `localhost` URLs.
- **Implementation**: Refactored `launchCommandDeck()` in `scaffolder.ts` to utilize Node's `child_process.exec`.
- **Flow**: Used an `os.platform()` switch to execute the native OS launch commands (`open`, `start`, `xdg-open`). This forces the Command Deck Kanban board to launch in the user's primary desktop browser (e.g., Chrome, Safari) as requested, preserving the IDE for agent interactions.

### Agent Handoff Clipboard Trigger
- **Action**: Re-introduced a lightweight clipboard copy mechanism to solve the issue of AI agents failing to passively read the embedded `[!AGENT INSTRUCTION]` blocks.
- **Implementation**: Updated `charterWizard.ts` to copy a specific payload (`"Please read the [!AGENT INSTRUCTION] block in this file and derive the Project Charter."`) directly to the OS clipboard before opening the final transition modal.
- **UX Sequence**: The user now finishes the Webview flow, the Strategy stub opens, and the final modal alerts them that a trigger has been copied. The user only needs to click into the AI chat and hit Paste (Cmd/Ctrl+V) to begin the derivation process, significantly reducing cognitive load.

## Verification Results

### Build Verification
- [x] Extension compiled via `tsc` with no errors.
- [x] verified `child_process` and `os` imports execute correctly.
- [x] `vsce package` generated `mcd-starter-kit-1.9.4.vsix`.

## Release Metadata
- **Modified Files**: `scaffolder.ts`, `charterWizard.ts`, `package.json`.
- **Commit Hash**: `v1.9.4`
