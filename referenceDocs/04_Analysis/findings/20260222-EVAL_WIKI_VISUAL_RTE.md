# Evaluation Findings: Visual Wiki Editor (RTE)

**Objective**: provide a WYSIWYG editing experience where the preview pane itself is editable, while maintaining Markdown as the underlying storage format.

## Research & Gap Analysis

### Current State
- The Wiki uses a split-pane layout: a `textarea` for code (Markdown) and a `div` for live preview (rendered HTML via `marked.js`).
- Syncing is one-way: `Code -> Preview`.

### Gaps
- **Two-way Sync**: Need to convert HTML back to Markdown (`Preview -> Code`).
- **Editable UI**: The preview pane needs `contenteditable="true"`.
- **Toolbar**: No UI for formatting (Bold, Italic, Link, etc.).
- **Keyboard Shortcuts**: No interception of `CMD+B`, `CMD+K`, etc.

## Proposed Strategy: The "Local Bridge" Pattern

We will implement a two-way synchronization bridge using local vendor scripts to ensure zero external calls.

### 1. Vendoring (Zero Remote Dependency)
- **Vendored Scripts**: We will download and serve `marked.min.js`, `mermaid.min.js`, and `turndown.js` directly from the `public/vendor/` directory.
- **Offline Capable**: This ensures the Wiki works perfectly in air-gapped or offline environments.

### 2. Component Architecture
- **Code Mode**: Transparent/Hidden `textarea`.
- **Visual Mode**: `contenteditable` container that mirrors the `textarea` content via `marked.js`.
- **Toolbar**: Fixed toolbar that injects HTML formatting into the `contenteditable` area.

### 3. Implementation Primitives
- **Sync Visual -> Code**: Triggered on `input` event in `contenteditable`. Uses `TurndownService` (locally served) to update the hidden `textarea`.
- **Formatting**: Uses `document.execCommand` for basic styles (Bold, Italic, Lists) to ensure clean HTML that `turndown` can parse.
- **Linking (`CMD+K`)**: Intercept shortcut, show a simple prompt/modal, and insert a standard HTML link.

## Scoping

### In-Scope
- Vendoring all runtime JS dependencies locally.
- Toggle between "Visual" and "Code" modes.
- Basic formatting toolbar: Bold, Italic, H1, H2, Lists, Link.
- Keyboard shortcuts: `CMD+B`, `CMD+I`, `CMD+K`, `CMD+S` (Save).
- Two-way sync with Markdown persistence.

### Out-of-Scope
- Complex tables (limit to basic Markdown tables).
- Image uploads (remain manual path entry for now).
- Collaborative editing.

Would you like to populate the Command Board or build a contract based on these findings?
