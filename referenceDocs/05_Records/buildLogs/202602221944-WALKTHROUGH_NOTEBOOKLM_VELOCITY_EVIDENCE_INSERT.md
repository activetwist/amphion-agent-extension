# WALKTHROUGH: NotebookLLM Velocity Evidence Insert

## Goal
Ensure the NotebookLLM distillation context explicitly includes the validated novice-operator velocity datapoint from the build/git time-accounting evaluation.

## Steps
1. Open source distillation:
   - `mcd-starter-kit-dev/docs/research/mcd-distillation.md`
2. Navigate to `## The Evidence: What MCD Produces in Practice`.
3. Verify the new bullet includes:
   - `9h 50m 32s (9.8422 hours)`
   - `approximately 10 hours`
   - `git-sessionized accounting`
   - `202602221932-BUILD_GIT_TIME_ACCOUNTING_EVAL.md`
4. Open helper-context distillation:
   - `referenceDocs/05_Records/documentation/helperContext/mcd-distillation-for-notebooklm.md`
5. Confirm the same evidence bullet is present.
6. Run parity check (`cmp`) to ensure both files are synchronized.

## Expected Results
- NotebookLLM context contains concrete, precise velocity evidence.
- Evidence preserves both exact metric and practical (~10 hours) framing.
- Source and helper-context copies remain identical.

## Rollback (if needed)
- Revert both distillation files to the previous revision from git history.
- Re-run execute after contract-level wording approval.
