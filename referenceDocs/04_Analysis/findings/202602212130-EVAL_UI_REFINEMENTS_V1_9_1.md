# Evaluation: Webview UI Point Release Refinements (v1.9.1+)

**Date:** 2026-02-21
**Phase:** 1 (Evaluate)
**Topic:** Iterating on the Webview UI to resolve broken interactions and polish the initialization experience through 1.9.x point releases.

## 1. Research & Current State
**Current Implementation (v1.9.0):**
1. **Broken Initialization:** Clicking the "Initialize Skeleton" button in the Webview silently fails.
2. **Root Cause:** The JavaScript validation loop aggressively iterates over the data payload `['projectName', 'codename', 'port', 'initialVersion', 'serverLang']`. When validating empty fields, it maps the key to a DOM ID by capitalizing the first letter and prefixing `init`. For `initialVersion`, this generated `initInitialVersion`. The actual DOM element ID is `initVersion`. Trying to access `.style` on a null element threw a JavaScript runtime error, aborting the `postMessage` call.
3. **Naming:** The button still says "Initialize Skeleton" instead of the requested "Initialize Project".

## 2. Gap Analysis & Proposed Direction

### Gap 1: Instantiation Button Fails (v1.9.1)
* **Proposed Fix:** Hardcode a ternary mapping in the valdiation loop: `const id = key === 'initialVersion' ? 'initVersion' : ...;`.
* **Proposed Fix:** Rename the button text to "Initialize Project".

### Gap 2: Missing Processing Feedback (v1.9.2)
When users click the button, there is a delay while the filesystem scaffold writes to disk and starts the server. Currently, there is zero visual feedback in the Webview that the initialization is occurring (VS Code only shows a progress notification in the bottom right).
* **Proposed Fix:** Disable the "Initialize Project" button and change its text to "Initializing..." or add a CSS spinner when the message is posted to the extension.

### Gap 3: Abrupt State Transition (v1.9.3)
When `scaffoldComplete` fires, the extension completely replaces `_panel.webview.html`, which causes a hard flash in the Webview.
* **Proposed Fix:** Move the state management entirely to the frontend Client side, hiding the `init-view` and showing the `selection-view` using CSS classes (`active`) immediately upon receiving a "success" message back from the extension.

## 3. Scoping & Boundaries

**In-Scope:**
- Point release v1.9.1 to fix the immediate breaking bug.
- Point releases v1.9.2 and v1.9.3 to implement loading states and smooth transitions.
- Updating `onboardingWebview.ts` and adding two-way message passing (`extension -> webview` for success callbacks).

**Out-of-Scope:**
- Adding additional views to the Webview beyond Project Initialization and Strategy Definition.

## 4. Primitive Review
No new primitives required. We are relying entirely on VS Code's Webview API and Vanilla JavaScript/CSS.
