# CONTRACT · Artifact Cleanup (v1.6.1)

**Phase:** 2 (Planning & Agreement)
**Status:** PROPOSED
**Codename:** `BlackClaw`

## Objective
Normalize the `referenceDocs/` directory by removing redundant draft contracts and archiving historical evaluation findings. This ensures that the active workspace reflects only currently relevant and finalized work.

## User Review Required
> [!IMPORTANT]
> This action will DELETE the following two files from `referenceDocs/03_Contracts/active/`:
> - `202602211813-CONTRACT_MCD_V1_5_COMMAND_FILES.md`
> - `202602211813-CONTRACT_MCD_V1_6_ISSUE_NUMBERS.md`
> 
> These are redundant drafts of work that has already been finalized and archived under later timestamps (`1845` and `1910`).

## Proposed Changes

### [Governance]
- **DELETE**: `referenceDocs/03_Contracts/active/202602211813-CONTRACT_MCD_V1_5_COMMAND_FILES.md`
- **DELETE**: `referenceDocs/03_Contracts/active/202602211813-CONTRACT_MCD_V1_6_ISSUE_NUMBERS.md`

### [Analysis]
- **MOVE**: `referenceDocs/04_Analysis/findings/202602211807-EVAL_UX_ENHANCEMENTS.md` -> `referenceDocs/04_Analysis/findings/archive/202602211807-EVAL_UX_ENHANCEMENTS.md`

## Acceptance Criteria
- [ ] `referenceDocs/03_Contracts/active/` contains zero files.
- [ ] `referenceDocs/04_Analysis/findings/archive/` contains the historical UX evaluation findings.
- [ ] Final archived contracts for v1.5 and v1.6 remain intact in `03_Contracts/archive/`.
