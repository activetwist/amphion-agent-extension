# EVALUATION: Runtime Standardization Decision (Python vs Dual Runtime)

**Phase:** 1 (Evaluate)  
**Status:** Complete  
**Date (UTC):** 2026-02-23T18:40:08Z  
**Codename:** `BlackClaw`

## 1. Question
Given current Command Deck architecture and extension distribution goals, what is the rational runtime strategy: continue offering both Node + Python, or pick one side as the safer default?

## 2. Current Reality
- The product currently supports both Node and Python servers.
- Dual-runtime support has already created parity drift and bug surface (behavior differences, rendering/reload inconsistencies, endpoint parity issues).
- Persistence evolution is being considered (SQLite or similar) to improve reliability over flat-file state.

## 3. Outcome Criteria
Decision should optimize for:
1. Reliability and deterministic operator experience.
2. Lowest cross-platform shipping friction in VSIX workflows.
3. Maintainability (single truth for behavior, fewer parity bugs).
4. Viable path to durable local persistence.

## 4. Comparative Decision Summary
### Python as canonical runtime (recommended)
- **Strengths:**
  - Built-in `sqlite3` support (no external package friction).
  - Cleaner path to ACID persistence with minimal distribution overhead.
  - Lower maintenance burden if runtime behavior is standardized.
- **Weaknesses:**
  - Requires Python availability in operator environment.

### Node as canonical runtime
- **Strengths:**
  - Familiar JS ecosystem; many devs already have Node.
- **Weaknesses:**
  - SQLite parity usually introduces native addon/runtime complexity, or requires WASM tradeoffs.
  - Higher packaging and compatibility risk for cross-platform extension distribution.

### Ongoing dual-runtime support
- **Strengths:**
  - Maximum flexibility on paper.
- **Weaknesses:**
  - Highest long-term cost: parity drift, duplicate bug fixes, divergent behavior under pressure.
  - Slower feature delivery because all backend changes must be mirrored and tested twice.

## 5. Rational Path
1. **Standardize on Python as canonical runtime** for Command Deck.
2. Keep Node only as temporary compatibility path (explicitly labeled non-canonical).
3. Introduce a clear deprecation timeline for full parity expectations on Node.
4. Drive persistence upgrade through Python-first adapter-backed implementation.

## 6. Scope Boundaries for Future Work
### In Scope (future contract candidates)
- Runtime policy docs and wizard guidance updates.
- Startup/runtime fingerprinting so operators know what is active.
- Optional deprecation warnings when launching non-canonical runtime.

### Out of Scope (this finding)
- Immediate removal of Node server implementation.
- Full persistence adapter implementation.

## 7. Primitive Review
- No new primitive required for this finding itself.
- If executed, runtime-policy governance may merit a small architecture primitive documenting:
  - canonical runtime,
  - compatibility runtime,
  - support/deprecation guarantees.

## 8. Bottom Line
If you pick a side for safety and velocity, **Python is the safer side** for this product trajectory.  
Dual-runtime support should be treated as a temporary compatibility posture, not a long-term equal-footing strategy.
