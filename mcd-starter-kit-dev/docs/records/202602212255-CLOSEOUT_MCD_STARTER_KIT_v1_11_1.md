# Closeout Record: MCD Starter Kit v1.11.1 — WebUI Focus & Prompt Refinements

**Date:** 2026-02-21
**Version:** `1.11.1` (CT-030)
**Status:** COMPLETED

## Summary of Changes

Resolved a UX breaking issue where the newly generated Strategy documents would steal active focus away from the Agent Handoff WebUI, and added a clear callback instruction to the Charter derivation prompt.

### WebUI Focus Preservation
- **Action**: Updated the `vscode.window.showTextDocument` calls in `charterWizard.ts`.
- **Implementation**: Injected the `{ viewColumn: vscode.ViewColumn.Beside, preserveFocus: true, preview: false }` configuration object. 
- **Result**: The Project Charter now opens smoothly in a split pane adjacent to the Onboarding Webview, allowing the user to view the generated document while seamlessly maintaining interactive focus on the WebUI to complete the prompt sequence.

### Agent Callback Instruction
- **Action**: Modified the `getCharterAgentInstruction` export in `charterStub.ts`.
- **Implementation**: Appended: *"Finally, when you have finished writing the Project Charter, tell the user exactly this: 'The Project Charter is complete. Please return to the MCD Onboarding WebUI to copy and paste the High-Level PRD derivation prompt.'"*
- **Result**: The AI agent is now explicitly responsible for guiding the user back to the WebUI to execute Step 2 in the sequential process, establishing a closed-loop interactive flow.

## Verification Results

### Build Verification
- [x] Extension compiled via `tsc` with no errors.
- [x] `vsce package` generated `mcd-starter-kit-1.11.1.vsix`.

## Release Metadata
- **Modified Files**: `charterWizard.ts`, `charterStub.ts`, `package.json`.
- **Commit Hash**: `v1.11.1`
