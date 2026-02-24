# EVALUATION: Command Deck Persistence Upgrade (Flat File vs SQLite)

**Phase:** 1 (Evaluate)  
**Status:** Complete  
**Date (UTC):** 2026-02-23T18:16:06Z  
**Codename:** `BlackClaw`

## 1. Request
Assess whether Command Deck performance/reliability would improve by replacing fragile flat-file persistence with SQLite (or similar), while preserving extension-shippable behavior.

## 2. Current-State Research
- Command Deck currently persists board state to one JSON file:
  - `ops/launch-command-deck/data/state.json`
- Both server runtimes are file-backed:
  - Python server (`ops/launch-command-deck/server.py`) uses in-memory state + atomic JSON writes.
  - Node server (`ops/launch-command-deck/server.js`) uses in-memory state + atomic JSON writes.
- Scaffolding and launch support both runtimes:
  - `mcd-starter-kit-dev/extension/src/scaffolder.ts` starts `node .../server.js` or `python3 .../server.py`.
- Current design intentionally has zero external runtime dependencies in both servers.

## 3. Gap Analysis
### Gap A: Scaling fragility with monolithic JSON
- Every mutation rewrites the entire state document.
- As boards/cards/history scale, write cost and merge conflict probability increase.

### Gap B: Query limitations
- Read patterns are currently full-document snapshot reads and in-memory filtering.
- No indexed querying for specific views (cards by list/milestone/status/date, etc.).

### Gap C: Concurrency/recovery model is limited
- Atomic file replace protects partial writes, but there is no transaction log, partial rollback, or schema-managed migrations.
- Multi-process access patterns remain brittle.

## 4. Value Assessment (Would SQLite help?)
**Yes — there is real value**, primarily in:
- Transactional durability (ACID semantics, recovery guarantees).
- Better write/read efficiency for growing datasets.
- Easier future features (search/filter/reporting/history) via indexed queries.
- Reduced fragility vs single large JSON file for collaborative/operator-heavy workflows.

For current small data sizes, speed gains may be modest, but reliability and long-term maintainability gains are meaningful.

## 5. Extension Shipping Feasibility
**Yes, this is shippable with the extension**, but runtime strategy matters:

### Option 1 (Recommended first): Python-default SQLite
- Python includes `sqlite3` in stdlib (no extra package requirement).
- Keeps extension packaging simple and cross-platform.
- Works best if Command Deck runtime is Python (already default in wizard).

### Option 2: Node SQLite
- Node stdlib has no built-in sqlite API in common LTS distributions used by users.
- Typical packages (`better-sqlite3`, `sqlite3`) introduce native binaries/toolchain complexity across OS/architectures.
- Higher risk for extension distribution friction.

### Option 3: Keep JSON, add resilience features
- Lower risk, but does not fully solve transactional/query limitations.
- Could be an interim hardening path (journal snapshots, compaction, segmented files).

## 6. Recommended Direction
1. Introduce a **Persistence Adapter** abstraction with two backends:
   - `json` (current)
   - `sqlite` (new)
2. Implement SQLite backend in Python server first (default path).
3. Keep Node server on JSON initially, or gate SQLite as Python-only in first release.
4. Add deterministic migration bootstrap:
   - if `state.json` exists and DB absent, import JSON into DB once.
5. Preserve extension shipping simplicity:
   - avoid native Node DB dependency in first rollout.

## 7. Scope Definition for Follow-on Contract
### In Scope
- Design persistence adapter contract.
- Implement SQLite schema + repository layer for Python server.
- JSON-to-SQLite one-time import path.
- Runtime flag/config for backend selection.
- Backward-compatible export/import path.

### Out of Scope
- Full Node SQLite parity in same slice.
- Cross-process distributed locking across unrelated services.
- Full analytics/reporting redesign.

## 8. Primitive Review
- **New Architecture Primitive recommended:** `Persistence Adapter` (`json` + `sqlite` backends, migration contract, compatibility guarantees).
- This should be documented in `referenceDocs/02_Architecture/primitives/` before execution.

## 9. Risk Assessment
- **Migration Risk (Medium):** JSON-to-SQLite import may lose shape fidelity if schema is underspecified.
  - **Mitigation:** deterministic schema mapping + migration verification checks.
- **Runtime Divergence Risk (Medium):** Python and Node behavior may drift if only one backend is upgraded first.
  - **Mitigation:** explicit capability matrix and runtime guardrails.
- **Operational Risk (Low):** Existing projects may expect direct `state.json` edits.
  - **Mitigation:** keep export or compatibility write-through mode during transition.

## 10. Bottom Line
There is clear value in moving to SQLite for reliability and future growth, and it can be shipped safely with the extension if phased carefully (Python-first SQLite, adapter abstraction, migration path, and compatibility guardrails).
