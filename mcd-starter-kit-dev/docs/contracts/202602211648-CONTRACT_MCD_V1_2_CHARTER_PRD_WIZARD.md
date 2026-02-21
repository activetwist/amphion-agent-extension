# Contract: MCD Starter Kit v1.2 — Charter/PRD Wizard

Contract ID: `CT-20260221-OPS-015`
Date: `2026-02-21`

## Objective
Add an opt-in post-scaffold wizard that prompts the operator for Project Charter and PRD information immediately after the scaffold completes and the Command Deck launches.

## Authorized File Changes
- **[NEW]** `src/templates/charter.ts` — timestamped Charter template function
- **[NEW]** `src/templates/prd.ts` — timestamped PRD template function
- **[NEW]** `src/charterWizard.ts` — sequential input wizard collecting Charter/PRD fields
- **[MODIFY]** `src/scaffolder.ts` — invoke charterWizard after server launch
- **[MODIFY]** `package.json` — bump version to 1.2.0
- **[MODIFY]** `README.md` — document new feature

## Wizard Fields

### Project Charter (collected)
1. Target Users — who is this for?
2. Problem Statement — what problem does it solve?
3. Core Value Proposition — what is the primary value?
4. Hard Non-Goals — what is explicitly out of scope?

### High-Level PRD (collected)
5. Key Features (v1) — comma-separated list of initial capabilities
6. Success Metric — how will you measure success?

## Outputs
- `referenceDocs/01_Strategy/YYYYMMDDHHMM-PROJECT_CHARTER.md`
- `referenceDocs/01_Strategy/YYYYMMDDHHMM-HIGH_LEVEL_PRD.md`

## Acceptance Criteria
1. After scaffold, a notification asks: "Generate your Project Charter and PRD now?"
2. Operator can decline and proceed with empty stubs
3. If accepted, 6 prompts collect charter/PRD data
4. Both documents are written with correct timestamp prefixes
5. Documents are staged in a follow-up git commit
