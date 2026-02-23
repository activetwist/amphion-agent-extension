# CONTRACT: Insert Verified Development Velocity Evidence into NotebookLLM Distillation

**Phase:** 2.0 (Contract)  
**Status:** Proposed  
**Date:** 2026-02-22  
**Codename:** `BlackClaw`

## 1. Goal
Capture the validated development-time result in the MCD distillation context so NotebookLLM includes a concrete velocity datapoint: novice operator delivery at approximately 10 hours, with precise measured active time.

## 2. Approved AFPs (Affected File Paths)
- `referenceDocs/03_Contracts/active/202602221944-CONTRACT_NOTEBOOKLM_VELOCITY_EVIDENCE_INSERT.md` (this contract)
- `ops/launch-command-deck/data/state.json` (observability card)
- `referenceDocs/04_Analysis/findings/202602221932-BUILD_GIT_TIME_ACCOUNTING_EVAL.md` (reference source; no content edits planned)
- `mcd-starter-kit-dev/docs/research/mcd-distillation.md`
- `referenceDocs/05_Records/documentation/helperContext/mcd-distillation-for-notebooklm.md`
- `referenceDocs/05_Records/buildLogs/202602221944-EXECUTE_NOTEBOOKLM_VELOCITY_EVIDENCE_INSERT.md` (new)
- `referenceDocs/05_Records/buildLogs/202602221944-WALKTHROUGH_NOTEBOOKLM_VELOCITY_EVIDENCE_INSERT.md` (new)

## 3. Scope Boundaries
- **In Scope:**
  - Add a concise evidence bullet in distillation context documenting:
    - Precise active development time: `9h 50m 32s (9.8422 hours)`
    - Practical framing: approximately 10 hours for novice operator delivery
    - Measurement method reference (git-sessionized accounting from findings record)
  - Keep the source distillation and helper-context NotebookLLM copy synchronized.
- **Out of Scope:**
  - Recomputing or redefining time-accounting methodology.
  - Broader distillation rewrites outside the evidence insertion.
  - Any extension runtime, scaffolder, or command behavior changes.

## 4. Deterministic Execution Plan
1. **Evidence Insertion**
   - Add a new bullet to the “The Evidence: What MCD Produces in Practice” section in `mcd-starter-kit-dev/docs/research/mcd-distillation.md`.
2. **NotebookLLM Sync**
   - Mirror the exact content update in `referenceDocs/05_Records/documentation/helperContext/mcd-distillation-for-notebooklm.md`.
3. **Verification**
   - Confirm presence of the precise metric and approximate framing text in both files.
   - Confirm both files remain synchronized.
4. **Documentation**
   - Write execute and walkthrough build-log records with verification output.

## 5. Risk Assessment
- **Overclaim Risk (Medium):** Velocity claim may be read as anecdotal without method context.
  **Mitigation:** Include exact measured value and tie it to the documented findings artifact/method.
- **Copy Drift Risk (Medium):** Source and helper-context copies may diverge.
  **Mitigation:** Update both files in the same execution slice and verify byte-level parity.
- **Narrative Bloat Risk (Low):** Adding too much methodology detail in evidence section could reduce readability.
  **Mitigation:** Keep insertion compact and evidence-oriented.

## 6. Acceptance Criteria
- [ ] Distillation evidence section includes novice-operator velocity datapoint with precise value `9h 50m 32s (9.8422 hours)`.
- [ ] Distillation text also communicates practical framing as approximately 10 hours.
- [ ] Statement references that timing came from logged git/build evaluation methodology.
- [ ] Source and helper-context distillation files are synchronized after update.
- [ ] Execute and walkthrough build-log records are created.

## 7. Operator Approval Gate
Execution is blocked pending operator approval.  
To begin implementation, invoke:

`/execute 202602221944-CONTRACT_NOTEBOOKLM_VELOCITY_EVIDENCE_INSERT.md`
