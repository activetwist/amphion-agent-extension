# CLOSEOUT Record: AmphionAgent Extension v1.25.5 to v1.26.4

**Date:** 2026-02-24
**Codename:** `BlackClaw`

## 1. Archiving Overview
The following 11 active micro-contracts have been successfully executed, verified, and are now being archived:
1. `202602231730-CONTRACT_WEBVIEW_DASHBOARD.md`
2. `202602231827-CONTRACT_UI_NARROW_RAIL_V2.md`
3. `202602231934-CONTRACT_UI_ENHANCEMENTS_V3.md`
4. `202602232005-CONTRACT_SCAFFOLD_CHART_HOTFIX.md`
5. `202602232029-CONTRACT_MERMAID_RENDER_HOTFIX.md`
6. `202602232130-CONTRACT_SERVER_LAUNCH_BUG.md`
7. `202602232308-CONTRACT_NODE_DEPRECATION_SQLITE.md`
8. `202602232342-CONTRACT_UI_REFINEMENTS.md`
9. `202602232354-CONTRACT_COMMAND_DECK_MERMAID_PAN_ZOOM_VIEWER.md`
10. `202602240001-CONTRACT_HELP_COMMAND.md`
11. `202602240017-CONTRACT_DOCUMENTATION_RULES.md`

## 2. Release Summary
This massive deployment slice spans versions `v1.25.5` through `v1.26.4` of the `amphion-agent` IDE extension and the bundled `launch-command-deck` local server. It drastically stabilizes the project foundation by standardizing around a Python-backed SQLite instance (instead of JSON storage in Node/Python duality). It also provides a massive overhaul of the user experience by bringing the actual `state.json` Kanban directly into a native `WebviewPanel` embedded inside the IDE.

### Key Deliverables:
1. **Command Deck Dashboard:** Embedded the web UI into the IDE, negating the need for developers to bounce to their external browsers.
2. **SQLite Migration:** Gutted the fragile `.json` I/O mechanism and `server.js` node implementation, migrating completely to a purely Python `amphion.db` SQLite server on port `8765`.
3. **Pinch & Zoom Mermaid.js:** Implemented advanced DOM-bound panning and zooming capabilities for complex architecture artifacts inside the webview widget.
4. **Agentic Conversational "Help":** Created the new `.agents/workflows/help.md` instructions and bundled the `/help` button directly into the command line to guide users on MCD principles on demand.
5. **AI Observability Governance:** Purged legacy JSON schema paths and updated the AI's core instructions (`AGENTS.md`, `CLAUDE.md`, `.cursorrules`, and the `adapters.ts` template) to govern its new SQLite observability constraints natively.

## 3. Governance Validation
- [x] All executed features were individually driven by corresponding MCD `CONTRACT.md` artifacts.
- [x] All systemic designs utilized Mermaid.js diagrams directly within `referenceDocs/02_Architecture`.
- [x] No external cloud dependencies were added.
- [x] The `walkthrough.md` properly tracked incremental reviews prior to this final spin-down.
- [x] All contracts are moved to `03_Contracts/archive/`.

## 4. Finality
State locked. Extension is staged at `1.26.4`. This closeout record officially terminates the active milestone window.
