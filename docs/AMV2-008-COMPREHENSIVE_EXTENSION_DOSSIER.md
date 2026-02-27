# AMV2-008 Comprehensive Extension Capability Dossier

Status: Draft for eBook source material  
Scope: AmphionAgent v2 extension + local Command Deck runtime  
Snapshot date (UTC): 2026-02-27T02:40:29Z

## 1) Purpose and framing

This document is a source-backed, publication-grade map of AmphionAgentv2:

- What the extension does end-to-end.
- How it enforces and reinforces Micro-Contract Development (MCD).
- What is canonical in the local SQLite authority versus non-authoritative surfaces.
- What delivery evidence exists for production distribution as a solo-operator, AI-assisted build model.

This dossier is intentionally evidence-first. Every major claim maps to code, DB state, runtime API behavior, git history, or marketplace metadata.

## 2) Evidence baseline (frozen snapshot)

### Runtime fingerprint

- API health response at `http://127.0.0.1:8773/api/health` reports:
  - `runtime.server = launch-command-deck`
  - `runtime.implementation = python`
  - `runtime.datastore = sqlite`
  - `runtime.fingerprint = launch-command-deck:python:sqlite`

### Active board scope

- Active board id: `board_5bfccf9a28`
- Board count: `1`
- Milestones: `10`
- Cards: `50`

### Database authority

Canonical DB in this workspace:

- `.amphion/command-deck/data/amphion.db`

Core table counts at snapshot time:

- `boards`: 1
- `milestones`: 10
- `cards`: 50
- `charts`: 1
- `board_artifacts`: 11
- `milestone_artifacts`: 16
- `memory_events`: 118
- `memory_objects`: 6

### Marketplace snapshots (time-sensitive)

- OpenVSX (`active-twist/amphion-agent`):
  - version: `1.50.6`
  - timestamp: `2026-02-27T01:18:51.014620Z`
  - downloadCount: `864`
- VS Code Marketplace (`active-twist.amphion-agent`):
  - version: `1.50.6`
  - lastUpdated: `2026-02-27T01:24:02.583Z`
  - reported `downloadCount` statistic: `81`

Note: Marketplace stats are inherently mutable and can drift after this snapshot.

## 3) Product definition

AmphionAgent is a VS Code extension that scaffolds and operates local, governance-heavy AI-assisted development environments. The product has two tightly integrated surfaces:

1. Extension host layer (TypeScript):
- Onboarding and scaffold generation
- IDE adapter generation for multiple agent IDEs
- Sidebar panel (Amphion Agent Controls)
- Chat dispatch into active IDE chat surfaces
- Managed server lifecycle (start/stop + runtime fingerprint validation)
- DB artifact write helpers (board artifacts + queued flush)

2. Command Deck runtime (Python + SQLite + static web app):
- Local API authority for boards, milestones, cards, artifacts, memory, docs, and charts
- Local Kanban + dashboard + guide + charts UI
- Artifact revisioning (board and milestone)
- Milestone closeout automation and outcomes appending
- Startup migrations/repairs for legacy and malformed states

## 4) Complete capability inventory

### 4.1 Extension activation and commands

Activation event:

- `onStartupFinished`

Contributed commands:

- `mcd.init` (`MCD: Initialize New Project`)
- `mcd.openDashboard` (`MCD: Open Amphion Agent Controls`)
- `mcd.diagnoseChatDispatch`
- `mcd.validateChatDispatch`
- Plus internal lifecycle commands used by the panel and server controller:
  - `mcd.startServer`
  - `mcd.stopServer`
  - `mcd.generateAdaptersForDetectedIde`

### 4.2 Agent Controls panel (IDE sidebar)

Current panel structure is command- and operations-focused:

- Section `Command Flow`
  - `/evaluate`, `/contract`, `/execute`, `/closeout`
- Section `Server Management`
  - Start server
  - Stop server
- Section `Utilities`
  - `/help`
  - `/remember`

Panel actions are routed through webview postMessage handlers and then into extension-host dispatch logic. Command click behavior records phase intent to memory (best-effort) and then attempts chat prefill/dispatch with fallback paths.

### 4.3 Cross-IDE chat dispatch subsystem

Provider detection:

- `vscode`
- `cursor`
- `windsurf`
- `antigravity`
- `generic`

