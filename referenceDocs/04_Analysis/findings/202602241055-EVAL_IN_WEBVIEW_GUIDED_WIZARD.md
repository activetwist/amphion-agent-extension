# EVALUATE: In-Webview Guided Onboarding

## 1. Research & Analysis
The user requested that the "Guided Onboarding" workflow remain entirely within the custom Webview UI, avoiding native VS Code IDE inputs (`QuickPick` and `InputBox`).

Currently, `src/onboarding/guidedWizard.ts` handles the 18-step SIP-1 flow by awaiting native IDE input popups sequentially. To port this into the Webview, we must translate these 18 steps into standard HTML form elements (text inputs, dropdowns, and checkboxes) within a new dedicated "view" block in `onboardingWebview.ts`.

## 2. Gap Analysis
The existing architecture correctly captures all data, but forces a context switch out of the Webview into the command palette area at the top of the IDE. We need to:
1. Build a new `<div id="guided-view" class="view">` within the Webview HTML.
2. Construct 18 HTML form fields spanning the 8 major SIP-1 categories.
3. Replace the `startGuided` message command with a new `submitGuided` handler that receives the aggregate payload from the Webview and directly builds `FoundationState`, instead of invoking `guidedWizard.ts`.

## 3. Scoping
**In-Scope:**
- Writing a comprehensive, scrollable HTML form in `onboardingWebview.ts` for the 18 SIP-1 fields.
- Writing vanilla JavaScript within the Webview `<script>` tag to collect the form data and validate required fields upon clicking "Generate Strategy Artifacts".
- Refactoring `OnboardingPanel._onDidReceiveMessage` to accept `submitGuided` with the raw payload, map it into a `FoundationState` object, and trigger the artifact generation sequence.
- Deleting `src/onboarding/guidedWizard.ts`.

**Out-of-Scope:**
- Modifying the underlying `FoundationState` schema or artifact template generation logic.
- Splitting the Webview form into a multi-page wizard (to minimize frontend complexity, it will be a single scrollable form with clear section headers).

## 4. Primitive Review
No new architecture primitives are required. The state object (`FoundationState`) remains the definitive source of truth; only the data collection mechanism is changing.

## 5. Execution Status
I have halted execution to present these findings.

Would you like to populate the Command Board or build a contract based on these findings?
