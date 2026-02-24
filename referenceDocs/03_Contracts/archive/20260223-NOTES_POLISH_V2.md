# MCD CONTRACT: Notes Bug Fixes & Adjustments V2

## 1. Objective
Fix the Javascript crash that disabled hyperlinks/deletions, fix the CSS layout bug causing the Code View to collapse, and swap the Mode Toggles so "Visual" (Preview) is the default and positioned first.

## 2. Affected File Paths (AFPs)
*   **`public/app.js`**: Reverting the accidental rename of `el.wikiVisualEditor` in `syncVisualToCode` and `syncCodeToVisual`. Changing default `wikiMode` to `"visual"`.
*   **`public/styles.css`**: Adding `flex` layout to `.wiki-split-pane`.
*   **`public/index.html`**: Swapping the order of the `<div class="mode-switch">` buttons and updating the default `data-wiki-mode`.

## 3. Execution Plan
1.  **Javascript Fixes (`app.js`)**:
    *   Change `const html = el.notesVisualEditor.innerHTML;` back to `el.wikiVisualEditor.innerHTML;`.
    *   Change `el.notesTextArea.value = markdown;` back to `el.wikiTextArea.value = markdown;`.
    *   Change `updateNotesPreview()` back to `updateWikiPreview()`.
    *   Change initial state: `wikiMode: "visual"`.
2.  **CSS Layout Fix (`styles.css`)**:
    *   Add `.wiki-split-pane { display: flex; flex-direction: column; flex: 1; min-height: 0; }`.
3.  **Toggle Sequence & Default (`index.html`)**:
    *   Change `<html data-wiki-mode="code">` or equivalent wrapper to `"visual"`.
    *   Swap the `<button class="mode-btn" data-mode="visual">` so it appears before the `"code"` button.

## 4. Risk Assessment
*   **Complexity**: Low.
*   **Impact**: High. This directly unblocks core functionality (Hyperlinks/Delete) by resolving the silent JS `TypeError` and improves immediate usability by defaulting to Visual mode.

---
*Contract approved via compound user command. Proceeding to Execution.*
