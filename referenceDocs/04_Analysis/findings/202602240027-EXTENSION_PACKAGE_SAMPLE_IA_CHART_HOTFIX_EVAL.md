# EVALUATION: Extension Package Sample IA Chart Hotfix

**Phase:** 1 (Evaluate)  
**Status:** Complete  
**Date (UTC):** 2026-02-24T00:28:53Z  
**Codename:** `BlackClaw`

## 1. Objective
Evaluate a hotfix that ensures the sample Mermaid chart (`Sample IA · Marketing Site`) is included in extension-delivered Command Deck output, with a clear top-of-chart deletion notice for the packaging/release agent.

Operator constraints:
- Do not package/build in this phase.
- Keep scope minimal and non-breaking.

## 2. Current State (Research)
### Extension packaging surface
- Extension package currently includes `assets/launch-command-deck` (not excluded by `.vscodeignore`).
- `mcd-starter-kit-dev/extension/src/scaffolder.ts` copies `assets/launch-command-deck` into project `ops/launch-command-deck`.

### Existing sample chart location
- Sample chart currently exists in:
  - `mcd-starter-kit-dev/extension/assets/launch-command-deck/data/state.json`
  - `mcd-starter-kit-dev/command-deck-source/data/state.json`
  - `ops/launch-command-deck/data/state.json`

### Critical behavior affecting inclusion
- After copy, scaffolder runs `ops/launch-command-deck/scripts/init_command_deck.py`.
- That init script rewrites `data/state.json` from `build_state(...)` and currently does **not** include `charts`.
- Net effect: sample chart present in packaged assets can be removed during project initialization.

## 3. Gap Analysis
1. **Seed overwrite gap (High):** chart persistence is not guaranteed because init script rewrites state without `charts`.
2. **Instruction visibility gap (Medium):** current sample chart content has no explicit top-level deletion warning.
3. **Parity drift risk (Medium):** extension asset script and mirrored command-deck-source script can diverge if hotfix lands in only one copy.

## 4. Feasible Hotfix Direction (Minimal + Safe)
### Recommended
Seed the sample chart directly in `build_state(...)` inside the init script used by extension assets, with a warning banner at the top of chart markdown.

Suggested chart markdown shape:
- Leading line (rendered above Mermaid diagram), e.g.:
  `> TEMP: Packaging agent — delete this sample chart before release packaging.`
- Mermaid code block below (existing Home/About/Blog/Contact IA).

Why this path:
- Survives post-copy init rewrite.
- Keeps behavior additive and low risk.
- Meets “message at the top” requirement in rendered preview.

## 5. Scope Definition
### In Scope (for contract)
- Add/retain sample chart seeding in init-state generation path used by extension scaffolding.
- Include explicit top-of-chart delete notice in chart markdown.
- Keep extension asset and mirror source scripts/data synchronized where contract chooses parity.

### Out of Scope
- Running `vsce package` or any packaging pipeline execution.
- New chart management features/UI.
- Backend API changes.

## 6. Risks and Mitigations
- **Unintended permanent sample exposure (Medium):** warning ignored and sample ships publicly.
  - Mitigation: explicit deletion warning in top message and clear contract acceptance gate.
- **Behavior regression in scaffold init (Low):** malformed state seed structure.
  - Mitigation: keep schema unchanged except additive `charts`; validate JSON + smoke init.
- **Mirror drift (Medium):** update applied only to extension asset copy.
  - Mitigation: include command-deck-source parity AFPs in the contract slice.

## 7. Primitive Review
No new architecture primitive required. This is a deterministic seed-data hotfix in existing initialization flow.

## 8. Contract-Ready Slices
1. **Init Seed Slice**
   - Add `charts` array with sample IA entry in init script output state.
2. **Deletion Notice Slice**
   - Add top-visible warning text in sample chart markdown.
3. **Parity + Verification Slice**
   - Sync selected mirrors and run scaffold seed sanity checks (no packaging).

## 9. Candidate AFPs (for contract)
- `mcd-starter-kit-dev/extension/assets/launch-command-deck/scripts/init_command_deck.py`
- `mcd-starter-kit-dev/extension/assets/launch-command-deck/data/state.json` (optional fallback/snapshot parity)
- `mcd-starter-kit-dev/command-deck-source/scripts/init_command_deck.py` (parity target)
- `mcd-starter-kit-dev/command-deck-source/data/state.json` (optional fallback/snapshot parity)
- `ops/launch-command-deck/data/state.json` (board observability cards)

## 10. Bottom Line
The hotfix is feasible and should target the init-state generator, not only static `state.json`, to guarantee inclusion after scaffolding. A top-rendered warning line above the Mermaid block cleanly satisfies the deletion-message requirement without broader UI changes.
