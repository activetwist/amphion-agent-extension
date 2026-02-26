# Changelog

All notable changes to this extension are documented in this file.

## [Unreleased]

_No changes yet._

## [1.50.3] - 2026-02-26

### Fixed
- Updated Amphion Agent Controls panel density: removed redundant Documents block, removed subtitle, tightened section spacing, and stacked command helper text on a second line.
- Corrected foundational board artifact seeding so charter/prd/guardrails use real markdown newlines instead of literal `\\n` escape text.
- Added startup auto-repair that appends normalized revisions for malformed foundational board artifacts (`charter`, `prd`, `guardrails`) with escaped newlines.
- Synced canonical runtime and packaged launch-command-deck assets to maintain deterministic parity.

## [1.50.2] - 2026-02-26

### Changed
- Enforced board-first `/contract` semantics across canonical governance and generated adapter/rule templates.
- Updated canonical Evaluate/Contract/Closeout wording to DB-canonical artifact outputs and milestone-bound authority.
- Removed legacy compatibility-export guidance from generated workflow adapters to reduce policy drift.

### Fixed
- Switched `/api/docs/contract` to DB-canonical milestone/card rendering instead of flat-file contract fallbacks.
- Updated runtime-seeded playbook content and scaffold scripts to remove legacy flat-file findings language.
- Hardened clean-room scaffold validation defaults for v2 baseline (`.amphion` control-plane/runtime authority).

## [1.50.0] - 2026-02-26

### Changed
- Bumped release line to `1.50.0` to maintain semantic-version upgrade continuity over prior `1.28.x` marketplace releases.
- Consolidated server lifecycle launch paths under managed `ServerController` startup APIs for deterministic Start/Stop behavior across onboarding and panel controls.

### Fixed
- Corrected DB-canonical playbook seeding to ship full MCD Playbook markdown with proper newlines.
- Added startup repair migration to append corrected playbook artifact revisions for boards that still contain legacy stub/escaped playbook content.
- Hardened onboarding artifact persistence with queued DB write fallback (`pending-artifacts.jsonl`) and automatic flush when the runtime becomes reachable.

## [1.29.0] - 2026-02-25

### Added
- Added sidebar-native **Amphion Agent Controls** via a dedicated Activity Bar container and webview view provider.
- Added extension-host `ServerController` process management for deterministic Command Deck server lifecycle control.

### Fixed
- Enforced strict Mermaid chart write contract on chart APIs: raw Mermaid-starting payloads are canonicalized to fenced Mermaid, non-Mermaid payloads are rejected with `422`, and legacy raw Mermaid rows are canonicalized on startup.
- Added pre-flight milestone write-closure enforcement: once pre-flight cards are completed, API rejects new card assignment/reassignment into that milestone while still allowing deletion.

### Changed
- Updated `mcd.openDashboard` to reveal/focus sidebar Agent Controls instead of creating an editor-tab panel.
- Decoupled Start/Stop server controls from terminal `sendText` dependency and routed them through managed process APIs on the configured `ops/amphion.json` port.
- Adjusted Charts Library Mermaid viewer zoom baseline to open at bird's-eye scale (`0.25`) with deeper zoom-out floor and reset aligned to that baseline.
- Milestone governance now requires new cards to bind to a milestone; UI guidance and selectors direct users to continue in active milestones or create new milestones.
- Added milestone delete controls and closed-state indicators in Command Deck milestone progress UI.
- Replaced milestone hard-delete behavior with archive/restore lifecycle, added Archives modal recovery, and blocked new card assignment into archived milestones.
- Refactored sidebar controls: board selector now shows title + short description, `+ Milestone` moved into Milestone panel, and Utilities now lives in a collapsed accordion without `Reload State`.
- Refined sidebar hierarchy and affordances: Milestone panel actions now render as equal-width full-span controls above the Milestone Progress heading; Boards moved to a chevron-based accordion list; Utilities accordion now shows explicit chevron state feedback.
- Boards accordion now defaults to collapsed and shows the active board name in the summary row for at-a-glance context when closed.

## [1.28.8] - 2026-02-25

### Fixed
- **Nomenclature Split (Surgical):** Enforced the intended naming boundary:
  - Browser Command Deck surfaces now read **Amphion Command Deck**.
  - IDE panel/dashboard surfaces remain **Amphion Agent Controls**.
