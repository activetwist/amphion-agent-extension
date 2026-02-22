# Contract: CT-036 Theme Toggle & Artifact Clean-Up (v1.16.0)

**Objective**: 
Scrub all remaining user-specific project name artifacts (e.g., "Cymata") from the scaffolding repository and implement a native Light/Dark Mode toggle in the Command Deck UI.

**Context**: 
The starter kit should function as a clean slate for any operator. The presence of hardcoded placeholder names like "Cymata" detracts from the professional feel. Additionally, while the dark mode Command Deck looks sleek, providing an explicit theme toggle ensures accessibility and caters to operator preferences.

**Proposed Changes**:
1. **Artifact Clean-Up (Sweeping `Cymata`)**:
   - **`extension/src/wizard.ts`**: Replace `'e.g. Cymata'` placeholder with `'e.g. Acme Platform'`.
   - **`docs/MCD_SCAFFOLD_v2.md`** & **`extension/README.md`**: Replace example project name references.

2. **Command Deck Theming (Light/Dark Mode)**:
   - **`command-deck-source/public/styles.css` & `extension/assets/launch-command-deck/public/styles.css`**: Extract hardcoded color hex values into overarching `:root` CSS variables (e.g., `--panel-inner`, `--card-bg`, `--column-bg`). Define an `html[data-theme="light"]` selector block containing a high-contrast inverted palette.
   - **`command-deck-source/public/index.html` & `extension/assets/launch-command-deck/public/index.html`**:
     - Add a declarative `data-theme` load script in the `<head>` alongside the view router to prevent unstyled flashes.
     - Add a `<button id="btnThemeToggle" class="btn">Theme</button>` to the `.global-header` layout.
   - **`command-deck-source/public/app.js` & `extension/assets/launch-command-deck/public/app.js`**:
     - Bind an event listener to `#btnThemeToggle` that toggles `document.documentElement.getAttribute('data-theme')` between `dark` and `light`.
     - Persist the chosen state immediately to `localStorage.setItem('mcd_theme', newTheme)`.

**Acceptance Criteria**:
- A global grep for "Cymata" returns zero results.
- The Command Deck header contains a "Theme" button.
- Clicking the button live-toggles the UI to a clean Light Mode.
- A page refresh gracefully preserves the user's explicit theme choice via `localStorage` without flashing colors.
