# CONTRACT · Beautiful Onboarding Webview UI (v1.8.0)

**Phase:** 2 (Planning & Agreement)
**Status:** PROPOSED
**Codename:** `BlackClaw`

## Objective
Replace the sequential, rigid `showInputBox` onboarding wizard with a beautifully designed, custom VS Code Webview (`OnboardingPanel`). The aesthetic will align perfectly with the Command Deck (sleek, dark mode, professional). The workflow will seamlessly bridge the user from project instantiation into the hands of a "Product Owner" agent, governed by Lean Manufacturing principles (pulling work just-in-time).

## Proposed Changes

### [Webview Architecture]
- **CREATE**: `src/onboardingWebview.ts`. This module will define the `OnboardingPanel` class, manage the Webview lifecycle, and instantiate the HTML/CSS/JS frontend.
- **DESIGN**: Implement a clean UI for the two onboarding paths ("Start from scratch" form fields, and "Import Source Documents" file drop). The UI will use vanilla HTML/CSS to avoid external bundling complexity.
- **MESSAGE ROUTING**: Implement a two-way `postMessage` architecture to allow the HTML frontend to trigger VS Code native functions (like `showOpenDialog` for files) and command the extension to generate the Markdown artifacts.

### [Wizard Integration]
- **MODIFY**: `src/charterWizard.ts` (and potentially `src/extension.ts`) to trigger the `OnboardingPanel` instead of the legacy `showQuickPick` and `showInputBox` loops.
- **PRESERVE**: The auto-clipboard `writeText` loop logic for the BYO Docs flow will be maintained as the final step of the Webview interaction, handing off smoothly to the chat agent.

### [Metadata]
- **BUMP**: `package.json` to version `1.8.0`.

## Acceptance Criteria
- [ ] Running `MCD: Initialize New Project` (and opting into documents) opens a custom Webview tab.
- [ ] The Webview perfectly mimics the Command Deck design language (dark mode, clean typography).
- [ ] The user can choose the "Manual" path, fill out the 6-field HTML form, click submit, and the `PROJECT_CHARTER.md` and `HIGH_LEVEL_PRD.md` are correctly generated.
- [ ] The user can choose the "Import Docs" path, which triggers a native file picker, generates the stubs, and initiates the auto-clipboard copy loop.
- [ ] Extension builds successfully with no errors.
