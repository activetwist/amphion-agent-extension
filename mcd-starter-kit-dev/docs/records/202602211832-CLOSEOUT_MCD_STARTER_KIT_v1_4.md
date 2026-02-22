# Closeout Record: MCD Starter Kit v1.4.0

Date: `2026-02-21`
Contract Executed: `CT-20260221-OPS-017`

## Execution Summary

Closed the UX gap in the source-documents Charter/PRD wizard path. After selecting "Import source documents," the extension previously wrote stub files and emitted a passive notification with no actionable follow-up. The operator had no in-context instruction on how to invoke an AI agent to complete the stubs.

Two targeted fixes were delivered:

1. **Embedded agent prompt directives** in both stub templates — a `[!NOTE]` block containing a ready-to-copy agent instruction appears immediately after the `[!IMPORTANT]` source file list. The prompt is agent-agnostic and instructs the agent to derive each `*[Derive from source documents]*` section from the helperContext files.

2. **Actionable closing notification** — the passive `showInformationMessage` was replaced with a two-button notification ("Open Charter" / "Open PRD") that opens the stub file directly in the VS Code editor, putting the agent prompt in immediate view.

## Deliverables

### Modified Files
- `src/templates/charterStub.ts` — `[!NOTE]` agent prompt block added (Charter-specific instructions)
- `src/templates/prdStub.ts` — `[!NOTE]` agent prompt block added (PRD-specific instructions)
- `src/charterWizard.ts` — Passive notification replaced with two-button actionable notification; `Open Charter` and `Open PRD` buttons open the respective stub in VS Code editor
- `package.json` — Version bumped to `1.4.0`

## Acceptance Criteria Verification

- [x] Both stub templates contain `[!NOTE]` agent prompt block after `[!IMPORTANT]` alert
- [x] Prompt text is accurate and complete for Charter and PRD variants
- [x] Closing notification includes "Open Charter" and "Open PRD" action buttons
- [x] Buttons open the correct timestamped files via `vscode.workspace.openTextDocument`
- [x] Manual 6-prompt path (`runManualPath`) is unaffected — zero changes made to it
- [x] TypeScript compiled with zero errors (`./node_modules/.bin/tsc -p ./ --noEmit`)
- [x] `package.json` version is `1.4.0`

## Compliance
- [x] Contract archived to `03_Contracts/archive/`
- [x] Work matched contract scope exactly
- [x] Closeout record created
- [x] Git commit completed
