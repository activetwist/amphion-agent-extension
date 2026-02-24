# CONTRACT: Runtime Parity for Wiki + Launch Path Alignment

**Phase:** 2.0 (Contract)  
**Status:** Proposed  
**Date:** 2026-02-23  
**Codename:** `BlackClaw`

**Source Evaluation:** `referenceDocs/04_Analysis/findings/202602231209-CHROME_FIREFOX_RUNTIME_SPLIT_EVAL.md`

## 1. Goal
Eliminate runtime-driven wiki failures by aligning Python runtime behavior with Node runtime for wiki endpoints and making the launch path deterministic for operators.

## 2. Approved AFPs (Affected File Paths)
- `referenceDocs/03_Contracts/active/202602231211-CONTRACT_RUNTIME_PARITY_WIKI_AND_LAUNCH.md` (this contract)
- `ops/launch-command-deck/server.py`
- `ops/launch-command-deck/run.sh`
- `ops/launch-command-deck/README.md`

## 3. Scope Boundaries
- **In Scope:**
  - Fix `server.py` wiki endpoint behavior to match `server.js` semantics for:
    - create/read/delete file flow
    - image binary upload flow
    - wiki asset static serving flow
  - Remove `DELETE /api/wiki/files` crash path in Python runtime.
  - Align launch script and README instructions to a deterministic runtime strategy.
  - Add explicit operator runtime verification guidance (how to confirm active runtime/port).
- **Out of Scope:**
  - Frontend UI redesign or additional wiki toolbar feature work.
  - Rich text engine changes.
  - Non-wiki API behavior refactors.
  - Extension asset mirror changes.

## 4. Deterministic Execution Plan
1. **Python Wiki Delete Hardening (AM-064)**
   - Implement safe body/query handling in `do_DELETE`.
   - Support query path (`/api/wiki/files?path=...`) with body fallback.
   - Return deterministic validation errors instead of crashing.
2. **Python Image Upload Parity (AM-064)**
   - Route `/api/wiki/images` through raw binary handling before JSON parse.
   - Write uploaded files to wiki assets and return `/wiki-assets/<file>` path.
3. **Python Static Asset Parity (AM-064)**
   - Extend static serving to support `/wiki-assets/*` from wiki assets directory.
4. **Launch Path Alignment (AM-065)**
   - Update `run.sh` and `README.md` to reflect chosen runtime strategy and exact commands.
   - Document quick runtime fingerprint checks for operator verification.
5. **Verification**
   - API smoke checks on selected default runtime:
     - create note
     - delete note (query path + fallback behavior)
     - image upload (binary)
     - wiki asset retrieval
   - Confirm no server exceptions in these flows.

## 5. Risk Assessment
- **Parity Drift Risk (Medium):** Python and Node can diverge again.
  - **Mitigation:** Match endpoint semantics explicitly and document verification commands.
- **Launch Confusion Risk (Medium):** Operators may continue using old run habits.
  - **Mitigation:** Update `run.sh` + README together and include runtime verification steps.
- **Path Safety Risk (Low/Medium):** File path handling can introduce traversal issues.
  - **Mitigation:** Keep canonical resolved-path boundary checks for wiki root/assets.

## 6. Acceptance Criteria
- [ ] `DELETE /api/wiki/files` in Python runtime no longer crashes and supports query path.
- [ ] Missing delete path returns deterministic `Path is required` error in Python runtime.
- [ ] `POST /api/wiki/images` accepts binary payload in Python runtime (no malformed JSON failure).
- [ ] Uploaded image files are retrievable via `/wiki-assets/<filename>` in Python runtime.
- [ ] `run.sh` and `README.md` reflect the same deterministic runtime strategy.
- [ ] Runtime verification guidance is present and actionable.
- [ ] Cross-browser wiki create/delete/image flows are no longer runtime-dependent for operators following documented launch path.

## 7. Work Item Mapping
- `AM-064`: Runtime parity: align Python wiki APIs with Node
- `AM-065`: Launch path alignment for deterministic runtime

## 8. Active Contract Conflict Check
Potential overlap with existing active wiki contracts:
- `referenceDocs/03_Contracts/active/202602231150-CONTRACT_COMMAND_DECK_WIKI_BLOCKERS.md`
- `referenceDocs/03_Contracts/active/20260223-NOTES_POLISH.md`
- `referenceDocs/03_Contracts/active/20260223-NOTES_POLISH_V2.md`
- `referenceDocs/03_Contracts/active/20260223-NOTES_POLISH_V3.md`

Conflict flagged: this contract is limited to runtime/backend parity and launch-path governance AFPs listed above.

## 9. Operator Approval Gate
Execution is blocked pending operator approval.  
To begin implementation, invoke:

`/execute 202602231211-CONTRACT_RUNTIME_PARITY_WIKI_AND_LAUNCH.md`
