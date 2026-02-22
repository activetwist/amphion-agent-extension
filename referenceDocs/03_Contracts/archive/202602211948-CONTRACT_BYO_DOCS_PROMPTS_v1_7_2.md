# CONTRACT · BYO Docs Prompt Refinement (v1.7.2)

**Phase:** 2 (Planning & Agreement)
**Status:** PROPOSED
**Codename:** `BlackClaw`

## Objective
Refine the BYO Docs derivation flow so the AI prompts explicitly list the source files to be reviewed. Enhance the UX by utilizing the OS clipboard directly, removing the need for manual selection in an input box.

## Proposed Changes

### [Wizard]
- **MODIFY**: `charterWizard.ts` to construct `charterPrompt` and `prdPrompt` with interpolated `copiedFileNames`.
- **IMPROVE**: Implement `vscode.env.clipboard.writeText` within a `while` loop that guarantees prompt delivery via a `showInformationMessage` with "Copy Again" and "Next Step" buttons.

### [Strategy Templates]
- **UPDATE**: `charterStub.ts` to include the explicit file list in the embedded Agent Prompt.
- **UPDATE**: `prdStub.ts` to include the explicit file list in the embedded Agent Prompt.

### [Metadata]
- **BUMP**: `package.json` to version `1.7.2`.

## Acceptance Criteria
- [ ] User's clipboard is automatically populated with the Charter prompt after importing docs.
- [ ] Charter prompt explicitly lists the source documents by name (e.g., `- requirements.txt`).
- [ ] A dialog allows the user to re-copy the prompt or proceed to the PRD.
- [ ] Proceeding to the PRD automatically copies the PRD prompt to the clipboard.
- [ ] PRD prompt explicitly lists the source documents by name.
- [ ] Project builds successfully.
