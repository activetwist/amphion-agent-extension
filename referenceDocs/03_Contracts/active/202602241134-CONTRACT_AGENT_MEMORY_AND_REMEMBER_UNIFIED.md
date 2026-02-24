# CONTRACT: Agent Memory + `/remember` Unified Integration

**Phase:** 2 (Planning & Agreement)  
**Date:** 2026-02-24  
**Status:** DRAFT (Awaiting Approval)  
**Codename:** `BlackClaw`

## 1. Objective
Implement the combined findings from `202602241054-EVAL_AGENT_MEMORY_AND_REMEMBER_COMBINED_FINDINGS.md` as one cohesive delivery slice:
1. Deterministic compact memory lifecycle (`referenceDocs/06_AgentMemory/agent-memory.json`).
2. `/remember` as a utility command for controlled mid-stage memory capture.
3. Governance and scaffold/template updates so behavior is consistent in generated projects and adapter surfaces.

## 2. Source Evaluation
- `referenceDocs/04_Analysis/findings/202602241054-EVAL_AGENT_MEMORY_AND_REMEMBER_COMBINED_FINDINGS.md`

## 3. Contract Conflict / Supersession Notes
Active-contract overlaps:
- `referenceDocs/03_Contracts/active/202602241021-CONTRACT_AGENT_MEMORY_DIRECTORY_AND_CLOSEOUT_HYGIENE.md` (same domain, overlapping AFPs)
- `referenceDocs/03_Contracts/active/202602240946-CONTRACT_SIP1_ONBOARDING.md` (possible overlap on `scaffolder.ts`)

Execution for this contract should be treated as a **superseding unified slice** for memory + `/remember` scope. Overlapping older contract should not execute in parallel.

## 4. Scope Boundaries
**In-Scope**
- Create canonical memory directory and compact memory file (`06_AgentMemory`).
- Define bounded memory schema and update policy (mandatory closeout + controlled `/remember`).
- Add canonical `referenceDocs/00_Governance/mcd/REMEMBER.md` command.
- Add `/remember` action/button in Command Deck dashboard UX.
- Update governance docs and extension templates to include memory + `/remember` policy.
- Extend scaffold/adapter generation to emit remember workflows across supported surfaces.
- Add closeout hygiene validator script including memory checks.
- Add architecture primitive documenting lifecycle, precedence, and constraints.

**Out-of-Scope**
- Cloud/vector memory services.
- Autonomous periodic background memory writes.
- Full historical backfill of old projects.
- New backend API dedicated solely to `/remember` if prefill pattern is sufficient.

## 5. Affected File Paths (AFPs)
**Modify**
- `mcd-starter-kit-dev/extension/src/commandDeckDashboard.ts`
- `mcd-starter-kit-dev/extension/src/scaffolder.ts` *(overlap risk with SIP-1 contract)*
- `mcd-starter-kit-dev/extension/src/templates/adapters.ts`
- `mcd-starter-kit-dev/extension/src/templates/guardrails.ts`
- `mcd-starter-kit-dev/extension/src/templates/playbook.ts`
- `mcd-starter-kit-dev/extension/src/templates/commands.ts`
- `referenceDocs/00_Governance/GUARDRAILS.md`
- `referenceDocs/00_Governance/MCD_PLAYBOOK.md`
- `referenceDocs/00_Governance/mcd/CLOSEOUT.md`

**Create**
- `referenceDocs/06_AgentMemory/agent-memory.json`
- `referenceDocs/06_AgentMemory/README.md`
- `referenceDocs/00_Governance/mcd/REMEMBER.md`
- `referenceDocs/04_Analysis/scripts/validate_closeout_hygiene.py`
- `referenceDocs/02_Architecture/primitives/YYYYMMDDHHMM-AGENT_MEMORY_LIFECYCLE_PRIMITIVE.md`

**Generated/Derived (via scaffold/templates)**
- `.agents/workflows/remember.md`
- `.cursor/commands/remember.md`
- `.cursor/rules/remember.mdc`
- `.windsurf/workflows/remember.md`

## 6. Implementation Plan
See:
- `referenceDocs/03_Contracts/active/202602241134-IMPLEMENTATION_PLAN_AGENT_MEMORY_AND_REMEMBER_UNIFIED.md`

## 7. Acceptance Criteria
- [ ] `referenceDocs/06_AgentMemory/agent-memory.json` exists and conforms to compact bounded schema (`v`, `upd`, `cur`, bounded `hist`).
- [ ] Governance docs explicitly define `/remember` as utility-only (not lifecycle phase).
- [ ] Governance docs define mandatory closeout memory update and controlled mid-stage update triggers.
- [ ] `referenceDocs/00_Governance/mcd/REMEMBER.md` exists and is aligned with guardrails/playbook language.
- [ ] Command Deck dashboard includes a `/remember` action that supports command prefill behavior.
- [ ] Adapter/scaffold outputs include remember workflow files for supported IDE surfaces.
- [ ] Hygiene validator includes memory artifact checks and passes on repository.
- [ ] Architecture primitive documents memory lifecycle and precedence rules.
- [ ] Overlap sequencing/supersession for `202602241021` and `scaffolder.ts` risk is explicitly resolved before execute starts.

## 8. Risks & Mitigations
- **Risk:** Memory bloat and context drift.  
  **Mitigation:** hard file-size and per-array caps, dedup, bounded `hist`.
- **Risk:** Lifecycle confusion (`/remember` mistaken as phase).  
  **Mitigation:** explicit utility-only language in REMEMBER + playbook/guardrails.
- **Risk:** Contract overlap and merge conflict in scaffolding/template files.  
  **Mitigation:** run this as superseding unified scope and sequence away from concurrent overlapping execute phases.
- **Risk:** Generated adapter inconsistency across IDE targets.  
  **Mitigation:** centralize generation in templates + scaffold verification checklist.

## 9. Verification Plan
- Static checks:
  - Validate `agent-memory.json` parses and respects schema caps.
  - Run `referenceDocs/04_Analysis/scripts/validate_closeout_hygiene.py`.
- Governance parity:
  - Confirm Guardrails, Playbook, CLOSEOUT, REMEMBER command are aligned.
- Template/scaffold parity:
  - Generate/inspect adapter outputs and ensure remember workflows exist for `.agents/.cursor/.windsurf`.
- Dashboard UX:
  - Verify `/remember` action appears and produces expected chat prefill behavior.

## 10. Approval Required
Operator review required. If approved, execute by referencing this contract filename and confirm whether it supersedes `202602241021-CONTRACT_AGENT_MEMORY_DIRECTORY_AND_CLOSEOUT_HYGIENE.md`.
