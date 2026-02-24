# MCD CONTRACT: Notes UI Polish & Bug Fixes

## 1. Objective
Refine the Wiki feature by renaming it to "Notes", polishing UI elements (Table Controls, Save state), and fixing critical user-reported bugs (Deletion, Hyperlinking, Image Insertion).

## 2. Affected File Paths (AFPs)
*   **`public/app.js`**: Core logic updates for Selection Saving (images), Custom Parsing (hyperlinks), UI state (save button), and string replacements ("Wiki" -> "Notes").
*   **`server.js`**: Route handler update for `handleDelete` to survive empty `fetch` bodies.
*   **`public/styles.css`**: Inverted theme styling for `.wiki-table-tools`.
*   **`public/index.html`**: String replacements for UI labels ("Wiki" -> "Notes").

## 3. Execution Plan
1.  **Rename "Wiki" to "Notes"**:
    *   Update `index.html` tab text, button titles, and empty state text.
    *   Update `app.js` prompt texts and alert texts. (Note: DOM IDs `wiki*` and API routes `/api/wiki/*` will remain unchanged to prevent cascading breakages).
2.  **Table Controls Styling**:
    *   Modify `.wiki-table-tools` in `styles.css` to use the opposite theme variables (`var(--bg-1)` instead of `var(--toolbar-bg)`, with an explicit border to stand out).
3.  **Delete API Fix & UI**:
    *   In `server.js`, modify `handleDelete` body parser: `try { body = await readBody(req) || {}; }...`
    *   In `app.js`, update `deleteWikiFile` to include a success alert.
4.  **Save Confirmation**:
    *   In `app.js`, modify `saveWikiFile()` to temporarily change the button innerText to "Saved!" and add a CSS class for 2 seconds.
5.  **Image Insertion Fix**:
    *   In `app.js`, modify `triggerWikiImageUpload` to store the current `window.getSelection().getRangeAt(0)` into a global or scoped variable.
    *   Modify the `change` listener to restore this Selection Range before calling `document.execCommand('insertHTML')`.
6.  **Hyperlink Fix**:
    *   In `app.js`, modify `syncCodeToVisual` to pre-process the Markdown string. Find instances of `[[Page Name]]` and replace them with standard Markdown links `[Page Name](Page Name)` or HTML `<a>` tags before passing it to `marked`.

## 4. Risk Assessment
*   **Complexity**: Low/Medium. These are targeted point-fixes. 
*   **Selection State**: Browser selection APIs can be finicky depending on focus state, but manually managing Ranges is the standard approach for rich-text editors dealing with asynchronous file uploads.
*   **Regex Parsing**: Pre-processing the `[[Link]]` syntax requires a careful Regex `\[\[(.*?)\]\]` to ensure we don't accidentally capture other string data.

---
*Contract approved via compound user command. Proceeding to Execution.*
