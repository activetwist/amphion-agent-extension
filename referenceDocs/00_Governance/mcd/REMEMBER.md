# REMEMBER · AmphionAgent

**Type:** Utility Command (Non-Phase)  
**Status:** Canonical Instruction Set  
**Codename:** `BlackClaw`

## When to Use
Use this command to capture a compact memory checkpoint without changing lifecycle phase.

## Inputs
- [ ] Current contract context (if any)
- [ ] Durable decisions/troubleshooting outcomes worth preserving
- [ ] Current milestone/slice identifier

## Instructions
1. **Read Current Memory**: Load `referenceDocs/06_AgentMemory/agent-memory.json` if it exists; initialize it if missing.
2. **Capture Snapshot**: Update `cur` with concise state (`st`, `ms`, `ct`, `dec`, `trb`, `lrn`, `nx`, `ref`) and refresh `upd` timestamp.
3. **Bounded History**: Push previous `cur` into `hist` and keep only the latest bounded window (2-3 snapshots).
4. **Density Control**: Keep entries compact, deduplicated, and within documented cap limits.
5. **No Phase Transition**: Confirm checkpoint completion and remain in current lifecycle phase.

## Guardrails
- `/remember` is utility-only and cannot replace Evaluate/Board/Contract/Execute/Closeout.
- Do not include long prose; use short slug-like entries.
- Do not write speculative or unverified facts into memory.

## Output
- [ ] Updated `referenceDocs/06_AgentMemory/agent-memory.json`.
- [ ] Brief user-facing confirmation that memory checkpoint was recorded.