Dispatch strategy:

1. Determine provider from `vscode.env.appName`.
2. Resolve command candidates from:
   - optional user overrides (`amphion.chatDispatch.*Commands`)
   - provider defaults
   - regex-based discovered commands present in host IDE
3. Attempt prefill-capable commands first (`workbench.action.chat.open`, `chat.open`, etc.) with multiple payload shapes.
4. Fallback to open/focus command + `type` command injection after configurable delay.
5. If all dispatch attempts fail, copy command text to clipboard and warn.

Operational diagnostics:

- `mcd.diagnoseChatDispatch`: emits structured JSON report
- `mcd.validateChatDispatch`: local self-test harness for plan logic

Known limitation tracked as technical debt:

- AMV2-007 remains open for residual panel-button behavior variance in Windsurf/Antigravity while slash commands still function directly in chat.

### 4.4 Scaffold and onboarding capabilities

Scaffold writes and initializes:

- `.amphion/` control plane (guardrails, playbook, MCD command docs)
- runtime config in both:
  - `.amphion/config.json`
  - `ops/amphion.json` (compat mirror)
- local command deck runtime under `.amphion/command-deck`
- optional adapter artifacts for detected IDE targets

Onboarding supports multiple document paths:

- Guided foundation-based flow -> writes foundation JSON and board artifacts for charter/PRD
- Manual prompt-based flow -> writes board artifacts for charter/PRD
- Source docs path -> writes charter/PRD stubs and handoff prompts

### 4.5 IDE adapter generation

Detected/targeted IDE surfaces:

- AGENTS-style instruction files (`AGENTS.md` + `.agents/workflows/*`)
- Cursor (`.cursor/rules/*.mdc`, `.cursor/commands/*.md`, `.cursorrules`)
- Windsurf (`.windsurf/workflows/*.md`)
- Claude/Cline (`CLAUDE.md`, `.clinerules`)

Adapter content enforces board-first contract semantics and halt-and-prompt behavior.

### 4.6 Server lifecycle control

Server startup behavior:

- Reads configured port from runtime config
- Verifies existing listener by calling `/api/health`
- Refuses non-canonical runtime occupancy on configured port
- Starts managed Python process (`python3 server.py --port <port>`)
- Waits for canonical runtime fingerprint before reporting success
- Flushes queued board artifacts after runtime availability

Server stop behavior:

- Stops managed process if tracked
- Differentiates unmanaged canonical/non-canonical listeners
- Does not falsely claim shutdown when unmanaged runtime remains

### 4.7 Command Deck web app capabilities

View surfaces:

- Kanban board
- Project dashboard
- Charts Library
- MCD Guide

Core board capabilities:

- Multi-board state model (single active board in this workspace)
- Lists/columns with order
- Milestones with code/title handling and archive/restore lifecycle
- Card CRUD, list movement, milestone binding enforcement
- Priority/owner/targetDate metadata
- Milestone filter + search

Dashboard capabilities:

- Burn-down/status view
- blocker summary
- domain metrics area
- doc library modal buttons (charter/prd/guardrails/contract)
- git traceability feed (`/api/git/log`)

Charts capabilities:

- Mermaid chart storage and rendering
- canonicalized Mermaid markdown validation
- built-in pan/zoom controls in preview

Guide capabilities:

- DB-canonical playbook retrieval and rendering

### 4.8 API and data model capabilities

Primary API groups:

- Runtime and state:
  - `GET /api/health`
  - `GET /api/state`
  - `GET /api/state/version`
- Boards/lists/milestones/cards/charts CRUD
- Milestone artifacts (findings/outcomes): immutable revisions via `POST`
- Board artifacts (charter/prd/guardrails/playbook): revisioned via `POST`
- Docs rendering endpoint family (`/api/docs/*`)
- Memory API:
  - `POST /api/memory/events`
  - `GET /api/memory/state`
  - `GET /api/memory/query`
  - `POST /api/memory/compact`
  - export disabled in DB-only mode
- Migration endpoints:
  - status + run for legacy `state.json` migration

Data model highlights:

- SQLite tables for all canonical state domains
- explicit artifact tables separate from cards/milestones
- revisioned immutable artifact behavior for milestone artifacts
- `memory_events` append log + `memory_objects` LWW materialized state

