# CONTRACT: Align MCD Distillation for NotebookLLM with Current Command Model

**Phase:** 2.0 (Contract)  
**Status:** Proposed  
**Date:** 2026-02-22  
**Codename:** `BlackClaw`

## 1. Goal
Revise the MCD distillation narrative so NotebookLLM ingestion reflects the current AmphionAgent command model and operational facts while preserving the existing long-form philosophy.

## 2. Approved AFPs (Affected File Paths)
- `referenceDocs/03_Contracts/active/202602221830-CONTRACT_MCD_DISTILLATION_NOTEBOOKLLM_ALIGNMENT.md` (this contract)
- `ops/launch-command-deck/data/state.json` (observability card)
- `mcd-starter-kit-dev/docs/research/mcd-distillation.md`
- `referenceDocs/05_Records/documentation/helperContext/mcd-distillation-for-notebooklm.md`
- `referenceDocs/05_Records/buildLogs/202602221830-EXECUTE_MCD_DISTILLATION_NOTEBOOKLLM_ALIGNMENT.md` (new)
- `referenceDocs/05_Records/buildLogs/202602221830-WALKTHROUGH_MCD_DISTILLATION_NOTEBOOKLLM_ALIGNMENT.md` (new)

## 3. Scope Boundaries
- **In Scope:**
  - Align lifecycle framing to the current slash-command flow (`/evaluate`, `/board`, `/contract`, `/execute`, `/closeout`).
  - Add explicit Halt-and-Prompt safety rail language.
  - Correct setup/runtime statements (5-prompt wizard, Python or Node.js runtime support).
  - Update onboarding framing to include both empty-folder and existing-project initialization.
  - Preserve core philosophy sections and polymorphic contracts concept.
  - Keep `mcd-starter-kit-dev/docs/research/mcd-distillation.md` and helper-context NotebookLLM variant synchronized.
- **Out of Scope:**
  - Changes to extension runtime/templates (`src/templates/*`) or canonical governance command files.
  - New product features in Command Deck.
  - Marketplace/release/version-bump activities.

## 4. Deterministic Execution Plan
1. **Source Alignment**
   - Update `mcd-starter-kit-dev/docs/research/mcd-distillation.md` to resolve all P0/P1 findings from the evaluation.
2. **NotebookLLM Helper Copy Sync**
   - Regenerate/update `referenceDocs/05_Records/documentation/helperContext/mcd-distillation-for-notebooklm.md` from the aligned source narrative.
3. **Consistency Verification**
   - Validate that key claims match current sources: `extension/README.md`, `extension/src/templates/playbook.ts`, and canonical phase command docs.
4. **Quality Pass**
   - Fix terminology defects (including `GitHub Copex` -> `GitHub Codex`) and remove stale setup/runtime claims.
5. **Documentation**
   - Write execute log and walkthrough record with explicit before/after checkpoints.

## 5. Risk Assessment
- **Process Drift Risk (Medium):** Distillation may diverge again from canonical playbook/commands.
  **Mitigation:** Add a compact command-reference section and verify against `playbook.ts` + `mcd/*.md` during execution.
- **Cross-Doc Consistency Risk (Medium):** Source and helper-context versions may desynchronize.
  **Mitigation:** Treat source doc as primary and update helper-context copy in the same execute pass.
- **Over-correction Risk (Low/Medium):** Revision may strip useful long-form context.
  **Mitigation:** Preserve philosophical/explanatory sections and limit edits to operational correctness plus precision additions.

## 6. Acceptance Criteria
- [ ] Distillation lifecycle reflects the 5-command sequence used by AmphionAgent.
- [ ] Halt-and-Prompt safety rule is explicitly documented.
- [ ] Setup/runtime details are accurate (5 prompts; Python or Node.js backend option).
- [ ] Existing-project additive scaffold support is accurately described.
- [ ] `GitHub Copex` typo is corrected to `GitHub Codex`.
- [ ] Source distillation and helper-context NotebookLLM version are synchronized.
- [ ] Execute and walkthrough build-log records are created.

## 7. Operator Approval Gate
Execution is blocked pending operator approval.  
To begin implementation, invoke:

`/execute 202602221830-CONTRACT_MCD_DISTILLATION_NOTEBOOKLLM_ALIGNMENT.md`
