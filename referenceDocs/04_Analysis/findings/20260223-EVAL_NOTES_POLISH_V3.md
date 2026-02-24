# EVALUATION: Persistent Notes Bugs V3

## 1. Research & Bug Discoveries

1. **Default Mode Override**: The `<html>` tag was updated, but the backend `/api/state` sends a persistent snapshot of `store.json` on load. `loadState()` overrides `state.wikiMode` with `"code"` (from the backend's saved memory) but doesn't immediately update the DOM `data-wiki-mode` attribute, leading to a visual desync.
2. **New Note Creation (Visual Mode)**: `createNewWikiFile()` sets the Markdown template in the hidden Code textarea, but fails to call `syncCodeToVisual()`. If the user is in Visual Mode, the screen remains blank or retains the old note, making it appear broken.
3. **Delete Broken (Unsaved Notes)**: When the user creates a "New Note" (which only exists in JS memory until "Save" is clicked) and immediately clicks "Delete", the application sends a `DELETE` request for a file that doesn't exist yet. The server accurately throws a `404 Not Found`, crashing the UI flow instead of just clearing the screen.
4. **Image Placement**: The file input dialog steals browser focus. While the selection coordinates were saved properly, `document.execCommand()` requires the target `contenteditable` to be explicitly `.focus()`ed *before* the range is restored, otherwise it fails to execute the insertion.
5. **Hyperlinking**: The exact same focus-stealing bug exists for hyperlinks because `window.prompt` steals focus from the editor. We must save the cursor state before the prompt, `.focus()` the editor after the prompt closes, and then restore the cursor.

## 2. Gap Analysis & Scoping
*   **Fix 1 (Mode/Layout)**: Move `document.documentElement.setAttribute("data-wiki-mode", state.wikiMode);` to the end of `loadState()`. Re-add the accidentally deleted `data-theme` and `data-current-view` tags in `index.html`. Disable backend state pollution of `wikiMode` so it always defaults to visual.
*   **Fix 2 (New Note Sync)**: Add `syncCodeToVisual()` to the end of `createNewWikiFile()`.
*   **Fix 3 (Delete 404s)**: In `deleteWikiFile()`, if the API throws a "not found" error, explicitly catch it and continue with the UI teardown anyway.
*   **Fix 4 & 5 (Focus Restoration)**: Refactor `triggerWikiImageUpload` and `promptWikiLink` to correctly call `el.wikiVisualEditor.focus()` before calling `sel.addRange(window.savedWikiSelectionRange)`.

## 3. Primitive Review
These are logical corrections; no new Architecture Primitives are needed.

---
**Recommendation**: The issues are precise. Please generate an Execution Contract from these findings.
