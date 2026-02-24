# EVALUATION FINDING: Wiki Capability ("Confluence Lite")

**Target Date:** 2026-02-22
**Status:** DRAFT
**Codename:** `BlackClaw`

## Executive Summary
The proposed "Wiki" capability is highly compatible with the existing AmphionAgent architecture. The "local-first, markdown-based" requirement aligns perfectly with the Micro-Contract Development (MCD) philosophy and the current zero-dependency technical stack.

## Research Analysis
- **Architecture**: The Command Deck (Vanilla JS + Python/Node stdlib) can easily be extended to handle a `wiki/` directory. Current `api/docs` logic already handles reading markdown; we need to add write capabilities and folder traversal.
- **Editor**: To maintain the "no package manager" constraint, we can implement a custom split-pane editor (TextArea + Live Preview) or use a bundled version of a lightweight editor like `EasyMDE` (stored in `public/js/`).
- **Linking**: A simple `[[Page Name]]` parser can be implemented on the frontend during markdown rendering.

## Gap Analysis
1.  **Backend**: Missing API for recursive file listing, file creation, folder creation, and file deletion within a dedicated Wiki directory.
2.  **Frontend**: The Command Deck `index.html` needs a fourth tab ("Wiki") and a corresponding view container.
3.  **Primitive**: No formal definition exists for how the "Wiki" relates to the "Records" and "Analysis" directories.

## Scoping
### In-Scope
-   **Local Storage**: Dedicated directory `referenceDocs/06_Wiki/`.
-   **File Management**: Create, rename, delete files and nested folders.
-   **Editor**: Markdown-focused editor with live preview (split pane).
-   **Linking**: Wiki-style linking (`[[Document]]`) resolution.
-   **Download**: One-click download of the raw `.md` file.

### Out-of-Scope (Hard Boundaries)
-   **Transformations**: No PDF/HTML export (as requested).
-   **Multi-user**: Single operator only.
-   **Image Uploads**: Manual file movement only; no GUI uploader in MVP.

## Primitive Review
- **NEW**: `ReferenceDocs/06_Wiki` directory added to the standard project structure.

## Technical Feasibility
- **Feasibility**: High (9/10).
- **Risk**: Low. The primary challenge is ensuring the file system operations remain robust and cross-platform (macOS focus for now).

---
**HALT AND PRESENT**

Would you like to populate the Command Board or build a contract based on these findings?
