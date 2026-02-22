# Evaluation: Packaging Agent Command Files & Orchestration Refactor

## Research Findings
- **Current Structure**: MCD Phase Command files (EVALUATE, CONTRACT, EXECUTE, CLOSEOUT) are located in `referenceDocs/00_Governance/commands/`.
- **Adapters & Workflows**: These files contain hardcoded absolute and relative paths pointing to the `commands/` directory.
- **Scaffolder**: The extension's `src/scaffolder.ts` explicitly creates the `commands` directory and writes the templates there.

## Gap Analysis
- While `commands/` is functional, it lacks semantic distinction as a "protocol" or "orchestration" layer.
- As the system grows, `00_Governance` could become cluttered. Grouping these protocol-driving files into a dedicated directory (e.g., `mcd/`) improves project clarity and enforces the "orchestration" mental model.

## Proposed Structure
- **New Path**: `referenceDocs/00_Governance/mcd/`
- **Adapters**: `CLAUDE.md`, `AGENTS.md`, and `.cursorrules` will be updated to point to the new `mcd/` path.
- **Workflows**: Antigravity workflows in `.agents/workflows/` will be updated to point to the new `mcd/` path.
- **Extension**: `scaffolder.ts` and `adapters.ts` will be refactored to enforce this new structure for all future projects.

## Scoping
- **In-Scope**: Moving existing files, updating all links/paths, updating extension source code, and verifying the new orchestration flow.
- **Out-of-Scope**: Changing the content of the command files themselves (only paths change).
