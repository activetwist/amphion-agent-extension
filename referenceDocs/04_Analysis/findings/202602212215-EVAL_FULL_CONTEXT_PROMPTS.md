# Evaluation: Full Context Agent Prompts (v1.11.0)

**Date:** 2026-02-21
**Phase:** 1 (Evaluate)
**Topic:** Passing the complete, deterministic agent derivation instructions (formerly embedded strictly in the document) directly to the WebUI for clipboard copying.

## 1. Research & Current State
**Current Implementation (v1.10.0):**
The Webview displays and copies a "pointer" prompt (`"Please read the [!AGENT INSTRUCTION] block in this file..."`). The actual heavy instructions (listing the files to read, what to extract, what tone to use) are embedded inside `PROJECT_CHARTER.md` and `HIGH_LEVEL_PRD.md` under a `> [!AGENT INSTRUCTION]` block.

**User Feedback:**
Since we generate these files deterministically, we possess the exact instruction string in runtime memory. We should pass that *entire* instruction string to the WebUI, rather than forcing the Agent to read the file to find its instructions. This removes a layer of indirection and guarantees the agent receives the exact payload into its context window immediately.

## 2. Gap Analysis & Proposed Direction

### Gap 1: Context Indirection
* **Problem:** Pointing an agent to read a file to find its prompt adds latency and introduces a failure vector if the agent hallucinates or truncates reading the file.
* **Proposed Fix:** Extract the actual instruction block generation logic from `src/templates/charterStub.ts` and `src/templates/prdStub.ts`. Return these exact strings as the `charterPrompt` and `prdPrompt` payloads in `charterWizard.ts` back to the Webview.

### Gap 2: WebUI Code Block Formatting
* **Problem:** The current Webview `<code>` blocks are optimized for the single-line pointer prompt. They are small and unformatted.
* **Proposed Fix:** Update `onboardingWebview.ts` CSS to handle large, multi-line prompt payloads elegantly. Ensure `white-space: pre-wrap` is maintained and the font size is appropriate for a block of text.

## 3. Scoping & Boundaries

**In-Scope:**
- Point release v1.11.0.
- Creating exportable prompt payload generator functions in `charterStub.ts` and `prdStub.ts` to keep the prompt text DRY.
- Updating `runSourceDocsPath` in `charterWizard.ts` to use these new functions to retrieve the payloads to send back to the Webview.
- Adjusting the CSS in the Webview to handle tall prompt blocks.

**Out-of-Scope:**
- Removing the `[!AGENT INSTRUCTION]` blocks from the generated `.md` files. We should leave them in as a fallback, but the primary handoff mechanism will be the exact clipboard text.

## 4. Primitive Review
Standard refactoring of existing string templates. No new primitives needed.
