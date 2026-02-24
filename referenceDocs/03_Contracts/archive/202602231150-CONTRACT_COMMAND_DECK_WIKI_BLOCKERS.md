# CONTRACT: Command Deck Wiki Blockers Remediation Bundle

**Phase:** 2.0 (Contract)  
**Status:** Proposed  
**Date:** 2026-02-23  
**Codename:** `BlackClaw`

**Source Evaluation:** `referenceDocs/04_Analysis/findings/202602231145-COMMAND_DECK_WIKI_BLOCKERS_EVAL.md`

## 1. Goal
Resolve the four blocking wiki issues in Command Deck so authoring is operational again:
1. New document creation does not work.
2. Delete does not work.
3. Hyperlinks do not work.
4. Image placement/upload does not work.

## 2. Approved AFPs (Affected File Paths)
- `referenceDocs/03_Contracts/active/202602231150-CONTRACT_COMMAND_DECK_WIKI_BLOCKERS.md` (this contract)
- `ops/launch-command-deck/public/app.js`
- `ops/launch-command-deck/public/index.html`
- `ops/launch-command-deck/server.js`

## 3. Scope Boundaries
- **In Scope:**
  - Persist new note creation and refresh tree visibility immediately.
  - Make wiki delete transport robust across clients by supporting query-path delete.
  - Preserve editor selection/focus for toolbar-driven link insertion.
  - Fix binary image upload parsing route and ensure insertion at intended cursor.
  - Validate behavior in both visual and code modes where applicable.
- **Out of Scope:**
  - Wiki/Notes naming or broad copy polish.
  - Visual redesign or styling changes beyond required bug remediation.
  - Rich text engine replacement (`document.execCommand` migration).
  - Extension asset mirror updates outside `ops/launch-command-deck` for this unblock pass.

## 4. Deterministic Execution Plan
1. **New Document Persistence (AM-060)**
   - Update create flow to persist file creation immediately using existing wiki file API.
   - Refresh wiki tree and preserve editor context on created file.
2. **Delete Transport Hardening (AM-061)**
   - Client: send delete path on query string (`/api/wiki/files?path=...`).
   - Server: parse `path` from query first; retain JSON body fallback for compatibility.
3. **Hyperlink Insertion Repair (AM-062)**
   - Prevent toolbar mouse interactions from stealing editor focus before command handlers.
   - Ensure selection capture/restore logic inserts link at intended range in visual mode.
4. **Image Upload + Placement Repair (AM-063)**
   - Server: route `/api/wiki/images` through raw-body handling before JSON parse path.
   - Client: reuse stabilized selection strategy so inserted image lands at intended cursor.
5. **Verification**
   - Manual validation for create/delete/link/image in visual mode and code mode fallback paths.
   - Regression check for wiki save/open existing file flows.

## 5. Risk Assessment
- **Selection API Fragility (Medium):** Browser range handling can vary in `contenteditable`.
  - **Mitigation:** Centralize selection capture/restore and verify with toolbar + keyboard paths.
- **Delete Backward Compatibility (Low/Medium):** Query-path precedence may diverge from older body-only behavior.
  - **Mitigation:** Keep body fallback and explicit missing-path error path.
- **Request Parsing Regression (Medium):** Reordering POST parsing could affect unrelated JSON routes.
  - **Mitigation:** Restrict binary short-circuit to `/api/wiki/images` only.

## 6. Acceptance Criteria
- [ ] Creating a new note persists it to disk and it appears in tree immediately.
- [ ] Deleting an existing note succeeds reliably and clears editor state.
- [ ] Missing delete path returns deterministic validation error.
- [ ] Link insertion in visual mode places link at intended selection/cursor.
- [ ] Image upload no longer fails with malformed JSON and inserts at intended selection/cursor.
- [ ] Code mode behavior for link/image insertion remains functional.
- [ ] Existing wiki save/open flows remain functional.

## 7. Work Item Mapping
- `AM-060`: Fix wiki new document creation persistence
- `AM-061`: Harden wiki delete transport across clients
- `AM-062`: Repair wiki hyperlink insertion selection handling
- `AM-063`: Fix wiki image upload parsing and placement

## 8. Active Contract Conflict Check
Potential overlap exists with active files:
- `referenceDocs/03_Contracts/active/20260223-NOTES_POLISH.md`
- `referenceDocs/03_Contracts/active/20260223-NOTES_POLISH_V2.md`
- `referenceDocs/03_Contracts/active/20260223-NOTES_POLISH_V3.md`

Conflict flagged: these contracts touch similar wiki AFPs. For this unblock pass, execution should be constrained to this contract's scope and acceptance criteria.

## 9. Operator Approval Gate
Execution is blocked pending operator approval.  
To begin implementation, invoke:

`/execute 202602231150-CONTRACT_COMMAND_DECK_WIKI_BLOCKERS.md`
