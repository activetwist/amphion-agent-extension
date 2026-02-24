# EVALUATE: Command Deck Dashboard Refinement (V2)

**Phase: 1 (Research & Scoping)**
**Date:** 2026-02-23
**Focus:** Narrow Rail alignment, Document Rendering Consistency, Mermaid Verification

## 1. Research & Analysis
- **Current State of Details Links:** The `mcd.openDashboard` Webview resolves dynamic files using `vscode.workspace.findFiles` but currently sends the resulting URI to `vscode.open` (a raw text editor). The user desires these, and any future dynamically added files, to use `markdown.showPreview` like the static files do.
- **IDE Workflow Artifacts Link:** Included by default in previous versions, but deemed unnecessary clutter since the Command Flow covers the execution lifecycle.
- **Webview Rail Alignment:** The `.container` CSS dictates a `max-width: 600px;` and is center-aligned via `body { justify-content: center; }`. The user requested a left-aligned, even narrower rail so the Editor tab can be shrunk out of the way gracefully.
- **Mermaid Enhancements:** Another agent recently updated the Mermaid viewer in the active project's Command Deck.

## 2. Gap Analysis
- **Document Rendering:** `commandDeckDashboard.ts` lacks a mechanism to dynamically generate previews. `markdown.showPreview` requires the exact `vscode.Uri`.
- **UI Positioning:** Centering the container makes window-shrinking cumbersome as the user loses the left-margin text.
- **Asset Syncing:** We must ensure the Mermaid enhancements from `ops/launch-command-deck` are effectively packaged into the `mcd-starter-kit-dev` extension. (Note: A recent `rsync` likely caught these, but we must confirm before finalizing the build).

## 3. Scoping Boundaries
**In-Scope:**
- Modify `src/commandDeckDashboard.ts` CSS to align items `flex-start` (left) and tighten `max-width` (e.g. `340px` - `400px`).
- Remove the "IDE Workflow Artifacts" line item from the HTML.
- Change the `openDynamicDoc` command handling to route URIs to `vscode.commands.executeCommand('markdown.showPreview', uri)` instead of `vscode.open`.
- Ensure `ops/launch-command-deck` public assets (specifically Mermaid logic) are synced into the starter kit extension assets.
- Generate and package a `1.25.5` VSIX build.

**Out-of-Scope:**
- Altering any logic inside the Node/Python server runtimes.
- Adding additional dynamic documents beyond Charter and PRD.

## 4. Primitive Review
No new Architecture Primitives are introduced. We are strictly modifying CSS alignment and switching from `vscode.open` to `markdown.showPreview` in the VS Code Extension API.
