# EVALUATION: Notes App Polish

## 1. Research & Bug Discoveries
I investigated the 6 points raised by the user regarding the Wiki (Notes) feature:

1. **Table Controls Styling**: The floating table manager currently uses the standard toolbar background. It needs a CSS update to invert its colors based on the current theme (e.g., dark background in light mode, light background in dark mode).
2. **Document Delete Broken**: `server.js`'s `handleDelete` function attempts to read `body.path` from the request. However, `fetch` DELETE requests without properly formatted JSON bodies cause the body parser to return `undefined`, resulting in a fatal `TypeError: Cannot read properties of undefined (reading 'path')`. 
3. **Hyperlining Broken**: The visual editor inserts `<a href...>` which Turndown cleanly converts to `[[Link]]` in Markdown. However, when switching back to Visual mode, the `marked.js` parser doesn't understand the custom `[[Link]]` syntax and simply renders it as plain text. 
4. **Save Confirmation**: `saveWikiFile()` in `app.js` successfully saves to the server but has no UI feedback (the `alert` is commented out).
5. **Image Insert Broken**: When the user clicks the Image button, a hidden `<input type="file">` is clicked, opening the system file dialog. This causes the Visual Editor to instantly lose its `Selection Range`. When the upload finishes 1-2 seconds later, `document.execCommand('insertHTML')` silently fails because there is no active text selection.
6. **Rename "Wiki" to "Notes"**: Requires a global find-and-replace of UI labels and Tab names in `index.html` and `app.js`. (Note: We will keep the underlying API routes and variables as `wiki` to avoid breaking the backend storage structure `05_Records/wiki/`, but the user-facing text will say "Notes").

## 2. Gap Analysis & Scoping
* **In-Scope**:
    * Updating CSS `.wiki-table-tools` for inverted styling.
    * Fixing `server.js` to default `body` to `{}` on DELETE requests to prevent crashes.
    * Updating `app.js` to show a temporary "Saved!" toast or button state change upon successful save.
    * Capturing and restoring the browser `Selection` around the Image Upload async flow in `app.js`.
    * Pre-processing `[[Link]]` strings in `syncCodeToVisual()` before passing them to `marked` so they render correctly as clickable HTML.
    * Renaming UI strings from "Wiki" to "Notes".
* **Out-of-Scope**:
    * Full auto-save polling mechanism (a visual save confirmation for manual saves is lower risk and immediately fulfills the requirement).
    * Restructuring the backend `WIKI_DIR` folder nomenclature (UI-only rename is safer).

## 3. Primitive Review
No new Architecture Primitives are required. We will modify existing functions in `app.js`, `server.js`, and `styles.css`.

---
**Next Step Recommendation**: Before proceeding with implementation, we need a standard execution contract to execute these targeted fixes.
