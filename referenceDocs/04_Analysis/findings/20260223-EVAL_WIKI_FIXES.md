# EVALUATION FINDINGS · Wiki Refinements

**Goal**: Resolve critical bugs in saving/deletion and elevate the Wiki UI/UX.

## Bug Audit

### 1. [BUG] Save Route (POST /api/wiki/files)
- **Symptom**: "Save failed: Route not found" alert.
- **Diagnosis**: The `handlePost` logic in `server.js` returns "Route not found" if the path doesn't match exactly. Possible causes:
    - Trailing slash mismatch.
    - Path resolution errors in the `WIKI_DIR` check.
    - Fallthrough in the `if/else` block.

### 2. [BUG] Delete Route (DELETE /api/wiki/files)
- **Symptom**: "Delete is not working".
- **Diagnosis**: 
    - `handleDelete` is not declared as `async`.
    - `readBody(req)` is never called, so `body` is undefined.
    - The code attempts to access `body.path`, causing a runtime error or silent failure.

## UI/UX Audit

### 3. Dark Mode Contrast
- **Issue**: Buttons like "Save" and "Delete" in the Wiki toolbar have unreadable contrast.
- **Cause**: Using `btn-primary` and `btn-secondary` classes in `index.html` that are either undefined or missing theme-specific color tokens in `styles.css`.

### 4. Immersive Editing
- **Request**: Only show the active editor (Code or Visual).
- **Strategy**: 
    - CSS: Use `.is-visual-mode` / `.is-code-mode` on a parent container to toggle display of `textarea` vs `contenteditable`.
    - JS: Update `state.wikiMode` logic to swap classes.

### 5. Toolbar Features
- **Requirement**: Numbered Lists.
- **Difficulty**: LOW. Just needs `insertOrderedList` command and a new icon/button.

## Proposed Strategy
- Fix server-side async/body-parsing for DELETE.
- Refactor button classes to use established `.btn` patterns in `styles.css`.
- Implement a modern toggle switch (iOS/Material style) for mode switching.
- Decouple the split-pane view into exclusive immersive views.
