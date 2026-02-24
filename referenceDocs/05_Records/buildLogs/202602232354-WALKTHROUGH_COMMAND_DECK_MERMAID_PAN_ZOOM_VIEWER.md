# WALKTHROUGH · Command Deck Mermaid Viewer Pan + Zoom

## Operator Validation Steps
1. Launch Command Deck runtime (`./ops/launch-command-deck/run.sh`).
2. Open `Charts` view and select a chart with Mermaid content.
3. Verify drag-pan:
   - Press and hold left mouse on the diagram.
   - Drag in all directions; diagram should move in viewport.
4. Verify zoom:
   - Use mouse wheel while pointer is over the diagram.
   - Confirm zoom in/out behavior is smooth and bounded.
5. Verify controls:
   - Click `+` to zoom in.
   - Click `-` to zoom out.
   - Click `Reset` to restore default position/scale.
6. Open `MCD Guide` and validate the same interactions on Mermaid diagrams.
7. Open any Docs modal containing Mermaid and validate the same interactions.
8. Toggle theme (`Light Mode`/`Dark Mode`) and confirm interactions still work after rerender.
9. Confirm there are no blocking JS errors in DevTools console.

## Expected Result
Mermaid diagrams are pannable and zoomable across Charts/Guide/Docs viewer surfaces with stable rerender behavior and synchronized runtime/mirror implementation.
