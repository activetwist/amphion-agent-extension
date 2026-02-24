# Implementation Plan: Agent Memory + `/remember` Unified Integration

## Overview
Deliver one deterministic memory system with governance-backed closeout updates and utility-level `/remember` checkpoints, propagated through dashboard UX and adapter/scaffold outputs.

## Planned Workstreams

### 1. Canonical Memory Artifacts
#### [CREATE]
- `referenceDocs/06_AgentMemory/agent-memory.json`
- `referenceDocs/06_AgentMemory/README.md`

Actions:
- Define compact schema with bounded arrays and rolling `hist` window.
- Document file budget/caps and dedup expectations.

### 2. Governance + Command Definitions
#### [MODIFY]
- `referenceDocs/00_Governance/GUARDRAILS.md`
- `referenceDocs/00_Governance/MCD_PLAYBOOK.md`
- `referenceDocs/00_Governance/mcd/CLOSEOUT.md`

#### [CREATE]
- `referenceDocs/00_Governance/mcd/REMEMBER.md`

Actions:
- Mark `/remember` as utility-only command.
- Define mandatory closeout memory update and controlled mid-stage triggers.
- Align wording across guardrails/playbook/commands.

### 3. Extension Templates + Scaffold Propagation
#### [MODIFY]
- `mcd-starter-kit-dev/extension/src/templates/adapters.ts`
- `mcd-starter-kit-dev/extension/src/templates/guardrails.ts`
- `mcd-starter-kit-dev/extension/src/templates/playbook.ts`
- `mcd-starter-kit-dev/extension/src/templates/commands.ts`
- `mcd-starter-kit-dev/extension/src/scaffolder.ts`

Actions:
- Emit remember workflow files for supported adapter surfaces.
- Ensure scaffold creates baseline memory directory/file.

### 4. Dashboard `/remember` UX
#### [MODIFY]
- `mcd-starter-kit-dev/extension/src/commandDeckDashboard.ts`

Actions:
- Add `/remember` UI action.
- Route action to prefill command in chat flow without phase transition side-effects.

### 5. Validation + Primitive
#### [CREATE]
- `referenceDocs/04_Analysis/scripts/validate_closeout_hygiene.py`
- `referenceDocs/02_Architecture/primitives/YYYYMMDDHHMM-AGENT_MEMORY_LIFECYCLE_PRIMITIVE.md`

Actions:
- Add deterministic checks for memory artifact presence/shape and closeout hygiene.
- Document lifecycle precedence and usage constraints.

## Verification Plan

### Automated / Static
1. Run memory/hygiene validator script.
2. Parse-check `agent-memory.json` and enforce cap constraints.
3. Compile extension (`npm run compile`).

### Manual
1. Verify dashboard `/remember` action appears and triggers prefill UX.
2. Verify scaffolded outputs include remember workflow files in `.agents/.cursor/.windsurf`.
3. Verify closeout command/governance docs consistently require memory updates.

## Sequencing Constraint
Before Execute:
- Confirm supersession handling for overlapping active contract:
  - `202602241021-CONTRACT_AGENT_MEMORY_DIRECTORY_AND_CLOSEOUT_HYGIENE.md`
- Confirm no concurrent execute is touching `scaffolder.ts`.