### 4.9 Automated lifecycle effects and safety mechanisms

- Preflight milestone write-closure once all preflight cards reach completion buckets.
- Auto-append findings artifact when EVAL cards transition to completion lists.
- Auto-append outcomes artifact when milestone is archived (closeout path).
- Artifact type checks and body length bounds.
- Milestone metadata (`metaContract`, `goals`, `nonGoals`, `risks`) stored and served.
- Startup repairs:
  - foundational doc newline normalization
  - playbook canonical repair
  - milestone code backfill
  - legacy chart canonicalization

### 4.10 Packaging and distribution controls

- Packaging script uses `vsce`.
- `.vscodeignore` excludes `.env`, `.amphion`, ops runtime data, archives, VSIX binaries, cache files, and IDE-specific working artifacts.
- publish-hygiene script blocks staging of forbidden operational artifacts (`.amphion/command-deck/data/`, memory projection files, generated archives, etc.).
- OpenVSX manual-upload policy is embedded in closeout command guidance.

## 5) MCD reinforcement map (mechanisms -> methodology)

### Evaluate

Method requirement:

- Research and scope only, no implementation.
- Findings must be canonical DB artifact.

Enforcement and reinforcement:

- Canonical command docs specify DB findings requirement.
- Runtime supports milestone findings artifacts with revisions.
- Evaluation card completion can auto-materialize findings artifact.

### Contract

Method requirement:

- Board-first contract authority.
- Milestone-bound cards with acceptance + AFP scope.
- Halt before execute until explicit approval.

Enforcement and reinforcement:

- Canonical `/contract` docs define board-authored authority and blocked behavior.
- Runtime requires `milestoneId` for new cards.
- Milestone metadata fields persist macro-contract terms.
- `/api/docs/contract` renders current board milestone + card authority for UI consumption.

### Execute

Method requirement:

- Build only approved contract scope.
- Verify and document outcomes.

Enforcement and reinforcement:

- Execute docs restrict AFP deviation.
- Runtime milestone and card structures preserve traceable scope linkage.
- Evidence recorded in milestone artifacts and memory events.

### Closeout

Method requirement:

- Verify, archive, and record outcomes.

Enforcement and reinforcement:

- Deleting (archiving) milestone triggers outcomes artifact revision append.
- Closeout docs require memory checkpoint verification and `closeout:` commit pattern when in scope.

### Remember (utility)

Method requirement:

- Utility-only checkpoint, no phase transition.

Enforcement and reinforcement:

- Dedicated command docs for `/remember`.
- Memory API validates sourceType/eventType and tracks attested events.
- Materialized state query endpoints allow deterministic recall.

## 6) Canonical docs currently in DB (workspace authority)

These are the current latest board artifact bodies in `.amphion/command-deck/data/amphion.db` for the active board.

### 6.1 Project Charter (revision 3)

Title: `Project Charter · AmphionAgentv2 (Local Override)`

