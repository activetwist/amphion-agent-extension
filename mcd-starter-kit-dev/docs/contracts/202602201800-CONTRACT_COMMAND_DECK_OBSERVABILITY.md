# Contract: v0.03a Command Deck Observability & Governance Update

Contract ID: `CT-20260220-OPS-003`
Date: `2026-02-20`
Project: `Content Monetization` (`Stacks`)
Phase: `Contract`

## Objective
Enhance the Command Deck with a General Observability Dashboard to display Project Vitals, Reference Documents, and Traceability feeds. Introduce configurable Project Types for domain-specific metrics. Update governance scaffolding to legally mandate Mermaid.js for all architecture diagrams.

## Authorized File Changes

### 1. Governance & Scaffold Updates
**Files**: `referenceDocs/00_Governance/GUARDRAILS.md`, `MCD_SCAFFOLD_v2.md`
- **Mermaid.js Mandate**: Add an explicit rule to the governance "Hard Rules" and scaffold generation sequence requiring system architecture diagrams to be written in Mermaid.js syntax.

### 2. Initialization & Data Model
**Files**: `ops/launch-command-deck/scripts/init_command_deck.py`
- **Project Type Config**: Update script to accept a `--type` argument (e.g., `content_pipeline`, `software_dev`, default: `standard`).
- **State Payload**: Inject the selected `projectType` into the initial `state.json` payload during board creation.

### 3. Server Component (Backend)
**Files**: `ops/launch-command-deck/server.py`
- **Document Serving Route**: Add API endpoint (e.g., `/api/docs`) to securely read and return contents of `PROJECT_CHARTER.md`, `PRD.md`, `GUARDRAILS.md`, and the active contract.
- **Git Traceability Route**: Add API endpoint (e.g., `/api/git/log`) to execute `git log -n 5` and return recent closeout commits.

### 4. Client Component (Frontend)
**Files**: `ops/launch-command-deck/public/index.html`, `ops/launch-command-deck/public/app.js`, `ops/launch-command-deck/public/styles.css`
- **Dashboard Layout**: Introduce a dedicated Dashboard View alongside the existing Kanban Board.
- **Project Vitals**: Display current active phase, milestone burndown, and Blocker card alerts.
- **Reference Library**: Render fetched markdown documents cleanly.
- **Traceability Feed**: Display the recent git commit log.
- **Dynamic Metrics**: Render a placeholder metrics widget that adapts based on the `projectType` in `state.json`.

## Acceptance Criteria
1. `GUARDRAILS.md` and `MCD_SCAFFOLD_v2.md` explicitly include the Mermaid.js rule.
2. `init_command_deck.py` accepts `--type` and writes it to the data payload.
3. The Command Deck UI features a functional Dashboard displaying Vitals, Markdown documents, and Git history.
4. The server remains a zero-dependency Python script (`server.py`). 

## Execution Steps
1. Modify governance and scaffold files.
2. Update the init script.
3. Add backend API routes to `server.py`.
4. Overhaul the front-end to support the dual Board/Dashboard views.
