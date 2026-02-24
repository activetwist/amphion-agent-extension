# EVALUATION: Node Persistence Alternatives (Outcome-First)

**Phase:** 1 (Evaluate)  
**Status:** Complete  
**Date (UTC):** 2026-02-23T18:20:56Z  
**Codename:** `BlackClaw`

## 1. Request
Evaluate Node-side alternatives that can deliver reliability/performance outcomes comparable to Python `sqlite3`, without over-committing to a single technology.

## 2. Current-State Constraints
- Node Command Deck runtime is intentionally stdlib-only and currently JSON file-backed.
- Extension is shipped as VSIX, so cross-platform install friction matters.
- Runtime is user-selected (Node or Python), so persistence strategy should avoid hidden capability mismatch.

## 3. Outcome Requirements (Technology-Agnostic)
Target outcomes for any candidate:
1. ACID-style transactional safety (or near-equivalent durability guarantees).
2. Better write/read scaling than monolithic JSON rewrites.
3. Deterministic local/offline behavior.
4. Low-friction extension distribution across macOS/Windows/Linux.
5. Clear migration path from existing `state.json`.

## 4. Node Option Matrix
### Option A — SQLite via native addon (`better-sqlite3` / `sqlite3`)
- **Capability:** Strong (real SQLite transactions, indexes, mature ecosystem).
- **Performance:** Strong for local app workloads.
- **Packaging:** Medium/High risk due to native binaries/toolchain/ABI/platform matrix.
- **Best for:** Teams willing to manage native dependency complexity.

### Option B — Built-in/standardized Node SQLite API (if runtime supports it)
- **Capability:** Potentially strong (if available/stable in target Node versions).
- **Performance:** Strong.
- **Packaging:** Lower than native addons if no external binary needed.
- **Risk:** Runtime-version coupling; VS Code users may not have matching Node runtime for all environments.
- **Best for:** Strictly controlled runtime matrix with verified Node version support.

### Option C — WASM SQLite (`sql.js`-style approach)
- **Capability:** Moderate/Strong (SQL semantics, local DB file possible).
- **Performance:** Moderate (often sufficient for Command Deck scale).
- **Packaging:** Low friction (pure JS/WASM, no native compile).
- **Risk:** Manual persistence plumbing and potential memory/perf tradeoffs.
- **Best for:** Extension-first portability with minimal install friction.

### Option D — Non-SQL embedded stores (`lmdb`, `leveldb`, document stores)
- **Capability:** Mixed; good durability/perf, weaker relational querying unless heavily wrapped.
- **Packaging:** Varies (often native binaries).
- **Risk:** More custom query/modeling work to match SQL-like outcomes.
- **Best for:** KV/document-heavy systems, less ideal when relational/reporting expectations grow.

### Option E — Remote DB/service
- **Capability:** Strong features but network-dependent.
- **Packaging:** Simple client-side; operationally complex.
- **Risk:** Breaks local/offline deterministic behavior and increases ops surface.
- **Best for:** Multi-user shared deployments, not ideal for local-first Command Deck.

## 5. Practical Recommendation
**Use a dual-lane strategy by outcome and friction:**
1. **Primary lane (lowest risk now):** Python `sqlite3` backend as default durable mode.
2. **Node lane:** Start with **WASM SQLite** for portability, or native SQLite addon only if you accept cross-platform binary management.
3. Introduce a **Persistence Adapter** abstraction so runtime/backend choices are swappable behind one contract.

This gives you reliability gains without forcing an early all-or-nothing Node binary packaging decision.

## 6. Scope for Follow-on Contract
### In Scope
- Define persistence adapter interface and capability matrix.
- Add backend selection policy (`json` / `sqlite-python` / `sqlite-node`).
- Document runtime support table and fallback behavior.
- Specify migration contract from `state.json`.

### Out of Scope
- Full implementation of every Node backend option in one slice.
- Multi-tenant server/database architecture redesign.

## 7. Primitive Review
- **New primitive recommended:** `Persistence Capability Matrix + Adapter`.
- Purpose: make runtime/backend compatibility explicit and prevent invisible divergence between Node/Python behavior.

## 8. Bottom Line
Yes, Node can achieve essentially the same outcomes as Python `sqlite3`, but the best option depends on your packaging tolerance:
- prioritize **portability**: WASM SQLite route,
- prioritize **raw SQLite maturity/performance**: native addon route,
- prioritize **lowest immediate risk**: Python-first SQLite plus adapter-based phased Node evolution.
