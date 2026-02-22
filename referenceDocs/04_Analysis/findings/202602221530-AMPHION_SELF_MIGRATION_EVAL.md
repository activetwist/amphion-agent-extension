# EVALUATE: AmphionAgent Self-Migration (v1.24.3 Parity)

## 1. Research & Analysis
The user requested that we evaluate the current status of the `AmphionAgent` repository itself to ensure we are operating with the absolute most recent orchestration and Command Deck capabilities built into the extension payload.

**Findings:**
1. **Command Deck Parity**: The `AmphionAgent` repository's `ops/launch-command-deck/` directory is the canonical gold-standard source for the VSIX package. This directory *is* fully up-to-date and contains the `mtime` hot-reload and issue number fixes.
2. **Canonical Instruction Parity**: `referenceDocs/00_Governance/mcd/BOARD.md` is also fully up-to-date with the `issueNumber` execution schema.
3. **IDE Adapter Discrepancy**: The `AmphionAgent` root configuration files are stale. `AGENTS.md`, `CLAUDE.md`, and `.cursorrules` are missing the critical "Halt and Prompt" instructions added in `v1.24.0`, and they do not register the `BOARD.md` command. 
4. **Workflow Discrepancy**: The `AmphionAgent/.agents/workflows/` directory contains `evaluate`, `contract`, `execute`, `closeout`, `charter`, and `prd`. It is completely missing `board.md`.

## 2. Gap Analysis
The `AmphionAgent` extension generates modern, v1.24.3-compliant files when it scaffolds new projects. However, the `AmphionAgent` repository itself is failing to "eat its own dog food." Because the root repository files were not explicitly updated when the v1.24 capabilities were added to the extension's `src/templates/adapters.ts` string generator, any AI agent operating *on* `AmphionAgent` is executing against outdated rules.

## 3. Scoping & Action Plan (Self-Migration Strategy)
**In-Scope Migration Steps:**
To guarantee `AmphionAgent` achieves `v1.24.3` compliance, the agent will execute the following file synchronization:

1. **Rebuild IDE Adapters:**
   Overwrite `CLAUDE.md`, `AGENTS.md`, and `.cursorrules` in the root directory using the exact string template definitions found in `mcd-starter-kit-dev/extension/src/templates/adapters.ts`.
2. **Backfill Workflow:**
   Create `.agents/workflows/board.md` using the exact `renderAntigravityWorkflow('board')` template structure.

**Out-of-Scope:**
- Rebuilding the Command Deck (already canonical).
- Rebuilding `referenceDocs/00_Governance/mcd/`.

## 4. Primitive Review
No new primitives required. Leverages standard file manipulation.

## 5. Conclusion
**HALT.** Evaluation complete. `AmphionAgent` requires a self-migration of its IDE adapters and slash command workflows to achieve v1.24.3 compliance. Proceed to Execution upon Product Owner approval.
