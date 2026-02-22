# Evaluation: VS Code Webview UI Enhancement

**Date:** 2026-02-21
**Phase:** 1 (Evaluate)
**Topic:** Transitioning from native VS Code inputs to a rich Webview UI for the MCD Extension.

## 1. Research & Current State
**Current Implementation:**
The extension (`mcd-starter-kit-dev`) relies entirely on VS Code native inputs (`vscode.window.showInputBox`, `showQuickPick`, and `showInformationMessage`). While functional and deterministic, this UI paradigm is rigid, constrained to the Command Palette/Notification areas, and sequential.

**Proposed Implementation:**
A custom VS Code `WebviewPanel`. A Webview allows an extension to create fully customizable views within the editor using standard web technologies (HTML, CSS, JS).

## 2. Capabilities & "Sexy" Interactions
Moving to a Webview unlocks significant UX potential while remaining fully deterministic:

1. **Rich Form Factor**: Instead of 6 sequential input boxes for the Charter/PRD, we can present a clean, beautifully styled single-page HTML form.
2. **Dynamic Validation**: We can provide real-time input validation (e.g., character counts, required fields) without dismissing an input box.
3. **Interactive Visuals**: We can render Markdown previews of the generated artifacts directly in the Webview *before* they are written to disk.
4. **Modern Design System**: We can use modern CSS frameworks (or custom styling) to match the "Command Deck" aesthetic (e.g., glassmorphism, dark mode palettes) rather than standard VS Code grey boxes.
5. **Drag-and-Drop**: We could implement drag-and-drop zones for the "BYO Docs" source files instead of relying on the native OS file picker.

## 3. Constraints & Gotchas (Guardrail Check)

While Webviews are powerful, they introduce architectural complexity:
- **Message Passing**: Webviews run in isolated contexts. All communication between the UI (HTML/JS) and the Extension Host (TypeScript) must happen via asynchronous `postMessage` passing.
- **Security**: Webviews should ideally implement strict Content Security Policies (CSPs) and avoid loading external scripts (which aligns perfectly with the `GUARDRAILS.md` "Local Only" rule).
- **Bundle Size**: We must decide whether to use a frontend framework (React/Vue/Svelte) and bundle it via Webpack/Vite, or stick to Vanilla JS/CSS for simplicity. *Recommendation: Vanilla HTML/JS inside the extension to avoid massive build step complexity for a single form.*

## 4. Scoping & Boundaries

**In-Scope:**
- Migrating the current "Charter / PRD Wizard" flow into a WebviewPanel.
- Designing a beautiful, branded HTML/CSS interface.
- Implementing two-way message passing between the Webview and `charterWizard.ts`.

**Out-of-Scope:**
- Migrating the primary "Command Deck" (the external Python server/Dashboard) into VS Code. *The Webview should only replace the extension's interactive prompts.*

## 5. Architectural Alignment & Operator Vision
Following a discussion with the operator, the following decisions were finalized:

1. **Aesthetic Direction**: The UI will strictly adopt the "Command Deck" style—dark mode, minimal, clean, and highly professional.
2. **Architecture**: As recommended, the Webview will utilize pure HTML/CSS/Vanilla JS injected directly from the extension to adhere to the "Local Only" zero-cloud dependency constraint without introducing heavy bundling overhead.
3. **Scope & Future Vision**: The Webview will entirely replace the sequential onboarding dialogs (`showInputBox`). 
   - **The "Lean" Philosophy**: The ultimate goal is to transition the user smoothly from project instantiation into the hands of the AI agent, who will act as an Agile "Product Owner." The agent will maintain project inertia by "pulling" work (Lean Manufacturing) and prompting the user "just in time" for the next MCD step (e.g., "What would you like to evaluate next?").
   - **Seamless Handoff**: The onboarding UI's primary purpose is to be a frictionless, beautiful bridge that sets up the Charter and PRD, getting these artifacts out of the way so the user lands gracefully with the Product Owner agent via chat.
