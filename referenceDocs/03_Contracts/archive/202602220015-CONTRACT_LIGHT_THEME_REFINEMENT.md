# Contract: CT-037 Light Theme Accessibility & UX Refinement (v1.17.0)

**Objective**: 
Refine the Command Deck's Light Theme to meet WCAG AA accessibility standards and achieve a "premium" architectural aesthetic.

**Context**: 
v1.16.0 introduced theming, but several components fail contrast checks due to hardcoded legacy styles. This contract covers the formal refactor to a variable-first theme engine.

**Proposed Changes**:
1. **CSS Variable Expansion**:
   - Introduce new variables: `--btn-primary-bg`, `--btn-primary-text`, `--badge-blue-bg`, `--badge-blue-text`, etc.
   - Update `:root` (Dark) and `html[data-theme="light"]` (Light) to provide appropriate values for these.

2. **Component Refinement (`styles.css`)**:
   - **Buttons**: Replace hardcoded gradients in `.btn.primary` and `.btn.danger` with the new variables. Use high-contrast pairings (White-on-Dark or Dark-on-Light).
   - **Active Hihlights**: Ensure `.nav-tab.active` uses a high-contrast pairing (e.g., Slate background with White text).
   - **Badges**: Refactor `.milestone-badge` and `.priority-*` to use themeed variables. In light mode, use subtle background tints with dark text.

3. **UX Polish (`app.js` & `index.html`)**:
   - Update `btnThemeToggle` text/icon logic to be more descriptive.
   - Ensure "Delete Board" and "Save Board" are visually distinct and accessible.

**Acceptance Criteria**:
- **Contrast**: All text/background pairings in Light Mode must have a contrast ratio of at least 4.5:1 (WCAG AA).
- **Legibility**: Interactive elements must be clearly visible and distinguishable.
- **Aesthetic**: The light mode must feel as premium as the dark mode, using a slate/blue/indigo professional palette instead of raw neon accents.
- **Continuity**: Dark mode must remains unchanged (or slightly improved in variable handling).
