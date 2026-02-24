# MCD CONTRACT: Notes Bug Fixes V3

## 1. Objective
Resolve the 5 persistent bugs identified in V2: Default Mode Override, New Note Sync Failure, Delete 404 Crash, Image Placement Focus Loss, and Hyperlinking Focus Loss.

## 2. Affected File Paths (AFPs)
*   **`public/app.js`**: Reordering state initialization, updating `deleteWikiFile()`, `createNewWikiFile()`, `triggerWikiImageUpload()`, and `promptWikiLink()`.
*   **`public/index.html`**: Restoring deleted `data-theme` and `data-current-view` attributes to the `<html>` root tag.

## 3. Execution Plan
1.  **HTML Root Fix**: Re-add `data-theme="dark"` and `data-current-view="board"` to `<html lang="en" data-wiki-mode="visual">`.
2.  **State Initialization Fix**: 
    *   In `loadState()`, manually ensure `state.wikiMode = "visual"` when parsing the JSON response so the backend doesn't overwrite it to "code". 
    *   Call `document.documentElement.setAttribute("data-wiki-mode", state.wikiMode);` to enforce the visual sync.
3.  **New Note Sync**: Add `syncCodeToVisual()` to the end of `createNewWikiFile()` so the blank template appears immediately in the Visual editor.
4.  **Delete Crash Fix**: In `deleteWikiFile()`, wrap the `await api(...)` call in a try/catch block that intercepts `e.message.includes('404')` and silently proceeds with removing the note from the UI state, as an unsaved note inherently won't exist on the server.
5.  **Focus Restoration (Links & Images)**:
    *   In `triggerWikiImageUpload()` and `promptWikiLink()`, right before `sel.addRange(window.savedWikiSelectionRange);`, explicitly call `el.wikiVisualEditor.focus()`.

## 4. Risk Assessment
*   **Complexity**: Medium (dealing with browser Selection DOM and API State hydration).
*   **Impact**: High. These changes are required to deliver a functional WYSIWYG notes experience that does not randomly crash or fail to execute commands.

---
*Contract drafted. Awaiting user approval to EXECUTE.*
