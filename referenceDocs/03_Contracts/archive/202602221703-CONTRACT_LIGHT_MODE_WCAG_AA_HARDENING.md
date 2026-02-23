# CONTRACT: Light Mode WCAG AA Contrast Hardening

**Phase:** 2.0 (Contract)  
**Status:** Proposed  
**Date:** 2026-02-22  
**Codename:** `BlackClaw`

## 1. Goal
Resolve confirmed WCAG AA contrast failures in Command Deck light mode while preserving current runtime behavior and maintaining synchronized frontend copies.

## 2. Approved AFPs (Affected File Paths)
- `referenceDocs/03_Contracts/active/202602221703-CONTRACT_LIGHT_MODE_WCAG_AA_HARDENING.md` (this contract)
- `ops/launch-command-deck/data/state.json` (observability card)
- `ops/launch-command-deck/public/styles.css`
- `mcd-starter-kit-dev/extension/assets/launch-command-deck/public/styles.css`
- `mcd-starter-kit-dev/command-deck-source/public/styles.css`
- `referenceDocs/05_Records/buildLogs/202602221703-EXECUTE_LIGHT_MODE_WCAG_AA_HARDENING.md` (new)
- `referenceDocs/05_Records/buildLogs/202602221703-WALKTHROUGH_LIGHT_MODE_WCAG_AA_HARDENING.md` (new)

## 3. Scope Boundaries
- **In Scope:**
  - Adjust light-mode color tokens and component-specific text colors to satisfy WCAG AA for normal text.
  - Fix known failing selectors:
    - `.milestone-badge`
    - `.btn.primary`
    - `.btn.danger`
    - `.issue-badge` (including opacity treatment)
  - Validate contrast targets and ensure no visual regression to dark mode.
  - Mirror validated CSS updates to runtime, extension asset, and command-deck-source copies.
- **Out of Scope:**
  - HTML structure changes and JavaScript behavior changes.
  - Backend/API/state-model changes.
  - Non-color accessibility items (keyboard, focus order, ARIA semantics).

## 4. Deterministic Execution Plan
1. **Baseline**
   - Reconfirm current failing contrast pairs from evaluation findings.
2. **Token & Selector Hardening**
   - Apply minimal CSS-only light-mode adjustments for failing components.
   - Remove low-contrast opacity where needed.
3. **Contrast Verification**
   - Recompute contrast for known failing pairs and confirm AA pass (>=4.5:1 for normal text).
4. **Copy Synchronization**
   - Mirror validated `styles.css` to extension assets and command-deck-source.
5. **Regression Checks**
   - Verify key UI elements remain visually coherent in both light and dark modes.
6. **Documentation**
   - Record execution outcomes and walkthrough steps in `05_Records/buildLogs/`.

## 5. Risk Assessment
- **Visual Drift Risk (Medium):** contrast fixes can unintentionally alter design balance.  
  **Mitigation:** minimal scoped selector changes, preserve existing spacing/layout.
- **Theme Parity Risk (Medium):** fixes in one copy can diverge from others.  
  **Mitigation:** synchronize all three CSS copies in same execution slice.
- **Regression Risk (Low/Medium):** dark mode may be accidentally affected if shared variables are changed broadly.  
  **Mitigation:** constrain edits to light-mode block and targeted selectors.

## 6. Acceptance Criteria
- [ ] `.milestone-badge` text meets WCAG AA in light mode.
- [ ] `.btn.primary` and `.btn.danger` label text meet WCAG AA in light mode.
- [ ] `.issue-badge` meets WCAG AA in light mode (no failing opacity treatment).
- [ ] Dark mode visuals/function remain intact.
- [ ] `styles.css` updates are synchronized across runtime, extension asset, and command-deck-source copies.
- [ ] Execution build log and walkthrough artifacts are created.

## 7. Operator Approval Gate
Execution is blocked pending operator approval.  
To begin implementation, invoke:

`/execute 202602221703-CONTRACT_LIGHT_MODE_WCAG_AA_HARDENING.md`
