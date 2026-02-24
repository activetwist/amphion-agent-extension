# Architecture Primitive: Agent Memory Lifecycle

**Primitive ID:** `AGENT_MEMORY_LIFECYCLE`  
**Date:** 2026-02-24  
**Status:** Active

## 1. Purpose
Provide deterministic, compact, and durable continuity context for agent sessions without replacing formal project records.

## 2. Canonical Location
- Directory: `referenceDocs/06_AgentMemory/`
- File: `referenceDocs/06_AgentMemory/agent-memory.json`

## 3. Data Shape (Compact)
```json
{
  "v": 1,
  "upd": "ISO-8601 timestamp",
  "cur": {
    "st": "phase-or-utility-state",
    "ms": "milestone-or-slice",
    "ct": ["active-contract-id"],
    "dec": ["decision-slug"],
    "trb": ["troubleshooting-slug"],
    "lrn": ["learning-slug"],
    "nx": ["next-step-slug"],
    "ref": ["record-or-doc-path"]
  },
  "hist": []
}
```

## 4. Lifecycle Rules
- Mandatory memory update at closeout.
- Optional controlled update via `/remember` during long sessions and durable decision points.
- `/remember` is utility-only and does not change phase.
- `hist` is bounded to a short rolling window.

## 5. Density Constraints
- Keep compact, slug-like entries.
- Deduplicate repeated values.
- Keep file size bounded (target 8-16 KB).

## 6. Precedence Rules
- `05_Records/` documents remain detailed narrative evidence.
- `agent-memory.json` is compact operational memory for continuity and rapid context restoration.
- If conflict exists, prefer formal records for detailed truth and memory for quick state hints.

## 7. Validation Surface
- `referenceDocs/04_Analysis/scripts/validate_closeout_hygiene.py`
  - Validates required memory artifacts and bounded schema constraints.

## 8. Non-Goals
- No vector embeddings.
- No autonomous periodic background writes.
- No unbounded append-only memory logs.
