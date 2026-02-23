# WALKTHROUGH: MCD Distillation NotebookLLM Alignment

## Goal
Confirm the distillation used for NotebookLLM ingestion reflects the current AmphionAgent command model and no longer contains stale lifecycle/setup claims.

## Steps
1. Open:
   - `mcd-starter-kit-dev/docs/research/mcd-distillation.md`
   - `referenceDocs/05_Records/documentation/helperContext/mcd-distillation-for-notebooklm.md`
2. Verify both files include:
   - `The "Halt and Prompt" Safety Rail`
   - `The 5-Command Operational Sequence`
   - `/evaluate`, `/board`, `/contract`, `/execute`, `/closeout`
3. Verify setup/runtime statements:
   - Five-input wizard language
   - Python-or-Node runtime option
   - existing-project additive scaffold support
4. Verify stale claims are absent:
   - `GitHub Copex`
   - `The 4-Phase Lifecycle`
   - `One command. Four prompts`
   - Python-only runtime claim
5. Confirm source/helper parity with `cmp`.

## Expected Results
- Both distillation files present identical content.
- NotebookLLM ingestion source now encodes current MCD operating guidance.
- Operators and agents receive explicit Halt-and-Prompt + 5-command lifecycle context.

## Rollback (if needed)
- Restore prior distillation revision from git history.
- Re-run an evaluation pass to re-scope any wording regressions before re-contracting.
