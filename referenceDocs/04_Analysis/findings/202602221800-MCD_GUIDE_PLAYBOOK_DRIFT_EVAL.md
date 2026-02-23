# Evaluate Findings: MCD Guide Playbook Drift in Packaged Extension

**Timestamp:** 2026-02-22 18:00 local  
**Phase:** EVALUATE  
**Codename:** `BlackClaw`

## User Report
In a fresh Cursor install of `v1.25.0`, the in-app **MCD Guide** content differs from this environment:
- Installed build shows older **4-phase** wording.
- Current local environment/docs show newer **5-phase** wording (includes `/board` and Halt-and-Prompt emphasis).

## Research Summary
1. **Canonical current playbook (workspace):**
   - `referenceDocs/00_Governance/MCD_PLAYBOOK.md` contains:
     - "The 5-Phase Sequence & IDE Slash Commands"
     - explicit `/board` phase
     - "Halt and Prompt" safety rail
2. **Extension assets playbook mirror:**
   - `mcd-starter-kit-dev/extension/assets/referenceDocs/00_Governance/MCD_PLAYBOOK.md`
   - Matches the new 5-phase wording.
3. **Scaffold generator source of truth for new projects:**
   - `mcd-starter-kit-dev/extension/src/scaffolder.ts` writes `referenceDocs/00_Governance/MCD_PLAYBOOK.md` from:
     - `getPlaybookContent()` in `mcd-starter-kit-dev/extension/src/templates/playbook.ts`
4. **Template used at scaffold-time is stale:**
   - `src/templates/playbook.ts` still contains:
     - "The 4-Phase Lifecycle"
     - old Evaluate/Contract/Execute/Closeout-only sequence
     - no `/board` phase and no updated Halt-and-Prompt framing

## Root Cause
**Dual-source drift** in playbook content:
- Runtime/reference and asset mirror docs were updated to 5-phase.
- Scaffold template (`src/templates/playbook.ts`) was not updated accordingly.
- New project scaffolds therefore receive stale 4-phase content, which is what you observed in your fresh install.

## Gap Analysis
- **Missing parity guarantee** between canonical governance docs and scaffold-time templates.
- **Behavioral impact:** new users get outdated MCD guidance even when extension package is current.

## Scope (Next Phase Candidate)
### In Scope
- Align `src/templates/playbook.ts` with canonical 5-phase playbook.
- Verify compiled output (`out/templates/playbook.js`) reflects updated content.
- Add a lightweight parity check step (or explicit synchronization rule) to prevent recurrence.
- Repackage and validate that fresh scaffolds show expected MCD Guide content.

### Out of Scope
- Command Deck runtime UI redesign.
- Marketplace listing copy beyond this playbook consistency fix.

## Conclusion
Your observation is correct. The mismatch is reproducible and rooted in scaffold template drift, not user configuration.
