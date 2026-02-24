# MCD CONTRACT: Wiki Table Advanced UX

## 1. Objective
Implement advanced table manipulation features in the Wiki Visual Editor, specifically "Tab to create row" and a floating UI for column/row management.

## 2. Affected File Paths (AFPs)
*   **`public/app.js`**: Core logic for intersecting Tab events and inserting the table management floating toolbar.
*   **`public/styles.css`**: Styling for the new floating table management toolbar and its buttons.

## 3. Execution Plan
1.  **Row Addition on Tab**:
    *   Find the `Tab` keydown interceptor in `app.js`.
    *   Add logic to detect if the currently focused cell is the *last* cell (`<td>` or `<th>`) of the *last* row (`<tr>`) in the table.
    *   If true, prevent default behavior, programmatically clone the structure of the last row (emptying the content), append it to the `<tbody>`, and move focus to the first cell of the new row.
2.  **Floating Table Manager**:
    *   Create a hidden `<div>` floating menu in `app.js` or `index.html` (e.g., `#wikiTableToolbar`).
    *   Add event listeners (`selectionchange` or `click`) to the visual editor to detect when the cursor is inside a table.
    *   When inside a table, calculate the position of the table or focused cell and display the floating menu nearby.
    *   Populate the menu with buttons: "Add Col Left", "Add Col Right", "Del Col", "Add Row Above", "Add Row Below", "Del Row".
    *   Implement DOM manipulation logic in `app.js` for each button action relative to the currently focused cell.
    *   Add CSS in `styles.css` to style the floating menu (absolute positioning, z-index, buttons).

## 4. Risk Assessment
*   **Complexity**: Direct DOM manipulation of tables can be tricky due to edge cases (e.g., tables without `<tbody>` or `<thead>`, varying column counts if users manually edited HTML).
*   **Performance**: The floating toolbar needs efficient positioning logic to avoid layout thrashing during scrolling or typing.
*   **Turndown Compatibility**: We must ensure that rows/columns added via these new controls are standard HTML that `turndown-plugin-gfm` can correctly convert back to Markdown when switching to Code mode. (This should be fine as long as we stick to standard `<tr>` and `<td>` tags).

---
*Contract drafted awaiting execution command.*
