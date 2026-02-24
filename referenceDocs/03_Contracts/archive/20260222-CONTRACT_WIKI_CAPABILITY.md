# CONTRACT: Wiki Capability ("Confluence Lite")

**Codename:** `BlackClaw`
**Contract ID:** `20260222-WIKI_CAPABILITY`
**Status:** DRAFT

## Goal
Implement a local-first markdown wiki in the Command Deck with nested documents, simple `[[linking]]`, a split-pane editor, and direct downloads.

## Acceptance Criteria
- [ ] **Wiki Tab**: New "Wiki" tab exists in the Command Deck navigation.
- [ ] **File Tree**: Sidebar renders a recursive tree of `referenceDocs/06_Wiki/`.
- [ ] **Editor**: Split-pane markdown editor with live preview and save-on-demand functionality.
- [ ] **Linking**: `[[Page Name]]` syntax resolves to internal Wiki links.
- [ ] **Nested Support**: Folders can be created and traversed via the UI.
- [ ] **Download**: "Download Raw" button correctly serves the `.md` file.
- [ ] **Parity**: Both Node.js and Python backends support all Wiki API endpoints.

## Implementation Steps
1.  **AM-048**: Scaffold `referenceDocs/06_Wiki/` and implement backend tree/CRUD API (Node + Python).
2.  **AM-049**: Implement Wiki tab UI, sidebar file tree, and basic file loading.
3.  **AM-050**: Implement split-pane markdown editor with persistence.
4.  **AM-051**: Implement Wiki linking parser and navigation logic.
5.  **AM-052**: Final verification of download functionality and cross-runtime parity.

## Affected Files (AFP)
- `ops/launch-command-deck/server.js` (Modify)
- `ops/launch-command-deck/server.py` (Modify)
- `ops/launch-command-deck/public/index.html` (Modify)
- `ops/launch-command-deck/public/styles.css` (Modify)
- `ops/launch-command-deck/public/app.js` (Modify)
- `referenceDocs/06_Wiki/` (New Directory)
