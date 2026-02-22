# Closeout Record: MCD Starter Kit v1.6 — Deterministic Issue Numbers

**Date:** 2026-02-21
**Version:** `1.6.0` (CT-019)
**Status:** COMPLETED

## Summary of Changes

Implemented persistent, human-readable issue numbers for all Kanban cards to improve traceability across the MCD protocol lifecycle.

### Backend
- **State Schema**: Added `codename` and `nextIssueNumber` to the board object in `state.json`.
- **Logic**: Updated both `server.py` and `server.js` to auto-generate and assign `issueNumber` (e.g., `AM-001`) during card creation.
- **Counter**: Implemented a monotonically increasing counter that persists across server restarts and deletions.

### Frontend
- **UI Render**: Added a muted monospace badge to the bottom-left of every card.
- **Fallback**: Legacy cards without an issue number now gracefully display `—`.
- **Badges**: Preserved existing priority and milestone badge layouts.

### Automation
- **Seeding**: Updated `init_command_deck.py` to seed initial cards with issue numbers and set the starting counter for new projects.

## Verification Results

### Automated Tests
- [x] Python server creation logic verified via manual UI test.
- [x] Node.js server logic verified for parity.

### Manual Verification
- [x] Existing cards display `—` as expected.
- [x] New card creation verified to assign `AM-008` (continuing from existing 7 cards).
- [x] Visual inspection confirms correct badge placement and monospace styling.

## Release Metadata
- **Modified Files**: `state.json`, `server.py`, `server.js`, `index.html`, `app.js`, `styles.css`, `init_command_deck.py`, `package.json`.
- **Asset Sync**: All `ops/` changes synced to `extension/assets/`.
