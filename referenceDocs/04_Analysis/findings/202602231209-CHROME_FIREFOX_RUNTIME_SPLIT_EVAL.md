# EVALUATE: Chrome vs Firefox Divergence on Wiki Actions

## Objective
Determine why Command Deck wiki actions behave differently across browsers (Chrome failing while Firefox partially succeeds), and define a deterministic unblock path.

## Constraints
- Phase: **EVALUATE only** (no implementation changes in this phase)
- Focus: runtime behavior of `ops/launch-command-deck` wiki endpoints and launch paths
- Preserve scope discipline: identify root cause(s), boundaries, and next contract options

## Research Findings

### Finding 1: Runtime asymmetry exists and is severe (`server.js` vs `server.py`)
The JavaScript runtime (`server.js`) and Python runtime (`server.py`) are not behaviorally equivalent for wiki endpoints.

- `server.js` currently supports:
  - query-path delete fallback for `/api/wiki/files?path=...`
  - binary-safe `/api/wiki/images` handling before JSON body parsing
- `server.py` still contains critical wiki defects:
  - `DELETE /api/wiki/files` crashes due undefined `body` variable (`NameError`) in `do_DELETE`.
    - Evidence: `ops/launch-command-deck/server.py:929`
  - `POST /api/wiki/images` fails as malformed JSON because `do_POST` always parses JSON first.
    - Evidence: `ops/launch-command-deck/server.py:553`
  - no `/api/wiki/images` route implementation in Python server.
  - static serving does not handle `/wiki-assets/*` path, causing uploaded asset 404.
    - Evidence: `ops/launch-command-deck/server.py:948`

### Finding 2: Default launch path still points to Python runtime
- `run.sh` launches `server.py` by default.
  - Evidence: `ops/launch-command-deck/run.sh:8`
- README also instructs `python3 server.py`.
  - Evidence: `ops/launch-command-deck/README.md:7`

This means users can be on the unfixed runtime even if `server.js` was patched.

### Finding 3: Reproduced transport differences that match user symptoms
Using local probes against Python runtime (`127.0.0.1:8878`):
- `POST /api/wiki/files`: returns `200` (create can work)
- `DELETE /api/wiki/files?path=...`: empty reply (server crash)
- `POST /api/wiki/images` with binary: `400 Malformed JSON`
- `GET /wiki-assets/<file>`: `404 Not Found`

Observed Python traceback confirms crash:
- `NameError: name 'body' is not defined`
- Evidence line: `ops/launch-command-deck/server.py:929`

## Gap Analysis
The current system has **runtime parity drift**:
- Fixes were applied to `server.js`, but canonical launch path still routes operators to `server.py`.
- Browser-specific user reports can be explained by clients hitting different runtime/host/port combinations, not by purely browser-rendering differences.

## Scope Definition
### In Scope
- Decide and enforce one of:
  1. **Runtime parity**: apply wiki fixes to `server.py` to match `server.js`, or
  2. **Runtime unification**: make launch path default to `server.js` and deprecate Python path for this surface.
- Add explicit runtime fingerprinting guidance for operators (host/port/runtime verification).

### Out of Scope
- Broad UI redesign or editor engine migration.
- Non-wiki feature refactors.

## Risks and Unknowns
- If both runtimes remain active without parity guarantees, regressions will continue to appear as “browser-specific” false positives.
- If launch docs/scripts are not aligned with chosen runtime, operator behavior remains nondeterministic.
- Existing active contracts may overlap on wiki AFPs and require conflict resolution before execute.

## Primitive Review
No new Architecture Primitive is required. This is a runtime-governance and endpoint-parity correction.

## Recommended Next Contract Direction
1. Contract a **Runtime Parity Remediation** for `server.py` wiki endpoints (`create/delete/image/assets`) to mirror `server.js` behavior exactly.
2. Contract a **Launch Path Alignment** update (`run.sh` and README) so default operator path is deterministic.
