# Contract: CT-038 Light Theme Visual Polish (v1.18.0)

**Objective**: 
Remove legacy gradients from the application frame and fix contrast regressions in formatting-heavy views (Guide/Dialogs) to ensure a truly professional Light Mode.

**Context**: 
v1.17.0 fixed component-level contrast, but global frame gradients and inline styles in `index.html` still degrade the Light Mode experience.

**Proposed Changes**:
1. **Style Standardization (`styles.css`)**:
   - Introduce `--app-bg` variable.
   - Refactor `html, body` to use `background: var(--app-bg)`.
   - Update Light Theme to use a clean solid background for `--app-bg`.
   - Refactor `.progress-track` and `.card .owner` to use variables instead of hex codes.

2. **Markup Clean-up (`index.html`)**:
   - Remove hardcoded `color: #d0e8fc` from `#guideContent` and `#docDialogContent`.
   - Set these to `color: var(--text)` to inherit the theme-aware text color.

**Acceptance Criteria**:
- **Frame**: Light mode background must be flat and clean (no dark-blue radial gradients).
- **Guide/Dialogs**: Text in the MCD Guide and Document Dialog must be dark `#0f172a` in light mode.
- **Variables**: No hardcoded hex colors should remain in `styles.css` for background or primary text.
