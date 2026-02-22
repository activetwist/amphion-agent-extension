# Evaluation: Blank Canvas Workflow (v1.12.0)

**Date:** 2026-02-21
**Phase:** 1 (Evaluate)
**Topic:** Fixing the "Start from Scratch" (manual) workflow to bypass the AI Agent Handoff screen and proceed directly to completion.

## 1. Research & Current State
**Current Implementation (v1.11.2):**
1. **Accidental Inheritance:** When the user selects "Start from Scratch" and fills out the 6 manual questions, `runManualPath` (in `charterWizard.ts`) successfully generates the *completed* Project Charter and High-Level PRD. However, it currently returns a set of dummy `charterPrompt` and `prdPrompt` values. 
2. **Workflow Confusion:** Back in `onboardingWebview.ts`, the completion of `generateManual` posts the `handoffReady` command back to the Webview. This activates the `agent-handoff-view` that we just spent time polishing. This is confusing for manual users, because their documents are already finished—they don't need an AI agent to derive anything, so they shouldn't see copy buttons for Agent Prompts.
3. **Missing Final Step:** Because they land on the Agent Handoff view, they see the instructions for Step 1 and Step 2, and the "Launch Command Deck" button is hidden until they click through the flow (or manually intervene).

## 2. Gap Analysis & Proposed Direction

### Gap 1: Manual Workflow Hits the Agent Handoff Screen
* **Problem:** `runManualPath` triggers the same UI state as `runSourceDocsPath`.
* **Proposed Fix:** Decouple them. 
  1. Change `runManualPath` in `charterWizard.ts` to return `void` (remove the `return { charterPrompt, prdPrompt }`).
  2. In `onboardingWebview.ts`, when `generateManual` finishes, instead of posting `handoffReady`, post a new command: `manualComplete`.

### Gap 2: Missing Clear Call-to-Action for Manual Users
* **Problem:** Manual users need a clean success screen with a button to launch their Command Deck.
* **Proposed Fix:** 
  1. Create a `manual-success-view` `<div>` in the Webview HTML. It will contain a simple congratulatory message ("Your Strategy documents are generated and committed!") and a button: `<button id="btn-launch-cd-manual">Launch Command Deck</button>`.
  2. Add a message listener in the Webview JavaScript: when `command === 'manualComplete'`, hide all views and add `.active` to `manual-success-view`.
  3. Bind the new button to post the existing `launchCommandDeck` command, which already securely tears down the Webview and boots the Node server.

## 3. Scoping & Boundaries

**In-Scope:**
- Minor version bump to v1.12.0.
- Removing the return payload from `runManualPath`.
- Adding a standalone success view to `onboardingWebview.ts` strictly for the manual path.

**Out-of-Scope:**
- Any modifications to the `importDocs` / `runSourceDocsPath` / `handoffReady` workflow. The importer flow will remain completely untouched.

## 4. Primitive Review
Standard VS Code Webview messaging and HTML/TS. No new primitives needed.
