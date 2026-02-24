# EVALUATION: Persistent Notes Bugs V4

## 1. Research & Bug Discoveries

1. **New Note Creation**: When a user clicks "+ New Note", it creates a temporary state in `app.js` but does not auto-save. Therefore, the file doesn't appear in the Notes Tree, leading users to assume the "Create" action failed. 
2. **Delete Bug (404 Error)**: In `app.js`, `fetch("/api/wiki/files", { method: "DELETE", body: ... })` is used. Browsers like Safari and Chromium often silence or strip bodies from `DELETE` requests. Thus `server.js` receives an empty path, tries to resolve the root `WIKI_DIR`, fails validation, and throws a 404.
3. **Image Upload (Malformed JSON)**: In `server.js`, `handlePost` globally executes `await readBody(req)` which attempts to `JSON.parse` the incoming data before checking routes. When an image is uploaded in binary blob format to `/api/wiki/images`, the JSON parser crashes with `400 Bad Request: Malformed JSON`, failing the upload.
4. **Hyperlinks & Text Cursors**: The native `<button>` elements in the toolbar steal browser focus on `mousedown` *before* the `onclick` handler fires. This means `window.getSelection()` captures the button rather than the text editor cursor, causing `document.execCommand` to silently fail. 

## 2. Gap Analysis & Scoping
*   **Fix 1 (UX)**: Add `saveWikiFile()` as the final step inside `createNewWikiFile()` so the file appears in the tree immediately.
*   **Fix 2 (DELETE Transport)**: Change the `app.js` Delete call to pass the path as a URL query param `api("/api/wiki/files?path=" + state.currentWikiPath, "DELETE")`. Modify `server.js` handleDelete to check `query.get('path')` as a fallback.
*   **Fix 3 (Binary Parsing)**: In `server.js`, move the `if (route === '/api/wiki/images')` block to the very top of `handlePost`, before `await readBody(req)` tries to parse it as JSON.
*   **Fix 4 (Focus Trap)**: In `index.html`, add `onmousedown="event.preventDefault()"` to every `<button class="btn-tool">` within the editor. This intercepts the focus-stealing behavior of the mouse click while allowing the `onclick` function to execute securely within the text editor's native selection range.

## 3. Primitive Review
These are logical corrections; no new Architecture Primitives are needed.

---
**Recommendation**: The execution path is precisely outlined for all 4 outstanding functional barriers. Please invoke CONTRACT to proceed.
