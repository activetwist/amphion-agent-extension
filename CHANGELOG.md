# Changelog

All notable changes to this extension are documented in this file.

## [1.28.3] - 2026-02-24

### Added
- Added a persistent global `Credits` info control in the Command Deck header (next to `New Board`).
- Added a hard-coded attribution modal containing credits for Active Twist and Stanton Brooks.
- Added styled CTA link buttons in the modal for:
  - `https://activetwist.com`
  - `https://www.linkedin.com/in/stantonbrooks/`
- Added root-level `.gitignore` and `.env` pattern for secure local secret management.

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