```markdown
# Project Charter — AmphionAgent

Codename: `BlackClaw`
Version: `v0.01a`
Date: `202602211747`

---

## Overview
This document establishes the foundational intent, scope, and boundaries of the **AmphionAgent** project.

---

## Target Users

**Primary**: Solo operators — product managers, technical founders, designers, and domain experts — who build software with AI coding agents (e.g., Claude Code, Cursor, Windsurf, GitHub Codex) but who lack a formal governance layer to prevent scope drift, hallucination accumulation, and untraceable decision histories.

**Secondary**: Professional software engineers who adopt AI-assisted workflows and want deterministic, auditable development cycles with clean git histories and explicit scope boundaries for every delivered feature.

---

## Problem Statement

Solo operators building with AI agents move extraordinarily fast — but without structure, that speed becomes a liability. AI agents generate code in seconds, which means scope drifts at machine speed. Changes compound without authorization. There is no audit trail explaining why the system was built a particular way. When something breaks, there is no contract to reference, no checkpoint to roll back to, and no record of what was deliberately chosen versus improvised.

The result is fragile, undocumented software with no decision provenance — produced faster than any previous generation of tools, but just as ungovernable.

---

## Core Value Proposition

AmphionAgent operationalizes the **Micro-Contract Development (MCD) methodology** — a deterministic, contract-governed engineering framework that forces a deliberate pause before every code change, produces written authorization for every piece of work, and creates a traceable project history as a natural byproduct of the development process.

The core distinction: MCD's governance overhead is handled collaboratively between the operator and the AI agent. The agent drafts contracts and evaluation findings. The operator directs, refines, and authorizes. The constraint is on scope — not on craft. The result is that practitioners move fast *and* in the right direction, with zero rollbacks attributable to scope drift and zero defects attributable to uncontracted changes.

---

## Hard Non-Goals

- **No cloud services**: The Command Deck and all operational infrastructure run entirely on the local machine. No accounts, no subscriptions, no network calls to external services.
- **No package manager runtime dependencies**: The Command Deck backend (Python or Node.js) uses only the standard library at runtime. No `pip install`, no `npm install` required.
- **No enforcement beyond text-based contracts**: MCD does not programmatically block code changes. Governance is a discipline enforced by the operator and agent operating within the guardrails — not a technical lock-out system.
- **No multi-user or team workflows**: v0.01a targets the solo operator. Collaborative multi-user governance is explicitly out of scope for this version.
- **No modification of existing files on scaffold**: The MCD Starter Kit scaffold is purely additive. It does not overwrite or modify existing project files under any circumstance.

---

## Operating Constraints
- All development follows the MCD (Micro-Contract Development) methodology
- Every code change must be authorized by an approved contract card in the active milestone
- No contracted work begins without operator approval of the contract
- All versions are closed with a git commit using the format: `closeout: {VERSION} {description}`
- Architecture diagrams must use Mermaid.js syntax
- Document naming convention: `YYYYMMDDHHMM-DOCUMENT_TITLE.md`

---

*Generated by MCD Starter Kit · 202602211747 · Source documents: mcd-starter-kit-dev*
```

### 6.2 High-Level PRD (revision 3)

Title: `High-Level PRD · AmphionAgentv2 (Local Override)`

```markdown
# High-Level PRD — AmphionAgent

Codename: `BlackClaw`
Version: `v0.01a`
Date: `202602211747`

---

## Background

**Target Users**: Solo operators and AI-assisted developers who build software using Agentic IDEs (Claude Code, Cursor, Windsurf, GitHub Codex) and need a deterministic, contract-governed development framework to eliminate scope drift, maintain decision traceability, and produce audit-ready project histories.

**Problem**: AI coding agents generate code at extraordinary speed, but without a governance layer, that speed produces fragile, undocumented, and ungovernable software. Scope drifts silently. Decisions are improvised rather than authorized. Git histories become opaque. When something breaks, there is no contract to trace the change back to and no checkpoint to safely roll back to.

---

## Version v0.01a Feature Set

- **MCD Project Scaffold** — A single VS Code command (`MCD: Initialize New Project`) initializes a complete, governance-ready workspace via a 5-prompt wizard (Project Name, Server Language, Codename, Initial Version, Command Deck Port). Works on both empty folders and existing projects.
- **GUARDRAILS.md Generation** — Auto-generated governance guardrails document, dynamically interpolated with project name and codename, establishing the non-negotiable rules for every MCD-governed project.
- **MCD_PLAYBOOK.md** — Static, embedded copy of the complete MCD operating manual, available from every project scaffold and rendered inside the Command Deck.
- **Charter / PRD Wizard** — Post-scaffold opt-in wizard that collects 6 data points (Target Users, Problem Statement, Core Value, Non-Goals, Key Features, Success Metric) and writes timestamped `PROJECT_CHARTER.md` and `HIGH_LEVEL_PRD.md` stubs or fully populated documents.
- **Source Documents Path (v1.3)** — Before the manual wizard, the operator may import existing background documents into `helperContext/`. The extension writes stub Charter/PRD files with `[AI_DERIVE]` markers pointing to the imported sources so an in-workspace AI agent can complete them.
- **Command Deck — Kanban Board** — A fully local, zero-dependency Kanban board (Python or Node.js backend, Vanilla JS/HTML/CSS frontend) for tracking work across MCD lifecycle columns (Backlog, In Progress, Blocked, Review, Done), with milestone management, priorities, due dates, and filtering.
- **Command Deck — Dashboard** — Real-time project telemetry: active phase indicator, milestone burn-down progress bars, live blockers feed, one-click governance document rendering (charter, PRD, guardrails, active contract) with Mermaid diagram support, and a live git commit traceability feed (last 8 commits).
- **Command Deck — MCD Guide** — In-app fully rendered view of `MCD_PLAYBOOK.md`, with a "Why MCD?" modal explaining the core philosophy. Methodology documentation lives inside the tool.
- **Dual Server Runtime** — Command Deck runs on either Python 3 (stdlib only) or Node.js (stdlib only). Operator selects at scaffold time. Both expose an identical API surface. No external packages required at runtime.
- **Git Integration** — Automatic `git init` on new projects; branch-safety prompt (`mcd/init` branch option) on existing repositories. Scaffold commit and Charter/PRD commit follow the deterministic format: `chore(init): {CODENAME} scaffold - establish guardrails + command deck`.
- **Conflict Detection** — Before writing any files, the extension checks for existing `referenceDocs/` and `ops/launch-command-deck/` directories and surfaces a modal warning with Continue/Abort options. Scaffold is purely additive — no existing files are modified.
- **Persistent View State** — Command Deck remembers the last active view (Board, Dashboard, MCD Guide) via `localStorage`, rendered on first paint with zero visual flash.

---

## Success Metric

A solo operator with no prior MCD experience can go from an empty folder (or existing codebase) to a fully governed, operationally visible MCD project environment — with GUARDRAILS, Playbook, Kanban board, project dashboard, and initial git commit — **in under 60 seconds**, with zero external dependencies installed beyond a single chosen server runtime (Python 3 or Node.js).

Secondary metric: every contract executed under MCD governance should cause no rollbacks attributable to scope drift and zero uncontracted changes in the git history.

---

## MCD Milestone Structure

| Milestone | Focus |
|---|---|
| M1 | Evaluate + Scope |
| M2 | Contract + Plan |
| M3 | Build + Verify |
| M4 | Release Readiness |

---

## Constraints
- All features are subject to contract approval before implementation
- Architecture diagrams must use Mermaid.js syntax
- No cloud dependencies or runtime package managers
- Command Deck frontend: Vanilla JS / HTML / CSS only — no build tools, no frameworks
- TypeScript must compile with zero errors before any `.vsix` is packaged

---

*Generated by MCD Starter Kit · 202602211747 · Source documents: mcd-starter-kit-dev*
```

