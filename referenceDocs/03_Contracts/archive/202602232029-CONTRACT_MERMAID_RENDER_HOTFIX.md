---
type: CONTRACT
id: CT-037
date: 2026-02-23
status: DRAFT
objective: Scaffolded Mermaid Rendering Bug Fix (v1.25.8)
---

# CONTRACT: Scaffolded Mermaid Rendering Fix

## 1. Goal
Ensure the `Sample IA · Marketing Site` Mermaid chart injected during scaffolding renders properly in the frontend by switching the literal escape sequence `\\n` to actual newlines `\n` within the Python initialization script.

## 2. Affected File Paths (AFPs)
- `mcd-starter-kit-dev/extension/assets/launch-command-deck/scripts/init_command_deck.py`
- `mcd-starter-kit-dev/extension/package.json`

## 3. Scope Boundaries
**In-Scope:**
- Modify `init_command_deck.py` string literal formatting.
- Bump version to `1.25.8` and package VSIX.

**Out-of-Scope:**
- Modifying the frontend Mermaid renderer or the zoom and pan architecture.

## 4. Execution Plan
1. **Python Update:** Change `"```mermaid\\nflowchart TD\\n..."` to `"```mermaid\nflowchart TD\n  ... \n```"` in `init_command_deck.py`.
2. **Release:** Bump `package.json` to `1.25.8` and execute `npm run package`.
3. **Validation:** Initialize a new project and confirm the diagram is successfully parsed and drawn.

## 5. Risk Assessment
- **Severity:** Low. String serialization formatting fix.

## 6. Acceptance Criteria
- [ ] New project scaffolds generate valid JSON strings with unescaped newlines for the chart content.
- [ ] The chart is visible, renderable, and inherits the existing zoom/pan capabilities.
- [ ] Build `1.25.8` compiles successfully.
