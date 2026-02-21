# Contract: v0.02a Command Deck Remediation

Contract ID: `CT-20260220-OPS-002`
Date: `2026-02-20`
Project: `Content Monetization` (`Stacks`)
Phase: `Contract → Execute`

## Objective
Remediate three items missed during the v0.02a closeout: remove the SFX Lab button from the front-end UI, move the v0.02a cleanup card to Done, and correct the milestone state to reflect v0.03a readiness.

## Authorized File Changes

### 1. `ops/launch-command-deck/public/index.html`

| Change | Description |
|---|---|
| **Remove SFX Lab button** | Delete `<button id="btnOpenSfxLab" class="btn">Open SFX Lab</button>` (L33) |

### 2. `ops/launch-command-deck/public/app.js`

| Change | Description |
|---|---|
| **Remove SFX Lab DOM reference** | Delete `btnOpenSfxLab: document.querySelector("#btnOpenSfxLab")` (L22) |
| **Remove SFX Lab click handler** | Delete the event listener block opening `/sfx-lab.html` (L512-513) |

### 3. `ops/launch-command-deck/data/state.json`

| Change | Description |
|---|---|
| **Move v0.02a card to Done** | Change `card_v02a_cleanup` listId from `list_f0c6e85607` (In Progress) to `list_a05514f520` (Done) |
| **Add v0.03a milestone** | Add milestone `v0.03a Content Production Pipeline` to signal readiness for next phase |

## Acceptance Criteria

1. No SFX references remain in `index.html` or `app.js`
2. The v0.02a cleanup card is in the Done column
3. A v0.03a milestone exists on the board
4. Command Deck loads without errors or dead buttons

## Execution Notes
- This is a remediation of items missed during the v0.02a closeout
- No server.py changes required
- Closes out immediately after execution with a git commit
