# EVALUATE: Light Theme Toggle Regression

## 1. Research & Analysis
User-reported behavior ("light mode toggle disappeared") is confirmed in the currently served Command Deck frontend. Both local servers (Python and Node) serve the same `ops/launch-command-deck/public/*` assets, so this is not a backend parity issue.

### Evidence
1. **Live Ops Frontend Has No Theme Toggle Wiring**
   - `ops/launch-command-deck/public/index.html` contains no `#btnThemeToggle` button.
   - `ops/launch-command-deck/public/app.js` contains no `mcd_theme`, `data-theme`, or toggle click handler logic.
   - `ops/launch-command-deck/public/styles.css` contains no light-theme variable block (`html[data-theme="light"]`).
2. **Canonical Source Copy Still Has Theme Support**
   - `mcd-starter-kit-dev/command-deck-source/public/index.html` includes `#btnThemeToggle`.
   - `mcd-starter-kit-dev/command-deck-source/public/app.js` includes theme persistence and toggle behavior.
   - `mcd-starter-kit-dev/command-deck-source/public/styles.css` includes light-theme variables and semantic color tokens.
3. **Extension Asset Copy Also Lost Theme Support**
   - `mcd-starter-kit-dev/extension/assets/launch-command-deck/public/*` matches the current ops copy and also lacks theme toggle code.

## 2. Gap Analysis
The project currently has **frontend copy drift** across Command Deck copies:
- Runtime copy (`ops/launch-command-deck/public/*`) lacks theme features.
- Packaged extension copy (`mcd-starter-kit-dev/extension/assets/launch-command-deck/public/*`) also lacks theme features.
- Source copy (`mcd-starter-kit-dev/command-deck-source/public/*`) still contains the intended theme system.

This mismatch explains the disappearance and creates regression risk for future sync operations.

## 3. Scoping
### In Scope
- Restore light/dark theme toggle in both active runtime and extension asset copies.
- Reconcile the three frontend copies to a deterministic source-of-truth flow.
- Add regression checks for theme toggle presence and persistence.

### Out of Scope
- Marketplace publish and metadata work.
- Unrelated Command Deck feature redesign.

## 4. Primitive Review
No new architecture primitives required. This is a frontend synchronization and regression hardening task.

## 5. Conclusion
**HALT.** Evaluation complete. Regression is confirmed and root cause is copy divergence, not server mismatch.
