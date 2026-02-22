# EVALUATE: UI Breakage Analysis (v1.23.1)

## 1. Research & Analysis
The user reported two issues with the `v1.23.1` onboarding UI:
1. The UI incorrectly displays two steps (the old "Build Project Charter" and the new "Build Strategy Documents") instead of one.
2. The "I've typed /docs" button fails the acceptance criteria of "Exposes Open Command Terminal button."

Upon inspecting `onboardingWebview.ts`, the root cause was identified as a malformed substring replacement during the `v1.23.0` consolidation:
- **DOM ID Mismatch:** The previous replacement targeting the `<div id="step-charter">` block failed to match the exact string because the targeted text omitted the inline `style` attributes. Consequently, the system performed a fuzzy search and appended the entirely new `/docs` UI block *inside* the existing `step-charter` block instead of completely replacing it.
- **JavaScript Null Reference Exception:** Because the `id="step-charter"` node and its opening tags were never removed, the expected `<div id="step-docs">` parent node does not exist in the DOM. Therefore, the JavaScript event listener declaration `const stepDocs = document.getElementById('step-docs');` evaluates to `null`. When `btnDocsDone` is clicked, the script attempts to execute `stepDocs.style.display = 'none'`, which instantly throws a `TypeError: Cannot read properties of null` and halts execution *before* the Command Deck launch button is ever revealed.
- **Duplicate Views:** A secondary structural defect was discovered in the HTML: there are two identical `<div id="manual-success-view">` blocks appended directly on top of each other, caused by a similar fuzzy replacement artifact.

## 2. Gap Analysis
- The `agent-handoff-view` HTML lacks structural integrity and contains duplicated logic and old artifact text.
- The corresponding JavaScript DOM references are misaligned with the current HTML output, causing logic halting runtime errors.

## 3. Scoping
- **In-Scope**: 
  - Fixing the HTML of the `agent-handoff-view` to cleanly and exclusively contain the single `/docs` step block.
  - Ensuring the parent `div` correctly has the `id="step-docs"`.
  - Removing the duplicate `manual-success-view` HTML block.
- **Out-of-Scope**: 
  - Any modifications to Git initialization logic, command deployment, or other TS files. No structural changes to the logic flow beyond fixing the HTML structural debt so the button event listener passes successfully.

## 4. Primitive Review
No new architecture primitives are required. This is a targeted UI structural defect.

## 5. Acceptance Criteria
- [ ] The Agent Strategy Handoff UI cleanly displays a single instruction step (`#step-docs`): "Build Strategy Documents /docs".
- [ ] Clicking "I've typed /docs" cleanly hides the instructions and exposes the "Open Command Deck" button without throwing JavaScript runtime errors.
- [ ] There is only one `manual-success-view` block in the DOM.
