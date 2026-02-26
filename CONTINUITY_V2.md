# AmphionAgent v2 Continuity File

Prepared: 2026-02-26 (local)
Workspace root: `/Users/sembetu/Developer/AmphionAgentv2`
Codename: `BLACKCLAW`

## Agent Instructions (Canonical)

### Evolved MCD (v2) with DB Constraints

#### Evaluate
1. Read governance + phase command docs.
2. Research/scope only; no implementation changes.
3. Create/update evaluation context on the live board runtime (SQLite/API canonical).
4. Hard stop after findings; ask for Contract authorization.

#### Contract
1. Build milestone-bound macro/micro contract cards in Command Deck (DB canonical).
2. Define acceptance criteria + AFPs (approved file paths).
3. Populate/verify board visibility via API/UI.
4. Hard stop after contract; ask for Execute authorization.

#### Execute
1. Implement only approved AFP scope from active approved contract cards.
2. Run verification/tests per contract.
3. If scope must change, halt and return to Contract.

#### Closeout
1. Archive/close milestone via API with deterministic outcomes artifact.
2. Record memory events, validate memory state, export compatibility snapshot only if needed.
3. Perform closeout hygiene validation and final `closeout:` commit when in scope.

### DB / Canonical Constraints

1. Board/contracts/milestones: SQLite runtime via API, not flat-file `state.json`.
2. Memory authority: `/api/memory/*` -> SQLite (`memory_events` + materialized state/LWW by `memoryKey`).
3. `agent-memory.json` is compatibility/export, not source of truth.
4. No canonical direct raw SQL mutation path for agent workflows.
5. `/remember` is utility-only; never advances lifecycle phase.
6. `BOARD` is deprecated as a standalone phase (board population is part of Contract).
7. New work must always be milestone-bound; do not route into write-closed pre-flight milestones.

## 1) Hard Constraints for All Future Agent Sessions

1. Use `/Users/sembetu/Developer/AmphionAgentv2` as the working directory for this project.
2. Do not route work back to `/Users/sembetu/Developer/AmphionAgent` unless explicitly instructed by the user.
3. Treat v2 as the continuity base and active workspace moving forward.

## 2) Immediate Startup Protocol (First Actions in Any New Chat)

Before taking task actions, the agent must:

1. Confirm current phase intent with the user.
2. Read these files in order:
   - `AGENTS.md`
   - `CLAUDE.md`
   - `referenceDocs/00_Governance/GUARDRAILS.md`
   - `referenceDocs/00_Governance/MCD_PLAYBOOK.md`
   - Phase command file in `referenceDocs/00_Governance/mcd/` matching requested phase.
3. Enforce Halt-and-Prompt:
   - After `EVALUATE`: stop and ask operator authorization for `CONTRACT`.
   - After `CONTRACT`: stop and ask operator authorization for `EXECUTE`.
4. Ensure milestone binding before creating new work cards.

## 3) Evolved MCD Method (Current Canonical Model)

The project now runs an evolved MCD flow with DB-canonical operational state:

1. Lifecycle phases: `Evaluate -> Contract -> Execute -> Closeout`.
2. `BOARD` is deprecated as a standalone phase; board population is required inside `CONTRACT`.
3. Board and card authority is API/SQLite runtime, not flat-file `state.json`.
4. Memory authority is DB-backed (`/api/memory/*`) with optional compatibility export.
5. `/remember` is utility-only and does not advance phase.
6. No phase chaining is allowed.

Primary references:

- `referenceDocs/00_Governance/mcd/EVALUATE.md`
- `referenceDocs/00_Governance/mcd/CONTRACT.md`
- `referenceDocs/00_Governance/mcd/EXECUTE.md`
- `referenceDocs/00_Governance/mcd/CLOSEOUT.md`
- `referenceDocs/00_Governance/mcd/REMEMBER.md`
- `referenceDocs/00_Governance/mcd/BOARD.md`

## 4) Current Project State Snapshot

Repository:
- Branch: `main`
- Recent commit head: `e22f0b9` (`chore: scope-lock v2 baseline and strip local runtime artifacts`)
- Current release: **1.50.0**. Package artifact: `mcd-starter-kit-dev/extension/amphion-agent-1.50.0.vsix`. Historical closeouts include v1.29.0 and earlier milestone closeouts.

Working tree at snapshot:
- Modified: `.DS_Store`, `referenceDocs/.DS_Store`, `referenceDocs/05_Records/.DS_Store`
- Untracked: `referenceDocs/05_Records/documentation/helperContext/amphion-agent-launch-command-deck.json`

Contract/milestone context:
- `referenceDocs/03_Contracts/` contains archived contracts only (no active flat-file contracts).
- Last observed model indicates DB-canonical contract cards are primary authority.
- New implementation work should begin from `EVALUATE` unless user explicitly points to an active approved DB contract set.

## 5) v2 Intent and Direction

The v2 workspace exists as the forward base for continued development and publication readiness.

Anchor manifest:
- `referenceDocs/00_Governance/202602260130-AMP008_V2_BASELINE_SCOPE_MANIFEST.md`

Manifest intent:
- Keep essential source and governance in scope.
- Exclude local runtime state/noise artifacts from publish scope.
- Continue AMP-series delivery in clean-room v2 workflow without losing operational continuity.

## 6) Canonical Runtime and Memory Locations

Command Deck runtime:
- `.amphion/command-deck/server.py`
- `.amphion/command-deck/data/amphion.db`
- `.amphion/command-deck/run.sh`

Compatibility runtime mirror:
- `ops/launch-command-deck/server.py`
- `ops/launch-command-deck/data/amphion.db` (local runtime state, generally excluded from publish scope)

Memory:
- DB canonical: `.amphion/command-deck/data/amphion.db` via `/api/memory/*`
- Compatibility export: `referenceDocs/06_AgentMemory/agent-memory.json`

Key memory primitives:
- `referenceDocs/02_Architecture/primitives/202602250325-DB_BACKED_DETERMINISTIC_MEMORY_KERNEL.md`
- `referenceDocs/02_Architecture/primitives/202602241144-AGENT_MEMORY_LIFECYCLE_PRIMITIVE.md`

## 7) Operational Rules to Preserve Continuity

1. Do not perform core-file changes without active approved contract scope.
2. Keep all new work milestone-bound; do not target write-closed pre-flight milestones.
3. Keep architecture diagrams in Mermaid format where applicable.
4. Follow deterministic naming and governance checks from `GUARDRAILS.md`.
5. At closeout, ensure:
   - Outcomes artifact recorded.
   - Memory checkpoint recorded and verified.
   - `closeout:` commit completed when in scope.

## 8) Suggested First Prompt for a New Agent Chat

Use this exact kickoff to restore continuity fast:

```text
Use /Users/sembetu/Developer/AmphionAgentv2 as the only working directory.
Read CONTINUITY_V2.md first, then AGENTS.md and the MCD governance docs.
Confirm current lifecycle phase, verify milestone targeting, and start with EVALUATE unless an approved active CONTRACT already exists in DB runtime.
Do not chain phases; halt after each phase for my authorization.
We are continuing forward with the v2 baseline and evolved DB-canonical MCD method.
```

## 9) Minimal Verification Checklist for Session Start

1. `pwd` equals `/Users/sembetu/Developer/AmphionAgentv2`.
2. Governance files loaded (`AGENTS.md`, `GUARDRAILS.md`, `MCD_PLAYBOOK.md`, phase command file).
3. Active milestone target identified (or requested from user).
4. Phase and stop-point explicitly stated before tools run.

---

If this file and a future instruction conflict, prioritize explicit user instruction, then governance guardrails.
