# Contract: MCD Starter Kit v1.6 — Deterministic Issue Numbers on Cards

Contract ID: `CT-20260221-OPS-019`
Date: `2026-02-21`
Base Version: `1.5.0`
Target Version: `1.6.0`

---

## Objective

Add a persistent, human-readable issue number to every Kanban card in the Command Deck. Issue numbers follow a deterministic board-scoped sequential scheme with a codename prefix (e.g., `BC-001`). They are displayed in the bottom-left corner of each card as a muted monospace badge. The priority tags (P0/P1/P2) are preserved unchanged. This change spans the data model (`state.json` schema), both server backends (`server.py`, `server.js`), the frontend (`app.js`, `styles.css`, `index.html`), and the board initializer (`init_command_deck.py`).

---

## Numbering Scheme

| Property | Specification |
|---|---|
| Format | `{PREFIX}-{NNN}` |
| Prefix | First 2 uppercase characters of the board codename — derived from `state.json` board `name` field at card-creation time. Fallback: `IS` if codename cannot be inferred. |
| Counter | Zero-padded 3-digit integer (`001`, `002`, ... `999`, then `1000` with no padding truncation) |
| Persistence | `issueNumber: string` stored on each card record; `nextIssueNumber: number` stored on each board record |
| Assignment | Auto-assigned by server at card creation time. Never reassigned. Never reused after deletion. |
| Cloned boards | Counter and `issueNumber` values inherited from source board. Counter does not reset on clone. |
| Existing cards (backfill) | Existing cards with no `issueNumber` display `—` in the badge. No auto-backfill. |

---

## Authorized File Changes

| File | Action | Purpose |
|---|---|---|
| `ops/launch-command-deck/data/state.json` | **[MODIFY]** (schema) | Add `nextIssueNumber` to board records; add `issueNumber` to card records |
| `ops/launch-command-deck/server.py` | **[MODIFY]** | Auto-assign `issueNumber` on POST `/api/cards`; expose `nextIssueNumber` on board; handle clone inheritance |
| `ops/launch-command-deck/server.js` | **[MODIFY]** | Same as `server.py` — identical API surface |
| `ops/launch-command-deck/public/app.js` | **[MODIFY]** | Render `card.issueNumber` in bottom-left of card DOM via `createCardNode()` |
| `ops/launch-command-deck/public/styles.css` | **[MODIFY]** | Add `.issue-number` class — monospace, muted, small |
| `ops/launch-command-deck/public/index.html` | **[MODIFY]** | Add `<span class="issue-number"></span>` to card template markup |
| `ops/launch-command-deck/scripts/init_command_deck.py` | **[MODIFY]** | Initialize `nextIssueNumber: 1` on new boards; assign ordered issue numbers to seed cards |
| `package.json` | **[MODIFY]** | Bump version to `1.6.0` |
| `README.md` | **[MODIFY]** | Document issue number scheme and backfill behavior |

> **Note:** The Command Deck assets in `extension/assets/launch-command-deck/` are the bundled copy used by the packaged extension. The `ops/launch-command-deck/` directory is the live development instance. Both must be updated so the `.vsix` package reflects the change.

---

## Behavioral Specification

### Server — Card Creation (Python + Node.js)

On `POST /api/cards`:
1. Read `board.nextIssueNumber` (default to `1` if field not present — backward-compatible with existing boards)
2. Derive `prefix` from board name or codename: take the first word of the board name, uppercase, truncate to 2 characters. Example: "AmphionAgent Launch Command Deck" → `AM`.
3. Assign `card.issueNumber = prefix + "-" + String(nextIssueNumber).padStart(3, "0")`
4. Increment `board.nextIssueNumber` by 1
5. Persist and return card with `issueNumber` field

### Frontend — Card Template (index.html + app.js + styles.css)

**index.html template addition:**
```html
<div class="card-footer">
  <span class="issue-number"></span>
  <span class="owner"></span>
  <span class="target-date"></span>
</div>
```

**app.js `createCardNode()` addition:**
```javascript
const issueNum = node.querySelector('.issue-number');
issueNum.textContent = card.issueNumber || '—';
```

**styles.css `.issue-number` class:**
```css
.issue-number {
  font-family: var(--font-mono, monospace);
  font-size: 0.7rem;
  color: var(--text-muted);
  letter-spacing: 0.04em;
}
```

### Seed Card Initialization (init_command_deck.py)

When seeding with the `scaffold` template, assign issue numbers to seed cards sequentially in creation order:
- Scaffold Baseline → `{PREFIX}-001`
- Project Charter + PRD Baseline → `{PREFIX}-002`
- First Contract + Execute Slice → `{PREFIX}-003`
- Set `nextIssueNumber: 4` on the board record

### Backfill Behavior

Existing cards created before this version have no `issueNumber` field. The server must handle reads gracefully:
- If `card.issueNumber` is `undefined` or absent → frontend displays `—`
- No automatic backfill at server startup — card order would be indeterminate

---

## Acceptance Criteria

1. New cards created via the UI receive a correctly formatted `issueNumber` (e.g., `AM-004`)
2. `issueNumber` is visible in the bottom-left corner of each card on the board
3. Cards with no `issueNumber` (pre-migration) display `—` in the badge
4. Priority badge (P0/P1/P2) is unchanged in position, style, and behavior
5. `nextIssueNumber` increments correctly and is never reused after card deletion
6. Cloned boards inherit the source board's `nextIssueNumber` counter and card issue numbers
7. `init_command_deck.py` assigns `AM-001`, `AM-002`, `AM-003` to the three seed cards and sets `nextIssueNumber: 4`
8. Both `server.py` and `server.js` implement identical behavior
9. Both `ops/launch-command-deck/` and `extension/assets/launch-command-deck/` are updated
10. TypeScript compiles with zero errors (extension layer unaffected)
11. `package.json` version is `1.6.0`
