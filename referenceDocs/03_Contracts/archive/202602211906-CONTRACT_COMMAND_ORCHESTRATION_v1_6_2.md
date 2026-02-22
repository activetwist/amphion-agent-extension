# CONTRACT · MCD Command Orchestration Refactor (v1.6.2)

**Phase:** 2 (Planning & Agreement)
**Status:** PROPOSED
**Codename:** `BlackClaw`

## Objective
Package all canonical MCD Phase Command files into a dedicated orchestration directory (`referenceDocs/00_Governance/mcd/`) and refactor all agent adapters, workflows, and extension scaffolding logic to reflect this new structural standard.

## Proposed Changes

### [Governance]
- **Move**: `referenceDocs/00_Governance/commands/*.md` -> `referenceDocs/00_Governance/mcd/`
- **DELETE**: `referenceDocs/00_Governance/commands/` (Post-move)

### [Adapters & Workflows]
- **Update**: `CLAUDE.md`, `AGENTS.md`, and `.cursorrules` to use the new `mcd/` path.
- **Update**: `.agents/workflows/*.md` (evaluate, contract, execute, closeout) to point to `mcd/`.

### [Extension Source]
- **MODIFY**: `src/scaffolder.ts` (Update DIRS and build logic)
- **MODIFY**: `src/templates/adapters.ts` (Update template link paths)
- **MODIFY**: `package.json` (Bump version to `1.6.2`)

## Acceptance Criteria
- [ ] Phase Command files reside in `referenceDocs/00_Governance/mcd/`.
- [ ] Root adapters (`CLAUDE.md`, etc.) contain correct relative paths to the new directory.
- [ ] Antigravity workflows (`/evaluate`, etc.) link to the correct `mcd/` files.
- [ ] Extension `package.json` is at version `1.6.2`.
- [ ] TypeScript compiles successfully (`npm run build`).
