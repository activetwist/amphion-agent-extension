# EVALUATION: Wiki Table Advanced UX

## 1. Research
Currently, the Wiki Visual Editor supports basic HTML table insertion (`insertHTML`) and smooth navigation between `<th>` and `<td>` elements using a custom `Tab` key interceptor in `app.js`. However, it lacks advanced table manipulation features.

## 2. Gap Analysis
*   **Row Addition on Tab**: When a user presses `Tab` while focused on the *last cell* of the *last row* in a table, the cursor simply stays there (or wraps/escapes depending on specific edge cases). It does not automatically create a new row, which is standard behavior in rich text editors (like Notion or Word).
*   **Column/Row Management**: There are no UI controls to add/remove columns, add/remove rows (besides the proposed Tab feature), or adjust column widths.
*   **Underlying Data**: Tables are currently raw HTML in the visual editor, meaning any manipulation must directly alter the DOM structure (`<tr>`, `<td>`, `<th>`).

## 3. Scoping
*   **In-Scope**:
    *   Updating the `Tab` key listener in `app.js` to detect when the user is in the last cell of the table. If so, programmatically append a new `<tr>` with the correct number of `<td>` child elements, and move focus to the first cell of the new row.
    *   Implementing a basic UI mechanism for table controls. This could be a small floating toolbar or context menu that appears when a table is focused, offering buttons for "Add Column Left/Right", "Delete Column", "Add Row Above/Below", and "Delete Row".
*   **Out-of-Scope**:
    *   Complex Excel-like features (e.g., cell merging `colspan`/`rowspan`, complex border styling per-cell, mathematical formulas).
    *   Drag-and-drop column resizing (may be too complex for the current lightweight editor, though basic % width classes might be possible later).

## 4. Primitive Review
No new Architecture Primitives are required. We will continue to leverage the existing `contenteditable` DOM manipulation and `document.execCommand` approaches where possible, combined with direct DOM node insertion for tables.

---
**Next Step Recommendation**: Before proceeding with implementation, we need a contract to execute these specific enhancements to `app.js` and `styles.css`.
