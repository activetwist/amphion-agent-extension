# EVALUATION: Command Deck Unified Operational Restyle

**Phase:** 1 (Evaluate)  
**Status:** Complete  
**Date (UTC):** 2026-02-23T21:29:56Z  
**Codename:** `BlackClaw`

**Input Artifact:** `referenceDocs/05_Records/documentation/helperContext/restyle.json`

## 1. Objective
Evaluate feasibility and scope for applying the requested `Command Deck Unified Operational System` restyle to the Command Deck application, with explicit boundaries, risks, and contract-ready file targets.

## 2. Research Summary (Current State)
- Runtime UI currently relies on a dense, cyber-style token set with strong borders, gradients, and globally monospace typography (`ops/launch-command-deck/public/styles.css`).
- Light mode is implemented, but many visual rules remain hard-edged (border-heavy panels, hardcoded button gradients, hardcoded priority badge colors).
- Significant inline styling exists in `index.html`, which bypasses token governance and weakens theme consistency.
- Runtime and template copies are already drifted:
  - `ops/launch-command-deck/public/*`
  - `mcd-starter-kit-dev/extension/assets/launch-command-deck/public/*`
  - `mcd-starter-kit-dev/command-deck-source/public/*`
- An active contract file still exists in `referenceDocs/03_Contracts/active/` and overlaps some same frontend AFPs, even though it is marked executed; this is a governance conflict risk for the next contract if not explicitly superseded/closed.

## 3. Gap Analysis Against `restyle.json`
### Gap A: Design token architecture is insufficiently semantic
Current CSS variables are mostly palette-centric (`--bg-0`, `--line`, `--accent`) instead of layered surface semantics (canvas/surface/card/interactive) requested by the restyle.

### Gap B: Border/elevation model conflicts with requested visual hierarchy
Current interface depends on visible borders across most surfaces and uses small radius (`--radius: 4px`). Restyle requires tonal separation, minimized border visibility, and larger card radii (10-12px) with controlled elevation.

### Gap C: Typography policy conflicts
Current system applies monospace globally (`--font`), while restyle requires sans-led UI typography with monospace restricted to code/traceability/ID contexts.

### Gap D: Accent governance is not enforced
Current accent usage is broad and sometimes ornamental (gradients, hover brightness filters). Restyle requires restrained accent usage by role (primary actions/navigation/select state) and separated success/warning/danger semantics.

### Gap E: Component-level hardcoding limits theme integrity
Buttons and priority badges use hardcoded color stacks that do not fully map to a unified light/dark operational palette policy.

### Gap F: Interaction and accessibility consistency is partial
Hover lift exists, but explicit `:focus-visible` ring policy and standardized interaction tokens are not consistently enforced across controls.

## 4. Scope Definition
### In Scope (recommended for contract)
1. Refactor `styles.css` to semantic design tokens aligned to restyle (light + dark).
2. Replace hardcoded component colors (buttons/badges/tables/cards/nav/columns) with governed tokens.
3. Introduce controlled elevation model and border-softening strategy.
4. Apply typography split: operational sans default + monospace-limited contexts.
5. Remove/normalize inline visual styles from `index.html` into tokenized CSS classes.
6. Preserve functional behavior and JS event logic; this is visual-system restyling, not feature redesign.
7. Decide parity target explicitly: runtime-only or runtime + extension/template mirrors.

### Out of Scope (Evaluate-only boundary)
1. Backend API changes (`server.js`, `server.py`) and persistence/runtime policy changes.
2. Workflow/feature redesign (board logic, views, endpoints).
3. Introducing external CSS frameworks/build tooling.
4. Closeout/release tasks.

## 5. Risks and Unknowns
- **Governance conflict risk (Medium):** existing active contract artifact overlaps frontend AFPs; next contract should explicitly supersede or clear this state.
- **Parity drift risk (High):** applying restyle only in `ops/` leaves scaffolded extension UIs visually divergent.
- **Accessibility regression risk (Medium):** broad palette changes can reintroduce contrast failures unless validated systematically.
- **Font availability risk (Low/Medium):** `Modern Geometric Sans` in restyle is conceptual; contract must specify exact shippable font stack.
- **Inline-style migration risk (Low):** moving many inline declarations to classes can cause local layout regressions if not smoke-tested per view.

## 6. Primitive Review
No new architecture primitive is strictly required to execute this restyle.  
Recommended (optional): add a lightweight visual-token primitive documenting canonical semantic token names and cross-copy sync policy to reduce repeated drift.

## 7. Contract-Ready Work Slices
1. **Token Foundation:** semantic color/elevation/typography/spacing tokens + focus/interaction tokens.
2. **Surface + Component Restyle:** nav, panels, columns, cards, buttons, badges, dialogs, charts/dashboard sections.
3. **Markup Hygiene:** reduce inline style dependence in `index.html` and replace with CSS classes.
4. **Parity Sync + Validation:** propagate chosen visual system to selected mirror copies and run light/dark smoke checks.

## 8. Candidate Approved File Paths (for CONTRACT)
- `ops/launch-command-deck/public/styles.css`
- `ops/launch-command-deck/public/index.html`
- `ops/launch-command-deck/public/app.js` (only if class hooks/theme labels require minor wiring)
- `mcd-starter-kit-dev/extension/assets/launch-command-deck/public/styles.css` (if parity included)
- `mcd-starter-kit-dev/extension/assets/launch-command-deck/public/index.html` (if parity included)
- `mcd-starter-kit-dev/extension/assets/launch-command-deck/public/app.js` (if parity included)
- `mcd-starter-kit-dev/command-deck-source/public/styles.css` (if parity included)
- `mcd-starter-kit-dev/command-deck-source/public/index.html` (if parity included)
- `mcd-starter-kit-dev/command-deck-source/public/app.js` (if parity included)
- `ops/launch-command-deck/data/state.json` (observability cards)

## 9. Bottom Line
The requested restyle is feasible and should be treated as a visual-system refactor centered on semantic tokens, component consistency, and parity strategy. The most important decision before contracting is whether the restyle scope is runtime-only or includes template/extension parity in the same slice.
