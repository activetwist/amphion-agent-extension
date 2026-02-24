# Agent Memory

This directory contains compact operational memory used for agent continuity between turns and phases.

## Canonical File
- `referenceDocs/06_AgentMemory/agent-memory.json`

## Model
- Single bounded snapshot JSON with keys: `v`, `upd`, `cur`, `hist`.
- `cur` is the current compact state.
- `hist` stores a bounded rolling window of prior snapshots.

## Update Policy
- Mandatory at closeout.
- Optional at controlled checkpoints via `/remember` (utility command).

## Density Constraints
- Keep entries concise and slug-like.
- Deduplicate repeated facts/refs.
- Keep bounded arrays and bounded `hist` (2-3 snapshots recommended).
- Keep total file size within compact budget (target 8-16 KB).

## Source-of-Truth Boundary
- `agent-memory.json` is compact operational context.
- Detailed narratives, proofs, and traceability remain in `referenceDocs/05_Records/`.
