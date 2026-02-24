# EVALUATE: Dedicated Agent Memory Directory + Compact Context Density

**Phase:** 1 (Research & Scoping)  
**Date:** 2026-02-24  
**Codename:** `BlackClaw`

## 1. Request Evaluated
Refine the prior recommendation by:
1. Adding a dedicated memory directory for agent-only memory artifacts.
2. Keeping a single compact memory file that is machine-readable and token-efficient, while still detailed enough to preserve meaningful context.

## 2. Research Update
- Current records layout has `buildLogs`, `chatLogs`, `closeout`, and `documentation`; no dedicated agent-memory directory exists.
- Previous recommendation used `referenceDocs/05_Records/context/stage-memory.ndjson`.
- Existing governance enforces deterministic naming for documents, but does not yet define a canonical exception/policy for a continuously updated machine-state memory artifact.
- Existing system already supports lightweight freshness checks (`/api/state/version` pattern), which can be mirrored for memory-file change detection.

## 3. Evaluation Decision
### A) Directory Placement
Recommended canonical directory:
- `referenceDocs/06_AgentMemory/`

Recommended canonical file:
- `referenceDocs/06_AgentMemory/agent-memory.json`

Rationale:
- Clean separation from human-facing records.
- Deterministic single path for all agent IDEs.
- Preserves governance visibility and git-backed traceability.
- Avoids mixed semantics inside `05_Records/` where markdown audit artifacts dominate.

### B) Single-File Strategy
Use a **single bounded snapshot JSON** (not unbounded append logs):
- Overwrite same file deterministically at closeout.
- Optional mid-stage updates only on controlled triggers.
- Keep bounded rolling history inside the same file (`hist`) to preserve recent context without growth.

## 4. Compact-But-Detailed Schema Direction
Proposed shape (evaluation draft):
```json
{
  "v": 1,
  "upd": "2026-02-24T16:18:00Z",
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

Density controls:
- Hard max file budget (example: 8-16 KB).
- Hard per-array caps (example: `dec/trb/lrn/nx/ref <= 8`).
- Slug-like compact entries, no markdown blocks, no long prose.
- Deduplicate references and avoid repeated facts.
- Keep `hist` bounded (example: last 2-3 snapshots only).

## 5. Update Policy (Evaluated)
Mandatory update:
- Closeout phase completion.

Optional controlled mid-stage updates (only):
- New approved contract that changes scope materially.
- Blocking regression resolved with non-obvious troubleshooting steps.
- Architecture/runtime decision that affects future execution behavior.

Non-trigger events should not update memory file, to avoid churn and token noise.

## 6. Scope Boundaries (If Contracted Later)
**In-Scope**
- Define and scaffold `referenceDocs/06_AgentMemory/`.
- Define JSON schema + budget rules for `agent-memory.json`.
- Add closeout requirement to generate/update this file.
- Add controlled mid-stage update rules to governance/playbook text.

**Out-of-Scope**
- Multi-file memory systems, vector memory, semantic retrieval engines.
- External/cloud memory stores.
- Backfilling all historical records into memory snapshots.

## 7. Risks and Constraints
- Active contract overlap risk remains (`202602240946-CONTRACT_SIP1_ONBOARDING.md`) if scaffolder files are touched in the same window.
- If constraints are too aggressive, summaries may become cryptic; if too loose, token savings erode.
- Governance must explicitly define this artifact as operational state to avoid timestamp-prefix conflict for each update.

## 8. Conclusion
Your refinement is strong and should be adopted: a dedicated `06_AgentMemory` directory plus one bounded `agent-memory.json` gives deterministic discoverability, low token overhead, and sufficient detail for next-task acceleration.

**HALT.** Evaluation complete.
