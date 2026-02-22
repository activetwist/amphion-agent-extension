# Contract: MCD Starter Kit v1.5 — Canonical Command Files

**Contract ID:** `CT-20260221-OPS-018`
**Version:** `1.5.0`
**Status:** `DRAFT`

## Objective

Formalize the Micro-Contract Development (MCD) protocol by scaffolding explicit command definitions into every new project. This contract establishes a single source of truth for MCD phase instructions (`EVALUATE`, `CONTRACT`, `EXECUTE`, `CLOSEOUT`) and provides thin adapter layers for various AI agent environments (Antigravity, Claude Dev, Cursor), ensuring the MCD protocol is agent-agnostic and portable.

## Proposed Changes

### 1. Command Definitions (Canonical)
[NEW] Scaffold four files into `referenceDocs/00_Governance/commands/`:
- `EVALUATE.md`: Instructions for researching and scoping.
- `CONTRACT.md`: Instructions for formalizing the plan.
- `EXECUTE.md`: Instructions for implementation and testing.
- `CLOSEOUT.md`: Instructions for archiving and reporting.

Each file will follow a strict MCD structure:
- **YAML Frontmatter**: Title, Version, Phase, and Inputs.
- **When to Use**: Entry criteria for the phase.
- **Inputs**: Required context and documents.
- **Instructions**: Step-by-step procedural logic for the AI agent.
- **Output**: Exit criteria and expected deliverables.

### 2. Agent Adapters (Routing)
[NEW] Scaffold routing files to point agents toward the canonical commands:
- `.agents/workflows/`: Four workflow files (`evaluate.md`, `contract.md`, `execute.md`, `closeout.md`) for Antigravity that invoke the canonical MD files.
- `CLAUDE.md`: Routing table and context for Claude Dev/Cody.
- `AGENTS.md`: Generic agent instructions for LLM-based tools.
- `.cursorrules`: Ruleset for Cursor AI.

### 3. Interpolation
Update the scaffolder logic to interpolate the `PROJECT_NAME` and `CODENAME` into all generated command and adapter files.

## Acceptance Criteria

- [ ] All four command files exist in `referenceDocs/00_Governance/commands/` after scaffolding.
- [ ] Each command file contains the correct YAML frontmatter and all four standard sections.
- [ ] `.agents/workflows/` contains four routing workflow files.
- [ ] `CLAUDE.md`, `AGENTS.md`, and `.cursorrules` are created in the project root.
- [ ] No existing files are overwritten during scaffolding.
- [ ] `PROJECT_NAME` and `CODENAME` are correctly interpolated in all new files.
- [ ] `package.json` version is updated to `1.5.0`.
- [ ] TypeScript compiles with zero errors (`npm run build`).

## Authorized Files
- `src/scaffolder.ts` (or equivalent scaffolding logic)
- `src/templates/*` (new templates for commands and adapters)
- `package.json`
