# EVALUATE: `/remember` Manual Memory Capture Command

**Phase:** 1 (Research & Scoping)  
**Date:** 2026-02-24  
**Codename:** `BlackClaw`

## 1. Request Evaluated
Add a dashboard action button labeled `/remember` below the existing phase buttons.  
When clicked, it should prefill `/remember` in chat; when the user sends it, the agent performs a manual context collection and writes that context into the compact agent memory artifact.

## 2. Research Findings (Current State)
- The dashboard already supports this interaction pattern via `openChatInput` and is currently used by `/help`, `/evaluate`, `/board`, `/contract`, `/execute`, and `/closeout` in:
  - `mcd-starter-kit-dev/extension/src/commandDeckDashboard.ts`
- `/remember` does not exist in:
  - Canonical command docs (`referenceDocs/00_Governance/mcd/`)
  - Generated workflow adapters (`scaffolder.ts` command list + adapter templates)
  - Local `.cursor` command/rule surfaces
- A memory-focused draft contract already exists:
  - `referenceDocs/03_Contracts/active/202602241021-CONTRACT_AGENT_MEMORY_DIRECTORY_AND_CLOSEOUT_HYGIENE.md`
  - It covers memory artifact lifecycle but currently does **not** enumerate dashboard `/remember` button + command-surface additions.

## 3. Gap Analysis
### A) UI Invocation Gap
- No `/remember` button exists in the dashboard command flow list.
- Low technical complexity: same click-to-chat prefill mechanic is already implemented.

### B) Command Determinism Gap
- No canonical `/remember` command definition exists, so behavior is non-deterministic across agent IDEs.
- Without canonical command text and workflow adapters, results depend on agent interpretation and may drift.

### C) Governance Gap
- `/remember` introduces intentional mid-stage memory writes outside closeout.
- Guardrails currently describe closeout persistence and contract-gated core changes, but do not explicitly define `/remember` as an allowed operational memory update trigger.

## 4. Scoped Recommendation
Treat `/remember` as a **utility command**, not a phase:
- Keep 5-phase MCD lifecycle intact.
- Add `/remember` as a manual memory checkpoint command that can run between phase transitions.

Recommended behavior:
1. Collect current-stage context (current contract/slice, breakthrough, troubleshooting, decisions, risks, next-step anchors).
2. Write/update `referenceDocs/06_AgentMemory/agent-memory.json` using bounded schema constraints.
3. Confirm update result with concise output and no phase transition.

## 5. In-Scope / Out-of-Scope (If Contracted)
**In-Scope**
- Add `/remember` button to dashboard command list below current action commands.
- Add canonical command doc: `referenceDocs/00_Governance/mcd/REMEMBER.md`.
- Add generated adapter/workflow surfaces for `.agents`, `.cursor`, and `.windsurf`.
- Update governance/playbook language to classify `/remember` as controlled operational memory update.
- Update active memory contract AFPs (or supersede with a new memory contract) to include these files.

**Out-of-Scope**
- Automatic periodic background memory writes.
- New backend APIs solely for `/remember` (prefill-to-chat already works).
- Replacing closeout memory generation; `/remember` is supplemental.

## 6. Contract-Ready AFP Candidates
**Modify**
- `mcd-starter-kit-dev/extension/src/commandDeckDashboard.ts`
- `mcd-starter-kit-dev/extension/src/scaffolder.ts` (commands array currently omits `remember`)
- `mcd-starter-kit-dev/extension/src/templates/adapters.ts`
- `referenceDocs/00_Governance/GUARDRAILS.md`
- `referenceDocs/00_Governance/MCD_PLAYBOOK.md`

**Create**
- `referenceDocs/00_Governance/mcd/REMEMBER.md`

**Generated/Derived outputs (via templates/scaffold)**
- `.agents/workflows/remember.md`
- `.cursor/commands/remember.md`
- `.cursor/rules/remember.mdc`
- `.windsurf/workflows/remember.md`

## 7. Risks & Controls
- **Risk:** `/remember` could bloat memory file during long sessions.
  - **Control:** strict caps and dedup rules already proposed in memory evaluation.
- **Risk:** Command confusion with phase sequence.
  - **Control:** label `/remember` as utility/manual checkpoint, not phase command.
- **Risk:** Contract drift if added outside current active memory contract AFPs.
  - **Control:** amend active memory contract or issue a superseding contract that includes `/remember` surfaces.

## 8. Primitive Review
No separate new primitive required if this is folded into the planned Agent Memory Lifecycle primitive.  
`/remember` should be documented there as an explicit mid-stage manual update trigger.

## 9. Conclusion
This proposal is feasible and aligned with the memory acceleration objective.  
The clean implementation path is to extend the active memory contract scope to include:
1) dashboard `/remember` button,  
2) canonical `/remember` command + adapter generation, and  
3) governance language for controlled mid-stage memory writes.

**HALT.** Evaluation complete.
