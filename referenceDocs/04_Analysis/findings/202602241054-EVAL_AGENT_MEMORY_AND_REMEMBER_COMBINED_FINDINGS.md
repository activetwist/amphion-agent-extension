# EVALUATE: Agent Memory Directory + `/remember` Manual Capture (Combined Findings)

**Phase:** 1 (Research & Scoping)  
**Date:** 2026-02-24  
**Codename:** `BlackClaw`

## 1. Combined Source Findings
- `referenceDocs/04_Analysis/findings/202602241018-EVAL_AGENT_MEMORY_DIRECTORY_AND_COMPACT_CONTEXT_DENSITY.md`
- `referenceDocs/04_Analysis/findings/202602241045-EVAL_REMEMBER_COMMAND_MANUAL_MEMORY_CAPTURE.md`

## 2. Unified Goal
Establish one deterministic, token-efficient memory system for agent continuity by combining:
1. Dedicated agent memory storage (`06_AgentMemory` + compact single-file memory).
2. Manual mid-stage capture via a `/remember` utility command (in addition to closeout updates).

## 3. Consolidated Decisions
### A) Canonical Memory Location
- Directory: `referenceDocs/06_AgentMemory/`
- File: `referenceDocs/06_AgentMemory/agent-memory.json`

### B) Memory File Model
- Single bounded snapshot JSON (not unbounded append logs).
- Deterministic overwrite at closeout.
- Optional controlled mid-stage updates.
- Bounded rolling history (`hist`) for recent context carry-forward.

### C) Compact-But-Detailed Schema Direction
```json
{
  "v": 1,
  "upd": "2026-02-24T16:54:00Z",
  "cur": {
    "st": "closeout",
    "ms": "v1.26",
    "ct": ["202602232354-CONTRACT_COMMAND_DECK_MERMAID_PAN_ZOOM_VIEWER.md"],
    "dec": ["python-runtime-standardized"],
    "trb": ["mermaid-pan-zoom-drift:fixed-by-bounded-transform-reset"],
    "lrn": ["state-version-polling-is-reliable-for-low-cost-refresh"],
    "nx": ["enforce-closeout-hygiene-gate"],
    "ref": ["referenceDocs/05_Records/buildLogs/202602232354-EXECUTE_COMMAND_DECK_MERMAID_PAN_ZOOM_VIEWER.md"]
  },
  "hist": []
}
```

### D) Density Constraints
- Hard file budget (example: 8-16 KB).
- Hard per-array caps (`dec/trb/lrn/nx/ref`).
- Compact slug-like entries only (no long prose blocks).
- Dedup references/facts.
- Keep `hist` to last 2-3 snapshots.

## 4. `/remember` Command Integration
### A) Command Role
- `/remember` should be a **utility command**, not a lifecycle phase.
- 5-phase MCD flow remains unchanged.

### B) User Flow
1. User clicks dashboard `/remember` button.
2. Button prefills `/remember` into chat input.
3. User sends command.
4. Agent performs manual context capture and updates `agent-memory.json` within schema and cap constraints.
5. Agent confirms completion without phase transition.

### C) Update Policy (Unified)
Mandatory:
- Closeout phase completion.

Controlled optional:
- `/remember` manual checkpoint during long sessions.
- Material scope changes under approved contracts.
- Breakthrough troubleshooting with durable future relevance.
- Architecture/runtime decisions affecting future execution.

## 5. Consolidated Gaps
- No dedicated memory directory currently exists.
- No canonical memory file or schema enforcement currently exists.
- No `/remember` command exists in canonical MCD commands.
- No dashboard `/remember` action exists.
- No adapter-generated `/remember` surfaces across `.agents` / `.cursor` / `.windsurf`.
- Governance text does not yet explicitly authorize controlled non-closeout memory updates.

## 6. Consolidated Scope (If Contracted)
**In-Scope**
- Add `referenceDocs/06_AgentMemory/agent-memory.json` and operational docs.
- Add `/remember` button to dashboard command list.
- Add canonical command: `referenceDocs/00_Governance/mcd/REMEMBER.md`.
- Extend adapter/scaffolder generation so `/remember` workflows are created across supported IDE surfaces.
- Update guardrails/playbook/closeout definitions to include memory + `/remember` policy.

**Out-of-Scope**
- Cloud/vector memory systems.
- Automatic periodic background memory updates.
- Full historical backfill into compact snapshots.
- New backend API requirement solely for `/remember` (chat prefill pattern already exists).

## 7. Consolidated AFP Candidates
**Modify**
- `mcd-starter-kit-dev/extension/src/commandDeckDashboard.ts`
- `mcd-starter-kit-dev/extension/src/scaffolder.ts`
- `mcd-starter-kit-dev/extension/src/templates/adapters.ts`
- `referenceDocs/00_Governance/GUARDRAILS.md`
- `referenceDocs/00_Governance/MCD_PLAYBOOK.md`
- `referenceDocs/00_Governance/mcd/CLOSEOUT.md`
- `mcd-starter-kit-dev/extension/src/templates/guardrails.ts`
- `mcd-starter-kit-dev/extension/src/templates/playbook.ts`
- `mcd-starter-kit-dev/extension/src/templates/commands.ts`

**Create**
- `referenceDocs/06_AgentMemory/agent-memory.json`
- `referenceDocs/06_AgentMemory/README.md`
- `referenceDocs/00_Governance/mcd/REMEMBER.md`
- `referenceDocs/04_Analysis/scripts/validate_closeout_hygiene.py`
- `referenceDocs/02_Architecture/primitives/YYYYMMDDHHMM-AGENT_MEMORY_LIFECYCLE_PRIMITIVE.md`

**Generated/Derived**
- `.agents/workflows/remember.md`
- `.cursor/commands/remember.md`
- `.cursor/rules/remember.mdc`
- `.windsurf/workflows/remember.md`

## 8. Risks and Controls
- **Risk:** Memory bloat during frequent manual captures.  
  **Control:** enforce caps, dedup, bounded history.
- **Risk:** Lifecycle confusion if `/remember` is treated as phase.  
  **Control:** define as utility-only command.
- **Risk:** Governance drift from undocumented mid-stage writes.  
  **Control:** explicit guardrail/playbook language for approved triggers.
- **Risk:** AFP overlap with active SIP work when touching shared scaffold surfaces.  
  **Control:** sequence execution or explicitly supersede overlapping scope before implementation.

## 9. Execution Readiness Note
These findings are intentionally combined so memory core work and `/remember` utility integration can be implemented as one coordinated slice in a future approved contract/execute run.
