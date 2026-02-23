# EVALUATE: Light Mode WCAG Contrast Failures

## 1. Research & Analysis
Operator requested a focused WCAG contrast evaluation for the restored light mode in Command Deck. Analysis was performed on `ops/launch-command-deck/public/styles.css` (active runtime copy) and key text/background pairings.

### Confirmed Contrast Failures (Light Theme)
1. **Milestone Badge Text**
   - Selector: `.milestone-badge`
   - Current text color: `#aee7ff` on light surfaces (`#ffffff` / `#f8fafc`)
   - Estimated contrast: **~1.34:1**
   - Result: **Fails WCAG AA** (normal text requires 4.5:1)
2. **Primary Button Label Text**
   - Selector: `.btn.primary`
   - Current effective text color inherits `--text` (`#0f172a`) on dark green background
   - Estimated contrast: **~3.03:1**
   - Result: **Fails WCAG AA** for normal-size button text
3. **Danger Button Label Text**
   - Selector: `.btn.danger`
   - Current effective text color inherits `--text` (`#0f172a`) on dark red background
   - Estimated contrast: **~1.58:1**
   - Result: **Fails WCAG AA** (severe)
4. **Issue Badge Text (Minor but Real)**
   - Selector: `.issue-badge`
   - Uses `var(--text-dim)` with `opacity: 0.7` on light background
   - Estimated effective contrast: **~3.59:1**
   - Result: **Fails WCAG AA** for normal-sized text

### Passing/Acceptable Samples
- `--text-dim` (`#475569`) on white: ~7.58:1 (pass)
- `--card-meta` (`#64748b`) on white: ~4.76:1 (pass, borderline)

## 2. Gap Analysis
Light mode is functionally restored, but not fully accessible. The current palette mixes dark-theme badge/button assumptions with light-theme foreground inheritance, producing multiple AA failures.

## 3. Scoping
### In Scope
- Patch color tokens and per-component text color rules for light mode to meet WCAG AA.
- Normalize badge/button text color behavior to avoid inheritance-based regressions.
- Validate contrast on runtime copy and mirror to extension/source copies after pass.

### Out of Scope
- Layout redesign.
- Non-color accessibility work (keyboard navigation, ARIA semantics).
- Backend/API changes.

## 4. Primitive Review
No new architecture primitives required. This is a CSS token/selector contrast hardening pass.

## 5. Conclusion
**HALT.** Evaluation complete. Light mode currently contains confirmed WCAG contrast failures that should be corrected before release closeout.