### 6.3 Governance Guardrails (revision 3)

Title: `Governance Guardrails · AmphionAgentv2 (Local Override)`

```markdown
# Amphion Project - Governance Guardrails

Codename: `BLACKCLAW`
Initial Version: `0.1.0`

## Execution Model
All work follows this strict sequence:
1. Evaluate
2. Contract
3. Execute
4. Closeout

No phase skipping is permitted.

## Phase Rules
### 1) Evaluate
- Define objective, scope, constraints, and assumptions.
- Do not produce implementation code in this phase.
- Findings are canonical only when written as milestone artifacts in DB.

### 2) Contract
- Contract authority is board-native and DB-canonical.
- Contracts must be milestone-bound card sets with acceptance criteria and AFP scope.
- Chat summaries are informational only and never replace board contracts.
- If board/API runtime is unavailable, contract phase halts as blocked.

### 3) Execute
- Implement only what approved board contract cards authorize.
- Keep versioning and build naming deterministic.
- Record meaningful outcomes in DB artifacts.

## Utility Commands
### `/remember` (Utility-Only)
- `/remember` writes compact operational memory through `/api/memory/*`.
- `/remember` must not auto-advance lifecycle or execute code changes.

## Agent Memory Policy
- Canonical memory authority: SQLite (`.amphion/command-deck/data/amphion.db`) via `/api/memory/*`.
- Canonical write boundary: API-mediated writes only.
- Memory model: append-only event log + deterministic LWW materialized state + bounded compaction.

## Closeout Procedure
A version is not closed until:
1. Contract cards in scope are executed/reviewed.
2. Compliance checklist passes.
3. Outcomes artifact exists in milestone artifacts.
4. Required source/runtime artifacts are staged.
5. `closeout:` commit is completed when in scope.

## Commit Message Format
```
closeout: {VERSION} {brief description}
```

## Document Naming Convention
Project documents use:
```
YYYYMMDDHHMM-[DOCUMENT_TITLE].md
```
Exception: `GUARDRAILS.md` keeps stable basename.

## Documentation Standards
- Architecture diagrams and flowcharts use `Mermaid.js`.

## Change Safety
- Core modifications require referenced active board contract cards.
- Uncontracted work is deferred until contract approval.
- Unexpected repository changes are surfaced before continuing.

## Compliance Checklist
- [ ] Current phase is explicit.
- [ ] Approved board contract cards exist for core-file changes.
- [ ] Work matches approved board contract scope.
- [ ] Naming/versioning remains deterministic.
- [ ] Conflicts with active contracts have been flagged.
- [ ] Agent memory updated and validated via `/api/memory/*`.
- [ ] Outcomes artifact exists for closed milestone/version.
- [ ] Git commit completed with all artifacts staged (when closing a version).
```

## 7) Delivery success record (solo-operator AI-assisted build)

### 7.1 Governance and throughput evidence

From current DB state:

- Total milestones: 10
- Archived milestones: 7
- Total cards: 50
- Milestone artifacts: 16
  - findings: 8 revisions
  - outcomes: 8 revisions
- Milestones with outcomes artifacts: 7
- Milestones with findings artifacts: 6

Interpretation:

- There is repeated evidence of full Evaluate -> Contract -> Execute -> Closeout cycling, not one-off execution.
- Outcomes artifacts are present for each archived milestone in this dataset, supporting closure traceability.

### 7.2 Release and distribution evidence

Release chronology from local changelog shows continuous hardening from `1.24.4` through `1.50.6` between 2026-02-22 and 2026-02-27.

Local packaging artifacts present:

- `amphion-agent-1.50.2.vsix`
- `amphion-agent-1.50.3.vsix`
- `amphion-agent-1.50.4.vsix`
- `amphion-agent-1.50.5.vsix`
- `amphion-agent-1.50.6.vsix`
- verify builds for `1.50.6`

Remote git targets configured:

- `origin`: `https://github.com/activetwist/amphion-agent.git`
- `extension`: `https://github.com/activetwist/amphion-agent-extension.git`

Marketplace evidence confirms public distribution at `1.50.6` in both VS Marketplace and OpenVSX.

### 7.3 Solo-operator signal

- Local `git shortlog -sn --all` shows one contributor (`Stanton Brooks`).
- Commit history indicates rapid iterative slices with release and closeout cadence aligned to MCD controls.

### 7.4 Enterprise-readiness posture (evidence-based)

Strengths:

- Deterministic local runtime with explicit fingerprint validation.
- Board-first contract authority with milestone binding requirements.
- Revisioned immutable milestone artifacts (`findings`, `outcomes`).
- DB-backed memory with attested source types and compaction controls.
- Startup repair paths for malformed docs, chart canonicalization, and migration.
- Packaging hygiene controls to prevent sensitive/runtime data leakage.

Open risks/debt:

- Cross-IDE panel-button dispatch parity still variable in Windsurf/Antigravity (tracked as AMV2-007).
- Some public-facing text (for example README sections) still references legacy paths (`referenceDocs`, `ops/launch-command-deck`) and needs editorial harmonization to current `.amphion` canonical architecture.
- Marketplace metrics are mutable and should always be timestamped in external publications.

## 8) Claim-safety ledger

| Claim Area | Status | Basis |
|---|---|---|
| Extension version is 1.50.6 | Verified | `package.json`, marketplace responses |
| Runtime is Python + SQLite canonical | Verified | `/api/health` fingerprint |
| Board/milestone/card state counts in this dossier | Verified | direct SQLite queries + `/api/state` |
| Board-first contract semantics are enforced in docs/templates/runtime behavior | Verified | `.amphion/control-plane/mcd/*.md`, template generators, milestone/card API behavior |
| Cross-IDE panel dispatch is uniformly reliable across all listed IDEs | Not fully verified | Code supports multiple providers; AMV2-007 tracks residual issues in Windsurf/Antigravity |
| Solo operator delivery | Verified (local repo evidence) | `git shortlog -sn --all` single contributor |
| "Enterprise-ready" as a universal guarantee | Inferred | This dossier presents readiness controls; certification/compliance evidence is outside current scope |

## 9) API taxonomy appendix

### Runtime and state

- `GET /api/health`
- `GET /api/state`
- `GET /api/state/version`

### Docs and artifacts

- `GET /api/docs/{charter|prd|guardrails|playbook|contract}`
- `GET /api/boards/{boardId}/artifacts`
- `GET /api/boards/{boardId}/artifacts/latest?artifactType=...`
- `POST /api/boards/{boardId}/artifacts`
- `GET /api/milestones/{milestoneId}/artifacts`
- `GET /api/milestones/{milestoneId}/artifacts/latest?artifactType=...`
- `POST /api/milestones/{milestoneId}/artifacts`

### Memory

- `POST /api/memory/events`
- `GET /api/memory/state`
- `GET /api/memory/query`
- `POST /api/memory/compact`
- `POST /api/memory/export` -> intentionally disabled (gone) in DB-only mode

### Board operations

- `POST /api/boards`
- `PATCH /api/boards/{boardId}`
- `DELETE /api/boards/{boardId}`
- `POST /api/boards/{boardId}/activate`

### List operations

- `POST /api/lists`
- `PATCH /api/lists/{listId}`
- `DELETE /api/lists/{listId}`

### Milestone operations

- `POST /api/milestones`
- `PATCH /api/milestones/{milestoneId}`
- `DELETE /api/milestones/{milestoneId}` (archive closeout behavior)
- `POST /api/milestones/{milestoneId}/restore`

### Card operations

- `POST /api/cards`
- `PATCH /api/cards/{cardId}`
- `DELETE /api/cards/{cardId}`
- `POST /api/cards/{cardId}/move`

### Chart operations

- `POST /api/charts`
- `PATCH /api/charts/{chartId}`
- `DELETE /api/charts/{chartId}`

### Migration and utility

- `GET /api/git/log`
- `GET /api/migration/legacy-state-json/status`
- `POST /api/migration/legacy-state-json/run`
- `POST /api/reload`

## 10) Sources and traceability index

### Primary source files

- `package.json`
- `src/extension.ts`
- `src/commandDeckDashboard.ts`
- `src/agentControlsSidebar.ts`
- `src/chatDispatch.ts`
- `src/chatDispatchPlan.ts`
- `src/serverController.ts`
- `src/scaffolder.ts`
- `src/onboardingWebview.ts`
- `src/charterWizard.ts`
- `src/environment.ts`
- `src/memoryHooks.ts`
- `src/templates/commands.ts`
- `src/templates/guardrails.ts`
- `src/templates/playbook.ts`
- `src/templates/adapters.ts`

### Runtime and web app

- `.amphion/command-deck/server.py`
- `.amphion/command-deck/public/index.html`
- `.amphion/command-deck/public/app.js`
- `.amphion/command-deck/public/styles.css`
- `.amphion/command-deck/scripts/init_command_deck.py`
- `.amphion/command-deck/scripts/check_publish_hygiene.sh`
- `.amphion/command-deck/README.md`

### Canonical policy docs

- `.amphion/control-plane/GUARDRAILS.md`
- `.amphion/control-plane/MCD_PLAYBOOK.md`
- `.amphion/control-plane/mcd/EVALUATE.md`
- `.amphion/control-plane/mcd/BOARD.md`
- `.amphion/control-plane/mcd/CONTRACT.md`
- `.amphion/control-plane/mcd/EXECUTE.md`
- `.amphion/control-plane/mcd/CLOSEOUT.md`
- `.amphion/control-plane/mcd/REMEMBER.md`

### Local data and release records

- `.amphion/command-deck/data/amphion.db`
- `CHANGELOG.md`
- `README.md`
- `git log --oneline`
- `git shortlog -sn --all`
- Local `.vsix` artifacts in workspace root

### External metadata queried (snapshot date 2026-02-27 UTC)

- OpenVSX API: `https://open-vsx.org/api/active-twist/amphion-agent/latest`
- VS Marketplace gallery query endpoint for `active-twist.amphion-agent`

## 11) Notes for eBook production use

Use this dossier as canonical source material for:

- Product chapter: system capabilities and architecture.
- Method chapter: direct mechanism-level reinforcement of MCD.
- Case-study chapter: solo-operator, AI-assisted delivery system.
- Governance chapter: local-only, DB-canonical authority design.

If this content is quoted externally, preserve timestamped caveats for mutable metrics (marketplace stats, active board counts).
