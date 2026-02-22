# Evaluation: WebUI Cleanup & Final PRD Handoff (v1.11.2)

**Date:** 2026-02-21
**Phase:** 1 (Evaluate)
**Topic:** Polishing the WebUI by collapsing prompt payloads into HTML accordions and finalizing the agent handoff loop in the PRD.

## 1. Research & Current State
**Current Implementation (v1.11.1):**
1. **Raw Prompts Displayed:** The full prompt payloads for both the Charter and the PRD are permanently visible inside `<code>` blocks within the `agent-handoff-view` of the WebUI. Because these strings are now quite large, they dominate the screen real estate.
2. **Missing Final CTA:** When the Agent finishes deriving the High-Level PRD, it cleans up the documents as instructed, but it leaves the user without a clear next step. The user knows to click "Complete & Launch Command Deck" because it's green in the UI, but the Agent doesn't guide them there.

## 2. Gap Analysis & Proposed Direction

### Gap 1: UI Clutter from Large Prompts
* **Problem:** Large deterministic prompts take up too much vertical space by default. The user simply needs to click the "Copy" buttons; they rarely need to read the raw prompt text every time after the first few uses.
* **Proposed Fix:** Use native HTML5 `<details>` and `<summary>` tags around the `<code>` blocks in `onboardingWebview.ts`. This creates accessible, zero-dependency accordions. We can style the `<summary>` text (e.g., "View Prompt Payload") so the UI is clean by default, but the user can still inspect the prompt before copying if they wish.

### Gap 2: Agent Handoff Communication (Final Step)
* **Problem:** The Agent completes the work but does not explicitly close the loop with the user.
* **Proposed Fix:** Update `getPrdAgentInstruction` in `src/templates/prdStub.ts`. Append a final explicit instruction for the AI agent:
  * *"Finally, tell the user exactly this: 'The PRD and Strategy documents are complete! Please return to the MCD Onboarding WebUI and click "Complete & Launch Command Deck" to finish the onboarding process.'"*

## 3. Scoping & Boundaries

**In-Scope:**
- Point release v1.11.2.
- HTML adjustments in `onboardingWebview.ts` to use `<details>`.
- String template update in `prdStub.ts`.

**Out-of-Scope:**
- Changing exactly *how* the commands are copied. The button logic remains identical.

## 4. Primitive Review
Relying on out-of-the-box HTML5 tags (`<details>`) and string concatenation. No new primitives needed.
