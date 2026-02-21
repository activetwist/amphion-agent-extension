# Closeout Record: MCD Starter Kit VSCode Extension (Source Complete)

Date: `2026-02-20`
Contract Executed: `CT-20260220-OPS-012`

## Execution Summary
Built the complete TypeScript source for the **Micro-Content Development Starter Kit** VSCode Extension. All modules compiled with zero errors.

### Deliverables
**Extension Directory**: `ops/mcd-starter-kit/`

|File|Purpose|
|---|---|
|`package.json`|Extension manifest: `mcd.init` command, activation events|
|`tsconfig.json`|TypeScript compilation config|
|`src/extension.ts`|`activate()` entrypoint, command registration, empty-folder UX prompt|
|`src/wizard.ts`|4-step `showInputBox` wizard returning typed `ProjectConfig`|
|`src/scaffolder.ts`|Full scaffold engine: writes dirs, governance docs, copies Command Deck, runs `git init`, launches server, opens browser|
|`src/templates/guardrails.ts`|`GUARDRAILS.md` template function w/ dynamic interpolation|
|`src/templates/playbook.ts`|Static `MCD_PLAYBOOK.md` export (includes updated 'Local Only' rule)|
|`assets/launch-command-deck/`|Bundled Command Deck application payload|

## Pending: .vsix Packaging
- **Status**: Blocked on Node.js version
- **Required**: Node v18 or v20 (system currently has v16)
- **Action**: Operator installs Node v20 (via nvm or nodejs.org), then runs `npm run package` from `ops/mcd-starter-kit/`

## Compliance Verification
- [x] All active contracts archived.
- [x] Work strictly matched contract scope.
- [x] Closeout record created.
- [x] Git commit completed.
