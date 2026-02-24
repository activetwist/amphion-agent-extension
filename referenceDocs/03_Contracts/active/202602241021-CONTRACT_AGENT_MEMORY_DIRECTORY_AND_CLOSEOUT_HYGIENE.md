# CONTRACT: Agent Memory Directory + Closeout Hygiene Enforcement

**Phase:** 2 (Planning & Agreement)  
**Date:** 2026-02-24  
**Status:** DRAFT (Awaiting Approval)  
**Codename:** `BlackClaw`

## 1. Objective
Implement a deterministic, agent-optimized memory mechanism and stricter closeout artifact hygiene by:
1. Adding a dedicated agent memory directory (`referenceDocs/06_AgentMemory/`).
2. Managing a single compact machine-readable memory file (`agent-memory.json`) with bounded context density.
3. Enforcing closeout hygiene through governance updates and a validation gate.

## 2. Source Evaluations
- `referenceDocs/04_Analysis/findings/202602241003-EVAL_CLOSEOUT_ARTIFACT_HYGIENE_AND_STAGE_MEMORY_COMPACTOR.md`
- `referenceDocs/04_Analysis/findings/202602241018-EVAL_AGENT_MEMORY_DIRECTORY_AND_COMPACT_CONTEXT_DENSITY.md`

## 3. Conflict Flag (Active Contract Overlap)
There is an active contract:
- `referenceDocs/03_Contracts/active/202602240946-CONTRACT_SIP1_ONBOARDING.md`

Potential AFP overlap:
- `mcd-starter-kit-dev/extension/src/scaffolder.ts`
- `ops/launch-command-deck/scripts/init_command_deck.py` (only if memory seeding is added there)

Guardrail constraint: execution must avoid conflicting edits unless this contract is explicitly sequenced after SIP-1 completion or approved as a superseding scope.

## 4. Scope Boundaries
**In-Scope**
- Update governance and command definitions to require memory artifact generation/update at closeout.
- Define and scaffold `referenceDocs/06_AgentMemory/` and `agent-memory.json`.
- Define compact schema, size/cap constraints, and update triggers (mandatory closeout, controlled mid-stage optional).
- Add a closeout hygiene validation script for deterministic checks.
- Propagate updated behavior into extension templates/scaffold defaults for new projects.

**Out-of-Scope**
- Vector memory, embeddings, or cloud memory services.
- Multi-file memory architectures.
- Automatic backfill of all historical records into memory snapshots.
- Full Command Deck runtime API changes unless specifically needed by acceptance criteria.

## 5. Affected File Paths (AFPs)
**Modify**
- `referenceDocs/00_Governance/GUARDRAILS.md`
- `referenceDocs/00_Governance/MCD_PLAYBOOK.md`
- `referenceDocs/00_Governance/mcd/CLOSEOUT.md`
- `mcd-starter-kit-dev/extension/src/templates/guardrails.ts`
- `mcd-starter-kit-dev/extension/src/templates/playbook.ts`
- `mcd-starter-kit-dev/extension/src/templates/commands.ts`
- `mcd-starter-kit-dev/extension/src/scaffolder.ts` (overlap with active SIP-1 contract; sequence required)

**Create**
- `referenceDocs/06_AgentMemory/agent-memory.json`
- `referenceDocs/06_AgentMemory/README.md`
- `referenceDocs/04_Analysis/scripts/validate_closeout_hygiene.py`
- `referenceDocs/02_Architecture/primitives/YYYYMMDDHHMM-AGENT_MEMORY_LIFECYCLE_PRIMITIVE.md`

**Conditional Modify (only if approved in execution scope)**
- `ops/launch-command-deck/scripts/init_command_deck.py` (seed card/metadata alignment for memory workflow)

## 6. Implementation Plan
1. Define canonical memory schema (`v`, `upd`, `cur`, bounded `hist`) and hard size/cap limits.
2. Add governance language that classifies `agent-memory.json` as operational state and defines update triggers.
3. Update `CLOSEOUT` command to require memory update + hygiene validation before closeout is considered complete.
4. Add validator script to enforce:
   - Required artifact placement.
   - Naming and path hygiene checks.
   - Presence/validity of `agent-memory.json`.
5. Update extension templates/scaffolder so newly scaffolded repos include the memory directory and baseline file.
6. Add architecture primitive documenting lifecycle, precedence, and consumption rules.

## 7. Acceptance Criteria
- [ ] `referenceDocs/06_AgentMemory/agent-memory.json` exists with compact valid JSON and bounded keys.
- [ ] Governance docs explicitly require memory update at closeout and define controlled mid-stage update triggers.
- [ ] `mcd/CLOSEOUT.md` includes deterministic hygiene + memory checks.
- [ ] Hygiene validator script exists and runs successfully against repository artifacts.
- [ ] Scaffold/template outputs include `06_AgentMemory` for new projects.
- [ ] Architecture primitive documents memory lifecycle and conflict-precedence with markdown records.
- [ ] Active-contract overlap is resolved or execution sequencing is explicitly approved before overlapping AFP edits.

## 8. Risks & Mitigations
- **Risk:** Active contract collision on scaffold files.  
  **Mitigation:** Sequence after SIP-1 closeout or explicitly supersede with operator approval.
- **Risk:** Memory file grows and loses token efficiency.  
  **Mitigation:** Hard caps (file size + per-array limits + bounded history).
- **Risk:** Ambiguity between compact memory and human-readable records.  
  **Mitigation:** Define precedence rules in primitive/governance docs.

## 9. Verification Plan
- Static validation: run hygiene validator script and JSON parse checks for `agent-memory.json`.
- Governance verification: confirm guardrails/playbook/closeout command all reflect memory+hygiene requirements.
- Scaffold verification: initialize a test scaffold and confirm `06_AgentMemory/agent-memory.json` is generated.

## 10. Approval Required
Operator, review this contract and approve execution sequencing, especially the overlap handling with the active SIP-1 contract.  
Execute phase should not begin until you explicitly authorize execution of this contract.
