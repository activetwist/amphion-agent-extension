# CONTRACT · Wiki Exceptionalism

**Goal**: Fix critical bugs in the Wiki section and implement premium UI/UX refinements for an immersive editing experience.

## Acceptance Criteria
- [ ] **Functional Fixes**:
    - Saving (POST) works reliably regardless of trailing slashes.
    - Deletion (DELETE) works correctly (fixed server body parsing).
- [ ] **Visual Polishing**:
    - High-contrast buttons for "Save", "Delete", and "Download" in Dark Mode.
    - Mode toggle switched from simple button to a clear "Visual vs Code" toggle component.
- [ ] **Immersive View**:
    - `Code View`: Displays only the editor (100% width).
    - `Visual View`: Displays only the live editor (100% width).
- [ ] **Toolbar Expansion**:
    - Numbered Lists added to the toolbar and functional in both modes.

## Implementation Steps

### 1. Server Fixes (MCD EXECUTE - BUG)
- Convert `handleDelete` to `async` and add `readBody(req)` in `server.js`.
- Robustify `handlePost` route matching.

### 2. UI & Style (MCD EXECUTE - UI)
- Fix `.btn-primary`, `.btn-secondary`, and `.btn-danger` contrast in `styles.css`.
- Implement toggle switch UI component.

### 3. Feature Logic (MCD EXECUTE - FEATURE)
- Implement exclusive mode rendering logic in `app.js` and `styles.css`.
- Add "Numbered List" command logic.

## Affected Files
- `ops/launch-command-deck/server.js` [MODIFY]
- `ops/launch-command-deck/public/index.html` [MODIFY]
- `ops/launch-command-deck/public/styles.css` [MODIFY]
- `ops/launch-command-deck/public/app.js` [MODIFY]

---
*Signed: Antigravity (Agent)*
*Approving Authority: USER*
