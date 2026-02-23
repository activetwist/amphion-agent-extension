# WALKTHROUGH: Temporary Mermaid Extension Architecture Test

## Goal
Validate end-to-end Mermaid rendering from a Core Reference Library-backed document.

## Steps
1. Open Command Deck in browser.
2. Click `Dashboard` tab.
3. In `Core Reference Library`, click `Guardrails`.
4. In the document modal, verify the section:
   - `Temporary Mermaid Render Test: Extension Architecture`
5. Confirm chart behavior:
   - Diagram renders as SVG flowchart.
   - No raw markdown code fence is shown.

## Expected Result
- Mermaid architecture diagram is visible and readable in modal.

## Optional Cleanup
If the test is complete and temporary content is no longer desired:
- Remove the Mermaid test section from `referenceDocs/00_Governance/GUARDRAILS.md`
- Refresh modal and confirm section is gone.
