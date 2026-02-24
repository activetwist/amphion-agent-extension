# EVALUATE: Command Deck Wiki/Notes Archival + Removal

## Objective
Define a deterministic plan to shelve the Wiki/Notes feature immediately, remove it from the running Command Deck application, and prepare for a clean implementation tree for the next workstream.

## Constraints
- Phase: **EVALUATE only** (no implementation in this phase)
- Preserve stability of non-Wiki surfaces (Board, Dashboard, Charts, Guide)
- Scope must support a fast unblock path for Chrome/Firefox parity concerns by removing the failing feature surface

## Research Findings

### Finding 1: Wiki/Notes is deeply coupled into frontend state, markup, events, and styling
- `ops/launch-command-deck/public/index.html` includes a dedicated Notes tab (`data-view="wiki"`), a full `#wikiView` workspace, and wiki-only toolbar controls.
- `ops/launch-command-deck/public/app.js` contains substantial wiki-specific state, API calls, selection logic, editor modes, upload handlers, and keyboard shortcuts.
- `ops/launch-command-deck/public/styles.css` includes a large wiki-specific ruleset (`.wiki-*`, `html[data-wiki-mode=...]`, table tool styles).

### Finding 2: Wiki/Notes is also coupled into both server runtimes
- `ops/launch-command-deck/server.js` includes `WIKI_DIR`, wiki CRUD endpoints, image upload endpoint, and `/wiki-assets/*` static serving branch.
- `ops/launch-command-deck/server.py` mirrors the same wiki surface (`WIKI_DIR`, `/api/wiki/*`, `/wiki-assets/*` handling).

### Finding 3: Existing board backlog/work records currently assume Wiki will continue
- `ops/launch-command-deck/data/state.json` has active Wiki backlog cards (`AM-048` through `AM-065`) and recent parity/remediation tasks tied to this feature.
- Existing evaluation and contract artifacts from today include Wiki reliability and parity streams; those become de-scoped if feature is removed.

### Finding 4: Wiki data exists on disk and must be handled intentionally
- Runtime wiki content currently resides in `referenceDocs/06_Wiki/` (including `assets/`).
- Direct deletion without archival step risks data loss.

### Finding 5: Removal needs a migration guard for saved client view state
- Current UI persists `mcd_current_view` in browser storage.
- If users have `mcd_current_view=wiki`, removing that view without fallback can leave them in an invalid route state until manual storage reset.

## Gap Analysis
Current architecture does not use a feature flag for Wiki/Notes; it is hard-wired into UI and server routing. A partial removal (e.g., hiding tab only) would leave dead endpoints, stale event bindings, and potential invalid-view state. A complete slice removal is required for deterministic behavior.

## Scope Definition
### In Scope
1. Remove Notes/Wiki UI surface from runtime app (`index.html`, `app.js`, `styles.css`).
2. Remove Wiki API and asset-serving surface from both runtimes (`server.js`, `server.py`).
3. Add view-state migration fallback (`wiki` -> `board`) to prevent invalid saved view behavior.
4. Archive/de-scope active Wiki cards in `state.json` so board reflects current direction.
5. Archive Wiki content directory before removal (or explicitly preserve it as archived read-only content).

### Out of Scope
1. Building a replacement knowledge base feature.
2. Migrating Wiki content into a new editor or external system.
3. Refactoring non-Wiki modules beyond touch points required for safe removal.
4. Starter-kit/template parity sync outside `ops/launch-command-deck` for this immediate unblock (can be a follow-on contract if desired).

## Risks and Unknowns
- Data-loss risk if `referenceDocs/06_Wiki/` is removed without an archival move/copy.
- Residual references in docs/cards can create confusion if not explicitly marked archived/de-scoped.
- Existing dirty working tree may obscure whether post-removal tree is "clean" unless clean-tree criteria are explicitly defined for this slice.

## Primitive Review
No new Architecture Primitive is required. This is a controlled feature deprecation/removal and scope reset.

## Recommended Next Contract Direction
1. Execute a **Wiki/Notes De-Scope Contract** that removes the runtime feature end-to-end (UI + server surface + migration guard).
2. Include an explicit **data archival step** for `referenceDocs/06_Wiki/` before any deletion.
3. Include explicit **clean-tree validation gates** for this slice (grep checks for Wiki routes/selectors, startup smoke checks, and deterministic `git status` expectations).

## Candidate Approved File Paths (for CONTRACT)
- `ops/launch-command-deck/public/index.html`
- `ops/launch-command-deck/public/app.js`
- `ops/launch-command-deck/public/styles.css`
- `ops/launch-command-deck/server.js`
- `ops/launch-command-deck/server.py`
- `ops/launch-command-deck/data/state.json`
- `referenceDocs/06_Wiki/` (archive/remove operation)