- **Board Write Canonicalization:** Standardized board/card persistence guidance to SQLite/API-backed writes (runtime canonical path), preventing invisible-card regressions caused by direct `state.json` edits.
- **Chart API Write Path:** Added missing chart write endpoints in SQLite runtime copies:
  - `POST /api/charts`
  - `PATCH /api/charts/:id`
- **Chart State Visibility:** Confirmed chart mutations return fresh snapshots so `/api/state` reflects chart create/update operations without restart.

## [1.28.7] - 2026-02-24

### Fixed
- **Synchronized Assets Regression**: Fixed a critical issue where the extension's internal assets were outdated, causing environment updates to roll back UI and branding improvements. The "Command Deck" is now correctly branded as **Amphion Agent Controls**.
- **Mermaid Rendering**: Implemented a custom `marked` renderer to ensure Mermaid diagrams are consistently rendered in the Charts Library.
- **Unified Branding**: Restored the logo, favicon, and dropdown navigation refinements to the Command Deck distribution.

## [1.28.6] - 2026-02-24

### Changed
- Rebranded IDE Dashboard to "Amphion Agent Controls" to establish a functional distinction between the IDE command interface and the browser-based collaboration platform ("Amphion Command Deck").
- Updated panel titles, HTML titles, and primary headers within the VS Code UI.

## [1.28.5] - 2026-02-24

### Changed
- Finalized repository hygiene and polish across extension workspace and release documentation.
- Cemented IDE-facing identity as **Amphion Agent Controls** while preserving browser-facing **Amphion Command Deck** naming intent.
- Synchronized closeout records, memory state, and metadata for a stable internal freeze point.

## [1.28.4] - 2026-02-24

### Changed
- Refined IDE Command Deck dashboard UI for improved ergonomics.
- Renamed "DETAILS" section to "Documents" and moved its header out of the surface box.
- Left-aligned primary headings and reduced vertical spacing for a tighter, more professional layout.

## [1.28.3] - 2026-02-24

### Added
- Added a persistent global `Credits` info control in the Command Deck header (next to `New Board`).
- Added a hard-coded attribution modal containing credits for Active Twist and Stanton Brooks.
- Added styled CTA link buttons in the modal for:
  - `https://activetwist.com`
  - `https://www.linkedin.com/in/stantonbrooks/`

### Changed
- Backfilled release notes to capture the prior local UI/branding workstream completed before this slice, including:
  - Board-to-Kanban labeling updates and navigation refinement.
  - Header branding integration (application logo + favicon) and selector width standardization.
- Kept attribution independent of `MCD_PLAYBOOK.md` by rendering content directly from frontend markup.
- Synchronized attribution UI behavior across local runtime, command-deck source mirror, and extension bundled asset copies.

## [1.28.2] - 2026-02-24

### Fixed
- Resolved local regression where Mermaid charts failed to render in `ops/` directory.
- Fixed Javascript error when `#btnDeleteChart` was missing from the DOM.
- Corrected server start/stop logic to surgically target the specific configured port using `lsof`.

### Changed
- Optimized local Command Deck polling to 10-second intervals with focus-detection to reduce resource usage.
- Silenced high-frequency `/api/state/version` logs from the server console.

## [1.28.1] - 2026-02-24

### Added
- Integrated HTML Onboarding Wizard for seamless 18-step SIP-1 data capture.
- Automated generation of Project Charter, PRD, and Foundation artifacts.
- Environment update mechanism to prompt users for non-destructive local workspace upgrades.
- New screenshot set for Marketplace positioning (Kanban, Charts, IDE Controls).

### Changed
- Unified operational restyle for local Command Deck.
- Improved Guided Wizard completion parity with quick onboarding flow.

## [1.25.0] - 2026-02-22

### Added
- Added explicit Board command parity for Cursor command surfaces (`/board`).
- Added light/dark theme toggle restoration and dialog issue number display in Command Deck copies.

### Changed
- Improved light mode WCAG AA contrast tokens for badges and action buttons.
- Updated command routing and workflow alignment across scaffolded artifacts.

## [1.24.4] - 2026-02-22

### Added
- Test packaging cut for cross-IDE validation build.
