# Evaluation: Deferred Command Deck Launch Sequence (v1.9.3)

**Date:** 2026-02-21
**Phase:** 1 (Evaluate)
**Topic:** Deferring the Command Deck server start and browser open until *after* the Strategy Docs sequence, with a modal transition.

## 1. Research & Current State
**Current Implementation (v1.9.2):**
1. When the user clicks "Initialize Project", the `scaffolder.ts` script runs.
2. At the very end of `scaffolder.ts`, the Command Deck server terminal is instantiated, the server started, and a 2.5-second `setTimeout` fires `vscode.env.openExternal(url)` to open the browser.
3. Concurrently, the Webview transitions to the Strategy Selection view ("Import Source Docs" vs "Start from Scratch").
4. This results in the Command Deck opening in the browser *while* the user is still making their Strategy choices or running the agent derivation.

## 2. Gap Analysis & Proposed Direction

### Gap 1: Browser Steals Focus Prematurely
The Kanban board is essentially the "Product Owner" work surface. Opening it before the project's defining guardrails (Strategy) are established breaks the Lean MCD flow. Furthermore, it steals desktop window focus right as the user is managing their agent handoff in VS Code.

* **Proposed Fix:** Move the server initialization and browser launch *out* of `buildScaffold()` and trigger it at the *end* of the Strategy flows (`runManualPath`, `runSourceDocsPath`, and the Webview `cancel` skip).
* **Proposed UX:** Before launching the browser, show a `vscode.window.showInformationMessage` modal that sets expectations: "MCD has initialized your project! The Command Deck kanban board will now launch in your browser. Complete your Strategy Docs with your AI Agent, and return to VS Code when you are ready to manage your work."

## 3. Scoping & Boundaries

**In-Scope:**
- Point release v1.9.3 to implement this sequence change.
- Refactoring `scaffolder.ts` to expose a `launchCommandDeck` function.
- Updating `charterWizard.ts` to call `launchCommandDeck` with the new modal after docs are opened.
- Updating `onboardingWebview.ts` to call `launchCommandDeck` if the user clicks "Skip for now".

**Out-of-Scope:**
- Changing the server startup commands or the Command Deck Python/Node code itself.

## 4. Primitive Review
No new primitives required. We are simply decoupling the launch logic and moving it down the causal chain.
