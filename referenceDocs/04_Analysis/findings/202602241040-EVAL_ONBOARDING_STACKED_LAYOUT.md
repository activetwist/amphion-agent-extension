# EVALUATE: Onboarding Options List Layout

## 1. Research & Analysis
The user requested an overhaul of the Onboarding Webview's "selection-view" block. The current layout uses a 3-column grid of equal-sized buttons. The requested layout moves to a stacked, vertical list instead of horizontal buttons.
Specifically, the new layout requires:
- 3 stacked rows with NO visible lines or background grids between them (clean grid).
- Each row uses a 2-column flex or grid structure:
  - Left column: Left-aligned heading and descriptive paragraph.
  - Right column: The action button.
- The action buttons retain their current dark color treatment and keep their respective emoji icons (⚡, 🧭, 📂).

**Content Requirements:**
- **Option 1**:
  - Heading: "1. Fast Onboard"
  - Copy: "I understand Product Management language very well, and I already know how to define and measure my project success."
  - Button Text: "Start Fast Onboarding" (with ⚡ icon)
- **Option 2**:
  - Heading: "2. Guided Onboarding (Recommended)"
  - Copy: "Answer a series of guided questions with easy descriptions to help you build the strategic documents for your project."
  - Button Text: "Start Guided Walkthrough" (with 🧭 icon)
- **Option 3**:
  - Heading: "Import My Own Documents" (Fixed typo from "Oen")
  - Copy: "I have a project charter and product requirements document already, and I would like to import them to initialize the project."
  - Button Text: "Import my Documents" (with 📂 icon)

## 2. Gap Analysis
The existing `selection-view` provides the content directly inside three large `<button>` elements styled as cards. Moving to a list view requires extracting the text out of the `<button>` tags and placing them in standard HTML structural elements (`<div>`, `<h4>`, `<p>`), leaving only the icon and the new action text inside the standard-sized `<button>` elements.

## 3. Scoping
**In-Scope:**
- Rewriting the HTML block in `mcd-starter-kit-dev/extension/src/onboardingWebview.ts`.
- Tuning CSS inline flexbox styling (`display: flex`, `align-items: center`, `justify-content: space-between`, `gap`) to achieve the clean, unbordered 2-column layout per row.
- Recompiling and verifying `.vsix` packaging.

**Out-of-Scope:**
- Altering the message passing handlers for the buttons (the IDs `btn-show-manual`, `btn-show-guided`, `btn-action-import` will simply be moved to the new smaller buttons).

## 4. Primitive Review
No new architecture primitives are required. This is purely an HTML presentation update to an existing view component.

## 5. Execution Status
I have halted execution to present these findings.

Would you like to populate the Command Board or build a contract based on these findings?
