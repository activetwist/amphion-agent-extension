# Contract: MCD Starter Kit v1.5 — Explicit MCD Command Files

Contract ID: `CT-20260221-OPS-018`
Date: `2026-02-21`
Base Version: `1.4.0`
Target Version: `1.5.0`

---

## Objective

Scaffold a set of canonical MCD command definition files into every new project workspace, giving operators an explicit, invokable instruction surface for each MCD phase verb (Evaluate, Contract, Execute, Closeout). These command files serve as the "API layer" — agent-agnostic, structured Markdown definitions that any supported Agentic IDE can consume. Thin environment adapter files route from each IDE's native convention to the canonical command definitions. Priority delivery is for Antigravity. Claude Code, ChatGPT Codex, and Cursor adapters are in scope but secondary.

---

## Authorized File Changes

| File | Action | Purpose |
|---|---|---|
| `src/templates/commands.ts` | **[NEW]** | Exports four command template functions: `renderEvaluate`, `renderContract`, `renderExecute`, `renderCloseout` |
| `src/templates/adapters.ts` | **[NEW]** | Exports adapter content for `CLAUDE.md`, `AGENTS.md`, and `.cursorrules` |
| `src/scaffolder.ts` | **[MODIFY]** | Write command files + adapters during scaffold build |
| `package.json` | **[MODIFY]** | Bump version to `1.5.0` |
| `README.md` | **[MODIFY]** | Document MCD command file system and adapter files |

---

## Behavioral Specification

### Directory Created by Scaffold

```
referenceDocs/00_Governance/commands/
├── EVALUATE.md
├── CONTRACT.md
├── EXECUTE.md
└── CLOSEOUT.md
```

### Command File Schema

Each file uses the following structure with YAML frontmatter:

```markdown
---
command: [evaluate|contract|execute|closeout]
phase: [1|2|3|4]
description: [one-line description]
---

# MCD: [Phase Name]

## When to Use
[Condition under which the operator invokes this command]

## Inputs Required
- [List of required context before running]

## Agent Instructions
[Numbered, deterministic steps the agent must follow]

## Output
[Artifact produced — filename pattern + destination directory]
```

### Command Definitions

**EVALUATE.md**
- When: Start of any new work cycle, or when current state is unknown
- Agent instructions: Read active board + referenceDocs, examine relevant workspace files, write findings to `referenceDocs/04_Analysis/findings/YYYYMMDDHHMM-EVAL_[TOPIC].md`. No implementation code during Evaluate.
- Output: `referenceDocs/04_Analysis/findings/YYYYMMDDHHMM-EVAL_[TOPIC].md`

**CONTRACT.md**
- When: Evaluation findings are sufficient to scope the next piece of work
- Agent instructions: Draft a contract referencing the evaluation findings, listing exact files affected, goal, out-of-scope items, and acceptance criteria. Write to `referenceDocs/03_Contracts/active/YYYYMMDDHHMM-CONTRACT_[NAME].md`. Operator must approve before execution.
- Output: `referenceDocs/03_Contracts/active/YYYYMMDDHHMM-CONTRACT_[NAME].md`

**EXECUTE.md**
- When: Operator has approved an active contract
- Agent instructions: Read the active contract. Implement exactly what is authorized — no more, no less. If unexpected scope is required, stop and amend the contract first.
- Output: Files specified in the active contract

**CLOSEOUT.md**
- When: All acceptance criteria in the active contract are met
- Agent instructions: (1) Archive the contract to `03_Contracts/archive/`, (2) Write a closeout record to `05_Records/YYYYMMDDHHMM-CLOSEOUT_[VERSION].md`, (3) Stage all artifacts and run `git commit -m "closeout: {VERSION} {brief description}"`.
- Output: Archived contract + closeout record + git commit

### Project-Specific Interpolation

All four command files are interpolated at scaffold time with:
- `{projectName}` — inserted in file headers
- `{codename}` — inserted in commit message examples
- `{initialVersion}` — inserted in output path examples

### Environment Adapter Files

**Primary — Antigravity:**
Directory: `.agents/workflows/`
Files created: `evaluate.md`, `contract.md`, `execute.md`, `closeout.md`

Each workflow file contains YAML frontmatter (`description`) and a single instruction:
```markdown
---
description: Run MCD Evaluate phase
---
Follow the instructions in `referenceDocs/00_Governance/commands/EVALUATE.md` exactly.
```

**Secondary — Claude Code:**
File: `CLAUDE.md` (project root)
Content: Project name, codename, MCD methodology summary, and a routing table mapping phase verbs to command files in `referenceDocs/00_Governance/commands/`.

**Secondary — ChatGPT Codex:**
File: `AGENTS.md` (project root)
Content: Same structure as `CLAUDE.md`, using Codex's preferred file naming convention.

**Secondary — Cursor:**
File: `.cursorrules` (project root)
Content: Lightweight routing rule — when operator says a phase verb, read the corresponding command file.

> **Note:** `.cursorrules` parsing varies by Cursor version. The canonical command files are the stable layer; `.cursorrules` is a best-effort adapter.

---

## Acceptance Criteria

1. All four command files are written to `referenceDocs/00_Governance/commands/` on scaffold
2. Each command file has correct YAML frontmatter, all four sections (When, Inputs, Instructions, Output), and correct project interpolation
3. `.agents/workflows/` contains four workflow files that route to the corresponding command files
4. `CLAUDE.md` is written to project root with routing table and MCD context
5. `AGENTS.md` is written to project root
6. `.cursorrules` is written to project root
7. No existing scaffold files are modified or overwritten by adapter file creation
8. TypeScript compiles with zero errors
9. `package.json` version is `1.5.0`
