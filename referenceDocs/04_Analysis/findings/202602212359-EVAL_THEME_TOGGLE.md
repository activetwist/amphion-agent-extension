# Evaluation: Theme Toggle & Artifact Clean-Up (v1.16.0)

**Date:** 2026-02-21
**Phase:** 1 (Evaluate)
**Topic:** Implementing a Light/Dark mode toggle in the Command Deck and scrubbing user-project specific artifacts (e.g., "Cymata") from the scaffolding repository.

## 1. Research & Current State

### Project Name Artifacts
A sweep of the `mcd-starter-kit-dev` codebase revealed that "Cymata" currently exists as a placeholder or example project name in the following locations:
1. `docs/MCD_SCAFFOLD_v2.md`
2. `extension/README.md`
3. `extension/src/wizard.ts` (the input box placeholder)
4. `extension/out/wizard.js`

### Command Deck Theming
The Command Deck's `styles.css` defines a few root CSS variables (`--bg-0`, `--panel`, `--text`, etc.), but relies heavily on hardcoded hex values (like `#0b1a26cc`, `#132637`, `#39576f`) for panels, cards, columns, and hover states. 
Currently, there is no persistent state mechanism or UI control for switching between themes.

## 2. Gap Analysis
* **Artifact Polish**: Hardcoded project names from previous builds reduce the "starter kit" feel. These should be neutralized to standard placeholder text (e.g., "Project Phoenix" or "Acme Corp App").
* **CSS Architecture**: To support a pristine light mode without rewriting the entire stylesheet or managing two separate css files, the hardcoded hex codes must be extracted into the `:root` pseudo-class. We can then define an `html[data-theme="light"]` selector to selectively override those variables.

## 3. Proposed Direction (v1.16.0)

### Sweeping Artifacts
* Replace "Cymata" globally with "Acme Platform".
* Ensure no other specific user-project data remains in the wizard.

### Implementing Theming
* **CSS Refactor**: Move remaining hardcoded color values in `styles.css` into `:root` variables. Create an `html[data-theme="light"]` block with an inverted, high-contrast color palette that looks premium and clean (not just a pure "#FFFFFF" background, but subtle grays and off-whites).
* **UI Toggle**: Add an elegant theme toggle button (e.g., a Sun/Moon icon or text) to the `.global-header` in `index.html`.
* **State Persistence**: Update `app.js` to read/write `localStorage.getItem("mcd_theme")`. During the `bootstrap()` phase, the app will read this variable (defaulting to "dark") and set the attribute `data-theme="light"` on the document root. The button click event listener will toggle this state. 

This approach is lightweight, native, and perfectly aligns with the Command Deck's zero-dependency philosophy.
