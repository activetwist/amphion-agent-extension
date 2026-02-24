# EVALUATE: Command Deck Wiki Blockers

## Objective
Unblock Command Deck wiki authoring by identifying deterministic root causes for the four reported failures:
1. New document creation
2. Delete
3. Hyperlink insertion
4. Image placement/upload

## Constraints
- Phase: **EVALUATE only** (no implementation changes in this phase)
- Focus surface: `ops/launch-command-deck/public/*` and `ops/launch-command-deck/server.js`
- Keep fixes minimal and scoped to wiki behavior

## Research Findings

### Finding 1: New document creation is only client-local and never persisted
- Evidence: `createNewWikiFile()` sets local editor state only and does not call `saveWikiFile()`.
- Evidence paths:
  - `ops/launch-command-deck/public/app.js:977`
  - `ops/launch-command-deck/public/app.js:993`
- Impact:
  - New note does not exist on disk, so it does not appear in the wiki tree (`loadWikiTree()` only renders backend files).
  - Operator perceives "New Note" as broken.

### Finding 2: Wiki delete depends on JSON body in `DELETE`, which is not reliable across clients
- Evidence: client sends `DELETE /api/wiki/files` with JSON body (`{ path }`).
  - `ops/launch-command-deck/public/app.js:958`
- Evidence: server delete handler expects `body.path` and fails with `Path is required` when body is missing.
  - `ops/launch-command-deck/server.js:809`
  - `ops/launch-command-deck/server.js:864`
  - `ops/launch-command-deck/server.js:865`
- Impact:
  - Cross-browser/proxy differences can drop/ignore `DELETE` body, producing hard delete failure.

### Finding 3: Hyperlink insertion loses intended cursor/selection on toolbar click
- Evidence: toolbar buttons are plain `<button class="btn-tool" onclick="...">` with no `mousedown` prevention.
  - `ops/launch-command-deck/public/index.html:216`
  - `ops/launch-command-deck/public/index.html:238`
- Evidence: `promptWikiLink()` captures selection at click-time, after focus may already move away from editor.
  - `ops/launch-command-deck/public/app.js:794`
  - `ops/launch-command-deck/public/app.js:807`
- Impact:
  - Link insertion uses a stale/invalid range or inserts at wrong location; appears non-functional.

### Finding 4: Image upload path is parsed as JSON before route-specific binary handling
- Evidence: `handlePost()` globally executes `readBody(req)` before route dispatch.
  - `ops/launch-command-deck/server.js:573`
  - `ops/launch-command-deck/server.js:575`
- Evidence: image route expects raw binary via `readBodyRaw(req)`.
  - `ops/launch-command-deck/server.js:715`
  - `ops/launch-command-deck/server.js:717`
- Evidence: client sends raw `ArrayBuffer` for image upload.
  - `ops/launch-command-deck/public/app.js:1338`
  - `ops/launch-command-deck/public/app.js:1342`
- Impact:
  - Binary request hits JSON parser first and fails as malformed JSON, blocking upload.
  - Secondary placement fragility exists due to the same selection-loss behavior as hyperlinks.

## Gap Analysis
Current implementation lacks reliable transport and selection guarantees for wiki editing primitives:
- Persistence gap: `create` path does not persist new files.
- Transport gap: delete path depends on fragile `DELETE` body semantics.
- Selection gap: toolbar actions rely on browser focus behavior that invalidates editor selection.
- Parsing gap: server request parsing is not route-safe for binary endpoints.

## Scope Definition
### In Scope
- Wiki file create/delete API integration (`public/app.js`, `server.js`)
- Wiki toolbar selection preservation for link/image and formatting actions (`public/index.html`, `public/app.js`)
- Binary-safe handling for `/api/wiki/images` (`server.js`)
- Validation for create/delete/link/image flows in both visual and code modes

### Out of Scope
- Rich text engine replacement (`document.execCommand` migration)
- Wiki permission model changes
- Non-wiki board/card API behavior
- UI redesign outside necessary bug fixes

## Proposed Remediation (for CONTRACT phase)
1. **New document create**
- Persist immediately after scaffold (call `saveWikiFile()` or direct `POST /api/wiki/files`) and refresh tree.
- Ensure newly created path is selected/visible in tree after save.

2. **Delete transport hardening**
- Client: send `path` on query string for `DELETE /api/wiki/files?path=...`.
- Server: accept `path` from query first, then body fallback for backward compatibility.

3. **Hyperlink reliability**
- Prevent toolbar buttons from stealing focus on `mousedown`.
- Capture/restore selection around prompt and insertion paths.

4. **Image upload + placement reliability**
- Server: short-circuit `/api/wiki/images` route before JSON body parsing; use raw body only.
- Client: reuse stabilized selection strategy so inserted image lands at intended cursor.

## Risks and Unknowns
- Browser differences in selection/range behavior inside `contenteditable` (Safari needs explicit validation).
- Existing notes with unusual filenames may expose path sanitization edge cases.
- If query/body precedence is not explicit, delete behavior can regress for old clients.

## Primitive Review
No new Architecture Primitives are required. This is a contained reliability repair within existing wiki frontend/backend primitives.

## Candidate Approved File Paths (for CONTRACT)
- `ops/launch-command-deck/public/app.js`
- `ops/launch-command-deck/public/index.html`
- `ops/launch-command-deck/server.js`
