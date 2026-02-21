# Contract: MCD Starter Kit v1.1

Contract ID: `CT-20260220-OPS-013`
Date: `2026-02-20`

## Objective
Implement two approved features for the MCD Starter Kit VSCode Extension:
1. Node.js server port of `server.py` (zero-dependency, stdlib only)
2. Existing project scaffolding with conflict detection and git branch safety

## Authorized File Changes

### Feature 1: Node.js Server
- **[NEW]** `ops/mcd-starter-kit/assets/launch-command-deck/server.js` — full API port
- **[MODIFY]** `ops/mcd-starter-kit/src/wizard.ts` — add server language prompt (Step 2/5)
- **[MODIFY]** `ops/mcd-starter-kit/src/scaffolder.ts` — launch correct server based on language selection

### Feature 2: Existing Project Support
- **[MODIFY]** `ops/mcd-starter-kit/src/scaffolder.ts` — conflict detection + git branch safety
- **[MODIFY]** `ops/mcd-starter-kit/src/extension.ts` — universal init prompt (not just empty folders)

### Documentation
- **[MODIFY]** `ops/mcd-starter-kit/README.md` — document both new features

## Acceptance Criteria
1. `node server.js --port 8765` serves the identical API surface as `python3 server.py --port 8765`
2. The wizard offers Python/Node.js choice and scaffolder launches the correct one
3. Running `MCD: Initialize New Project` in a non-empty folder triggers conflict detection
4. If `.git/` exists, user is offered an optional `mcd/init` branch
