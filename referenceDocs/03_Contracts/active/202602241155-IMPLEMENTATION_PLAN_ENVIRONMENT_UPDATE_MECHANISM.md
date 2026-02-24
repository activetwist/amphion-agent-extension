# Implementation Plan: Environment Update Mechanism (Release Stabilization)

## Overview
Add safe, idempotent environment migration that keeps generator-owned project surfaces in sync with extension version updates while protecting user-authored docs.

## Planned Changes

### 1. Version Metadata in Scaffold
#### [MODIFY] `mcd-starter-kit-dev/extension/src/scaffolder.ts`
- Persist `mcdVersion` to `ops/amphion.json` during initial scaffold.
- Use extension package version as source of truth.

### 2. Activation-Time Update Detection
#### [MODIFY] `mcd-starter-kit-dev/extension/src/extension.ts`
- On activation (when `referenceDocs` exists), read `ops/amphion.json` and compare `mcdVersion` with extension version.
- If stale/missing, display non-blocking prompt:
  - `Update Environment`
  - `Later`
- Persist defer state (workspace-state key) so user is not repeatedly prompted every startup.

### 3. Deterministic Migration Function
#### [MODIFY] `mcd-starter-kit-dev/extension/src/scaffolder.ts`
- Add `migrateEnvironment(root, extensionUri, options)` function:
  - Preflight dirty-repo check (`git status --porcelain`) and warning.
  - Apply strict allowlist update for generator-owned files only:
    - governance/command docs under `referenceDocs/00_Governance/`
    - adapter surfaces (`AGENTS.md`, `CLAUDE.md`, `.cursorrules`, `.clinerules`, workflow command files)
    - memory/governance additions (`referenceDocs/00_Governance/mcd/REMEMBER.md`, `referenceDocs/06_AgentMemory/*`)
  - Update `ops/amphion.json` `mcdVersion` only on successful completion.

### 4. Idempotency and Safety
#### [MODIFY] `mcd-starter-kit-dev/extension/src/scaffolder.ts`
- Ensure repeated migrations produce stable outputs.
- Avoid touching user content (`01_Strategy`, `03_Contracts`, `05_Records`).

### 5. Optional Typing Alignment
#### [MODIFY IF REQUIRED] `mcd-starter-kit-dev/extension/src/wizard.ts`
- Add optional type support for `mcdVersion` where config parsing/typing benefits from explicit field presence.

## Verification Plan

### Automated
1. `npm run compile`

### Manual
1. Set test workspace `ops/amphion.json` with stale `mcdVersion`.
2. Reload extension and confirm update prompt + defer behavior.
3. Apply migration and confirm only allowlist files changed.
4. Confirm `mcdVersion` matches extension version after migration.
5. Confirm user strategy/contracts/records unchanged.
