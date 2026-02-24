# EVALUATE: Missing Mermaid Chart in Scaffold

**Phase: 1 (Research & Scoping)**
**Date:** 2026-02-23
**Focus:** `init_command_deck.py` state initialization

## 1. Research & Analysis
- **The Issue:** The user reported that the `Sample IA · Marketing Site` Mermaid chart did not survive packaging. When launching the Command Deck on a newly scaffolded project, the Charts tab is entirely empty.
- **Root Cause:** In `mcd-starter-kit-dev/extension/assets/launch-command-deck/scripts/init_command_deck.py`, the `build_state` function constructs a fresh copy of `state.json` for the new project. However, it does not include a `charts` array in the returned dictionary. This means the default state object bundled with the server is entirely overwritten during the scaffold process, erasing the chart.

## 2. Gap Analysis
- `init_command_deck.py` needs to inject the `Sample IA · Marketing Site` dictionary into the top-level `state` object during the scaffold build.

## 3. Scoping Boundaries
**In-Scope:**
- Modify `init_command_deck.py` in `mcd-starter-kit-dev/extension/assets/launch-command-deck/scripts/` to include the `charts` array containing the exact `sample_ia_home_about_blog_contact` payload.
- Generate and package a `1.25.7` VSIX hotfix.

**Out-of-Scope:**
- Modifying the Command Deck server logic (`server.js`/`server.py`).
- Adding new charts beyond the single sample IA chart.

## 4. Primitive Review
No new core Architecture Primitives are introduced. We are restoring a previously defined primitive that was being overwritten at runtime.
