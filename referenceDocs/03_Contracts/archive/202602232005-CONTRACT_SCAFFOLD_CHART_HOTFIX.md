---
type: CONTRACT
id: CT-036
date: 2026-02-23
status: DRAFT
objective: Scaffold Chart Hotfix (v1.25.7)
---

# CONTRACT: Scaffold Chart Hotfix

## 1. Goal
Ensure the `Sample IA · Marketing Site` Mermaid chart survives the initialization phase when scaffolding a new project. Currently, the `init_command_deck.py` script generates a fresh state dictionary but omits the `charts` array, resulting in an empty Charts tab.

## 2. Affected File Paths (AFPs)
- `mcd-starter-kit-dev/extension/assets/launch-command-deck/scripts/init_command_deck.py`
- `mcd-starter-kit-dev/extension/package.json`

## 3. Scope Boundaries
**In-Scope:**
- Modify `init_command_deck.py` to append the hardcoded sample chart dictionary into the `state` object.
- Bump version to `1.25.7` and package VSIX.

**Out-of-Scope:**
- Modifying the webview rendering logic in the server.

## 4. Execution Plan
1. **Python Update:** Insert the `charts` array carrying the `sample_ia_home_about_blog_contact` payload into `build_state()` return object in `init_command_deck.py`.
2. **Release:** Bump `package.json` to `1.25.7` and `npm run package`.
3. **Validation:** Initialize a new project and confirm the chart exists in the Dashboard.

## 5. Risk Assessment
- **Severity:** Low. This is a targeted state schema injection during bootstrap.

## 6. Acceptance Criteria
- [ ] New project scaffolds contain the `Sample IA · Marketing Site` chart in `state.json`.
- [ ] The chart is visible and renderable in the Command Deck Dashboard on launch.
- [ ] Build `1.25.7` compiles successfully.
