# Contract: MCD Starter Kit v1.6 — Deterministic Issue Numbers on Cards

**Contract ID:** `CT-20260221-OPS-019`
**Version:** `1.6.0`
**Status:** `DRAFT`

## Objective

Add a persistent, human-readable issue number to every Kanban card to improve traceability and communication. Issue numbers follow the format `{PREFIX}-{NNN}` (e.g., `AM-001`), where `PREFIX` is derived from the board's codename and `NNN` is a monotonically increasing counter.

## Proposed Changes

### 1. State Schema (`state.json`)
- **Board Level**: Add `codename` (string) and `nextIssueNumber` (integer).
- **Card Level**: Add `issueNumber` (string, optional for legacy cards).

### 2. Backend Logic (`server.py` & `server.js`)
- Update `StateStore` to handle `nextIssueNumber`.
- Update card creation logic to auto-assign `issueNumber` using the prefix and padded counter.
- Ensure issue numbers are persistent even if cards are moved or updated.
- Handle `nextIssueNumber` incrementing and persistence.

### 3. Frontend Rendering (`app.js`, `styles.css`, `index.html`)
- **Render Badge**: Display `issueNumber` in the bottom-left of each card.
- **Styling**: Add a muted monospace badge style for the issue number.
- **Legacy Support**: Cards without an issue number should display `—`.

### 4. Initialization Logic (`init_command_deck.py`)
- Update seeder to accept `--codename`.
- Assign `AM-001`, `AM-002`, etc., to initial seed cards.
- Set `nextIssueNumber` to the next available integer.

## Acceptance Criteria

- [ ] New cards automatically receive a correctly formatted issue number (e.g., `AM-004`).
- [ ] Issue number badge is visible in the bottom-left of every card.
- [ ] Existing cards without an issue number display `—` without crashing.
- [ ] Priority badges (P0/P1/P2) remain in their current position and style.
- [ ] `nextIssueNumber` increments correctly and is never reused (even if cards are deleted).
- [ ] Cloned boards inherit the source board's `nextIssueNumber`.
- [ ] `package.json` version is updated to `1.6.0`.
- [ ] TypeScript compiles with zero errors.

## Authorized Files
- `ops/launch-command-deck/server.py`
- `ops/launch-command-deck/server.js`
- `ops/launch-command-deck/public/app.js`
- `ops/launch-command-deck/public/styles.css`
- `ops/launch-command-deck/scripts/init_command_deck.py`
- `mcd-starter-kit-dev/extension/assets/launch-command-deck/...` (sync copies)
- `mcd-starter-kit-dev/extension/package.json`
- `ops/launch-command-deck/data/state.json`
