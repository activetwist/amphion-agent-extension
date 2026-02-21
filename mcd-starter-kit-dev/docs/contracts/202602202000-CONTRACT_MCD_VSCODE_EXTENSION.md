# Contract: MCD Starter Kit VSCode Extension v1.0

Contract ID: `CT-20260220-OPS-012`
Date: `2026-02-20`
Project: `MCD Starter Kit`

## Objective
Build and package a distributable VSCode Extension (`mcd-starter-kit`) that allows an operator to initialize a full MCD project scaffold—including the Command Deck application—from an empty folder in VS Code via a single command.

## Authorized File Changes

### 1. Extension Project (New Directory)
Location: `ops/mcd-starter-kit/`

**Files to Create:**
- `package.json` — extension manifest with `mcd.init` command
- `tsconfig.json` — TypeScript configuration
- `.vscodeignore` — excludes dev artifacts from packaged `.vsix`
- `src/extension.ts` — `activate()` entrypoint, command registration
- `src/wizard.ts` — 4-step `showInputBox` wizard returning `ProjectConfig`
- `src/scaffolder.ts` — writes all directories, files, runs git init + terminal
- `src/templates/guardrails.ts` — `GUARDRAILS.md` template function
- `src/templates/playbook.ts` — static `MCD_PLAYBOOK.md` content export
- `assets/launch-command-deck/` — symlinked or copied Command Deck application

### 2. Command Deck Bundle
- The existing `ops/launch-command-deck/` will be copied into `ops/mcd-starter-kit/assets/launch-command-deck/` as the bundled application payload.

## Acceptance Criteria
1. Running `vsce package` from `ops/mcd-starter-kit/` produces a valid `.vsix` file.
2. Installing the `.vsix` and running `MCD: Initialize New Project` walks through 4 prompts.
3. The workspace is fully scaffolded with the correct directory structure.
4. The Command Deck server starts in the integrated terminal.
5. `git init` + initial commit fires automatically after scaffold is complete.
