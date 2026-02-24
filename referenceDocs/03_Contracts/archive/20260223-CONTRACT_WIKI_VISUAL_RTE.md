# CONTRACT · Visual Wiki Editor (RTE)

**Goal**: Transform the Wiki preview pane into a live, visual editor with formatting tools, while maintaining Markdown as the source of truth.

## Acceptance Criteria
- [ ] Users can toggle between "Visual" and "Code" modes.
- [ ] The Visual mode is an editable preview area (`contenteditable`).
- [ ] Formatting toolbar supports: Bold, Italic, Header 1, Header 2, Unordered List, and Link.
- [ ] Keyboard shortcuts: `CMD+B` (Bold), `CMD+I` (Italic), `CMD+K` (Link), `CMD+S` (Save).
- [ ] Saving from either mode correctly persists Markdown to the filesystem.
- [ ] Zero external calls (uses local vendored `turndown.js`).
- [ ] Runtime parity: Works on both Node.js and Python backend.

## Implementation Steps

### 1. Visual Mode Foundation (AM-053)
- Modify `index.html` to add a Toolbar and a Visual Editor container.
- Update `app.js` to handle mode switching.
- Implement `Sync: Visual -> Code` using `turndown.js`.

### 2. Formatting Toolbar (AM-054)
- Implement toolbar button click handlers in `app.js` using `document.execCommand`.
- Style the toolbar in `styles.css`.

### 3. Keyboard Shortcuts & Links (AM-055)
- Add global `keydown` listener for the Wiki and intercept `B/I/K/S`.
- Implement a simple modal/prompt for the `[[Wiki Link]]` insertion via the link tool.

### 4. Verification & Polish (AM-056)
- Verify `[[linking]]` works when inserted via RTE.
- Ensure Mermaid diagrams remain rendered but protected.
- Final verification on both backend runtimes.

## Affected Files
- `ops/launch-command-deck/public/index.html` [MODIFY]
- `ops/launch-command-deck/public/styles.css` [MODIFY]
- `ops/launch-command-deck/public/app.js` [MODIFY]
