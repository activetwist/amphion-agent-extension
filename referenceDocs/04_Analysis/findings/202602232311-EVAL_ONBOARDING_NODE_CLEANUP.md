# EVALUATE: Onboarding Webview Node Cleanup

**Phase: 1 (Research & Scoping)**
**Date:** 2026-02-23
**Focus:** Removing the left-over "Command Deck Language" dropdown in the Onboarding UI.

## 1. Research & Analysis
- **The Issue:** While the backend server logic (`scaffolder.ts`, `commandDeckDashboard.ts`, `server.py`) and the `wizard.ts` input-box prompt were successfully migrated to explicitly use Python and SQLite, the HTML template inside `onboardingWebview.ts` still renders a drop-down menu for "Command Deck Language" with Node.js and Python as options.
- **The Impact:** It does not functionally break anything because the TypeScript backend enforces Python regardless of the webview's output. However, it is confusing UX for the user to be presented with a choice that has been deprecated.

## 2. Gap Analysis
- `mcd-starter-kit-dev/extension/src/onboardingWebview.ts` contains raw HTML injecting the `<select id="initLang">` UI, and javascript listening to its value (`document.getElementById('initLang').value`).

## 3. Scoping Boundaries
**In-Scope:**
- Removing the `<div class="form-group">` containing the `Command Deck Language` label and `select` dropdown from the `_getHtmlForWebview()` template.
- Removing the extraction of `serverLang` in the frontend `btn-submit-init` click listener.
- Removing `serverLang` from the validation check (`if (key !== 'port' && key !== 'serverLang' && !data[key])`). Let's just hardcode the `serverLang` payload to `'python'` in the POST message or let `scaffolder.ts` ignore it.
- Bumping the extension version to `1.26.1` to deploy this UI hotfix.

**Out-of-Scope:**
- Any modifications outside of `onboardingWebview.ts` and `package.json`.

## 4. Primitive Review
- N/A. No new architecture primitives needed.
