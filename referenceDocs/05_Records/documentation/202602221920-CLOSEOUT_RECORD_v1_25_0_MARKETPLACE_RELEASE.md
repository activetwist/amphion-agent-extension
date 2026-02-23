# CLOSEOUT RECORD: AmphionAgent v1.25.0 Marketplace Release

**Date:** 2026-02-22  
**Codename:** `BlackClaw`  
**Version Alignment:** `v1.25.0`  
**Executed At (UTC):** 2026-02-23T01:20:23Z

## 1. Release Summary
This closeout finalizes the AmphionAgent `v1.25.0` release cycle, including marketplace readiness hardening, command-surface parity fixes, playbook drift remediation, extension-only source provenance setup, and successful Marketplace publication under publisher `active-twist`.

Marketplace publication evidence:
- Extension ID: `active-twist.amphion-agent`
- Published version: `1.25.0`
- Publisher: `active-twist`

## 2. Contracts Resolved This Release
- `202602221636-CONTRACT_MARKETPLACE_POLISH_GH_ENABLEMENT.md`
- `202602221653-CONTRACT_SAFE_LIGHT_TOGGLE_RESTORE.md`
- `202602221703-CONTRACT_LIGHT_MODE_WCAG_AA_HARDENING.md`
- `202602221710-CONTRACT_EDIT_DIALOG_ISSUE_NUMBER_HOTFIX.md`
- `202602221721-CONTRACT_BOARD_COMMAND_PARITY.md`
- `202602221748-CONTRACT_GITHUB_FIRST_PUSH_REMEDIATION.md`
- `202602221802-CONTRACT_PLAYBOOK_DRIFT_REMEDIATE_REBUILD_1250.md`
- `202602221818-CONTRACT_EXTENSION_ONLY_REPO_AND_MARKETPLACE_PUBLISH.md`
- `202602221830-CONTRACT_MCD_DISTILLATION_NOTEBOOKLLM_ALIGNMENT.md`

Additionally, remaining historical contract files in `03_Contracts/active/` were archived during this closeout so active contract state is clean.

## 3. Deliverables and Verification
- Rebuilt extension package: `mcd-starter-kit-dev/extension/amphion-agent-1.25.0.vsix`
- Extension-only public provenance repo created:
  - `https://github.com/activetwist/amphion-agent-extension`
- Main project remote provenance established:
  - `https://github.com/activetwist/amphion-agent` (`origin/main` live)
- Command Deck parity and accessibility fixes validated via execute/walkthrough logs in:
  - `referenceDocs/05_Records/buildLogs/`

## 4. Governance Compliance Check
- [x] Active contracts archived to `03_Contracts/archive/`
- [x] Build logs and walkthrough artifacts recorded
- [x] Closeout record created in `05_Records/`
- [x] Version finalized at `1.25.0`
- [x] Marketplace release completed
- [x] Repository prepared for final closeout commit

## 5. Archival State
- `referenceDocs/03_Contracts/active/` is empty.
- Contract corpus consolidated under `referenceDocs/03_Contracts/archive/`.

**Phase 4 (Closeout) Complete.**
