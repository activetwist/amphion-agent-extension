# EVALUATE: Missing Issue IDs on GhostMolt Task Cards

## 1. Research & Analysis
The user provided a screenshot of a Command Deck card from a newly scaffolded project (`GhostMolt`) lacking the `AM-XXX` issue badge in the bottom left corner, despite running the latest Python server instance on a fresh port.

**Findings:**
1. **The Backend is Correct**: Inspecting the `state.json` data for `GhostMolt`, the Python server is functioning perfectly. The cards *do* possess issue numbers (e.g., `"issueNumber": "BLA-001"`).
2. **The Frontend is Outdated**: The issue lies strictly in the browser UI. The `app.js`, `index.html`, and `styles.css` files inside `GhostMolt/ops/launch-command-deck/public/` literally do not contain any of the code required to render `.issue-badge`. 

## 2. Gap Analysis (The Root Cause)
When the Issue Numbers feature was originally built into the Command Deck (v1.6.0), the front-end code (HTML/CSS/JS) was successfully written to the canonical `AmphionAgent/ops/...` directory. 
However, **it was never mirrored into the extension's scaffolding templates** at `AmphionAgent/mcd-starter-kit-dev/extension/assets/launch-command-deck/public/`. 

As a result, every time the `amphion-agent` extension scaffolds a brand new project (like GhostMolt), it ships with the correct, modern Python backend, but a **stale, outdated frontend** that is completely blind to issue numbers. The data is there, but the browser doesn't know how to draw the badge.

## 3. Scoping & Action Plan
**In-Scope Fixes (Requires Execution):**
1. Copy the canonical `app.js`, `index.html`, and `styles.css` from `AmphionAgent/ops/launch-command-deck/public/` into the extension's `assets/launch-command-deck/public/` template folder.
2. Compile and package the extension as `v1.24.3` so all *future* projects receive the correct UI.
3. Provide the Product Owner with a simple CLI command to manually copy the modern `public/` folder into their existing `GhostMolt` project to hot-patch it.

## 4. Primitive Review
No new primitives required.

## 5. Conclusion
**HALT.** Evaluation complete. The fix requires mirroring the canonical front-end codebase into the extension's scaffold templates to restore UI parity for new projects. Proceed to execution upon user approval.
