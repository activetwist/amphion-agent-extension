# EVALUATE: Closeout Artifact Hygiene + Stage Memory Compactor

**Phase:** 1 (Research & Scoping)  
**Date:** 2026-02-24  
**Codename:** `BlackClaw`

## 1. Request Evaluated
1. Enforce stricter artifact hygiene at closeout (workspace cleanup + archival discipline).
2. Add a compact, strictly machine-readable compactor artifact that captures recent-stage project essence (troubleshooting, learned behavior, decisions) for faster next-task startup across agent IDEs.

## 2. Research Findings (Current System)
- Canonical closeout rules require contract archival, closeout record, artifact staging, and closeout commit, but do not require strict archival/retention cleanup rules for non-contract docs.
- Existing closeout command text is broad and non-prescriptive for artifact pruning and normalization.
- `referenceDocs/05_Records/chatLogs/` exists but currently has **0** files.
- `referenceDocs/05_Records/buildLogs/` has **34** files; `referenceDocs/05_Records/closeout/` has **4** files; both are Markdown-oriented and human-readable.
- Naming convention drift is present in committed artifacts (examples include date-only prefixes and irregular filenames), which indicates current hygiene is policy-driven but not enforced.
- There is an active contract in `referenceDocs/03_Contracts/active/202602240946-CONTRACT_SIP1_ONBOARDING.md` that already targets scaffolder-related files; any future implementation touching overlapping paths must be sequenced or superseding.
- Command Deck already uses a lightweight polling primitive (`/api/state/version` + `/api/reload`), which is a viable pattern for compact-memory freshness checks.

## 3. Gap Analysis

### A) Stricter Artifact Hygiene at Closeout
**Current gaps**
- No deterministic archival taxonomy (what stays hot vs archived).
- No automated compliance gate for naming/placement/immutability during closeout.
- No required cleanup actions for stale helper documents, ad hoc notes, or orphan records.
- No normalized manifest proving what was archived, retained, or intentionally discarded.

**Impact**
- Workspace entropy increases across versions.
- Operator/agent startup cost rises due to noisy record surfaces.
- Closeout reproducibility is weaker than intended by deterministic governance.

**Feasibility**
- **High**. Most changes are governance/template/script enforcement with limited runtime risk.

### B) Compact Machine-Readable Stage Memory Compactor
**Current gaps**
- No canonical single-file handoff memory artifact exists.
- Build and closeout records are verbose Markdown, not optimized for low-token machine ingestion.
- No schema-level guarantees for troubleshooting learnings, decisions, regressions, and next-task anchors.
- No freshness contract for when to update (closeout-only vs mid-stage checkpoints).

**Impact**
- Repeated context reconstruction from many files.
- Higher chance of agent re-asking already-resolved context.
- Inconsistent carry-forward of troubleshooting and lessons learned.

**Feasibility**
- **High**, if schema is minimal, append/update semantics are deterministic, and write ownership is constrained to governed phases.

## 4. Scope Boundaries (If Contracted Later)

**In-Scope**
- Strengthen `GUARDRAILS.md` + `mcd/CLOSEOUT.md` with deterministic artifact hygiene checks.
- Add a closeout hygiene validator script (pre-commit closeout gate).
- Define a compact memory artifact spec (strict JSON schema, bounded fields, deterministic keys).
- Generate/update one canonical machine-readable file at closeout; optional controlled mid-stage updates.
- Propagate new rules into scaffolder templates so new projects inherit behavior.

**Out-of-Scope**
- Full-text semantic indexing/vector memory stores.
- Cloud storage/sync and non-local dependencies.
- Rewriting historical records into the new compact format (can be optional backfill contract later).
- Replacing existing build/closeout markdown logs; compact file should complement, not erase, audit trail.

## 5. Primitive Review
New primitive is recommended:
- **Operational Context Primitive**: a deterministic lifecycle for compact stage memory generation, update policy, and consumption priority.
- Suggested primitive location: `referenceDocs/02_Architecture/primitives/` (new timestamped artifact).

## 6. Contract-Ready File Path Candidates (Future, Not Executed)
- `referenceDocs/00_Governance/GUARDRAILS.md`
- `referenceDocs/00_Governance/mcd/CLOSEOUT.md`
- `referenceDocs/00_Governance/MCD_PLAYBOOK.md`
- `mcd-starter-kit-dev/extension/src/templates/guardrails.ts`
- `mcd-starter-kit-dev/extension/src/templates/commands.ts`
- `mcd-starter-kit-dev/extension/src/templates/playbook.ts`
- `mcd-starter-kit-dev/extension/src/scaffolder.ts`
- `referenceDocs/04_Analysis/scripts/` (new hygiene validator script)
- `referenceDocs/05_Records/` (new compact-memory location and schema docs)
- Optional runtime support:
  - `ops/launch-command-deck/server.py`
  - `ops/launch-command-deck/server.js`

## 7. Proposed Compact Artifact Shape (Evaluation Draft)
Candidate file (single source of handoff truth):
- `referenceDocs/05_Records/context/stage-memory.ndjson`

Candidate line schema (compact + deterministic):
```json
{"v":1,"ts":"2026-02-24T16:03:00Z","stage":"closeout","ms":"v1.26","contracts":["202602232354-CONTRACT_COMMAND_DECK_MERMAID_PAN_ZOOM_VIEWER.md"],"dec":["python-runtime-standardized"],"fix":["mermaid-pan-zoom-bounds"],"learn":["state-version-polling-reliable"],"risk":["ui-smoke-manual-only"],"next":["contract-hygiene-gate"],"refs":["referenceDocs/05_Records/buildLogs/202602232354-EXECUTE_COMMAND_DECK_MERMAID_PAN_ZOOM_VIEWER.md"]}
```

Design constraints:
- Append-only by stage or bounded overwrite of most-recent stage record.
- Flat key-space, short keys, no markdown, no prose blocks.
- Hard size budget per entry to prevent memory bloat.
- Atomic writes only.

## 8. Risks and Unknowns
- Overlap risk with active SIP-1 contract AFPs (`scaffolder.ts`, `init_command_deck.py`).
- Potential governance friction if hygiene gates are too strict for existing historical artifacts.
- Need clear precedence between compact memory artifact and full markdown records when they differ.
- Need explicit policy for redaction/safety if sensitive troubleshooting data appears in compact entries.

## 9. Conclusion
Both proposals are technically viable and aligned with deterministic MCD goals. The strongest path is:
1) codify closeout hygiene as an enforceable gate, and  
2) introduce a single compact stage-memory artifact with strict schema and bounded update policy.

**HALT.** Evaluation complete.
