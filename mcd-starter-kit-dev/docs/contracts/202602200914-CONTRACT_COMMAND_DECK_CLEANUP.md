# Contract: v0.02a Command Deck Cleanup

Contract ID: `CT-20260220-OPS-001`
Date: `2026-02-20`
Project: `Content Monetization` (`Stacks`)
Version: `v0.02a`
Phase: `Contract → Execute`

## Objective
Remove the SFX design lab module from the Command Deck (carried over from a different project) and update the board state to reflect actual v0.01a completion status. Close out v0.02a upon completion.

## Authorized File Changes

### 1. `ops/launch-command-deck/server.py` — SFX Removal

Remove all SFX-related code while preserving the Kanban core:

| Lines (approx.) | Content to Remove |
|---|---|
| L28-30 | `SFX_DIR`, `SFX_PRESETS_FILE`, `SFX_PACKAGES_DIR` path constants |
| L32-42 | `SFX_GROUP_ORDER`, `SFX_STATUS_ORDER` constants |
| L44-617 | Entire `SFX_BLUEPRINT` list (574 lines) |
| L619-621 | `SFX_KEYS` validation block |
| L623-638 | `DEFAULT_SFX_PRESET` constant |
| L640 | `SFX_LOCK` threading lock |
| L659-662 | `default_sfx_preset()` function |
| L665-688 | `_sfx_store_default()`, `_ensure_sfx_store()` functions |
| L700-758 | `_ordered_sfx_groups()`, `get_sfx_catalog_payload()` functions |
| L761-817 | `save_sfx_preset()`, `build_sfx_package()` functions |
| L1175-1176 | `/api/sfx/catalog` GET route handler |
| L1364-1380+ | `/api/sfx/preset` POST route handler, `/api/sfx/package` POST route handler |

Also remove: `import copy` if no longer used after SFX removal.

Preserve: all Kanban-related code (board CRUD, card CRUD, milestone tracking, JSON import/export, static file serving).

### 2. `ops/launch-command-deck/public/sfx-lab.html` — DELETE

Remove entire file.

### 3. `ops/launch-command-deck/public/sfx-lab.js` — DELETE

Remove entire file.

### 4. `ops/launch-command-deck/data/state.json` — Board Update

Update the board to reflect actual project status:

| Card | Current List | Target List | Notes |
|---|---|---|---|
| `v0.01a - Scaffold Baseline` | In Progress | **Done** | Scaffold validated, GUARDRAILS created, deck reachable |
| `v0.01a - Project Charter + PRD Baseline` | Backlog | **Done** | Charter + PRD reframed per CT-002, scope boundaries explicit |
| `v0.01a - First Contract + Execute Slice` | Backlog | **Done** | CT-001, CT-002, GOV-001 all executed end-to-end |

Add new card:

| Title | List | Priority | Description | Acceptance |
|---|---|---|---|---|
| `v0.02a - Command Deck Cleanup` | In Progress | P0 | Remove SFX lab module and update board state | SFX code removed, board reflects reality, deck runs clean |

### 5. `ops/launch-command-deck/README.md` — Update

Remove any references to SFX lab functionality. Keep Kanban documentation only.

## Acceptance Criteria

1. `server.py` contains zero SFX references — only Kanban functionality remains
2. `sfx-lab.html` and `sfx-lab.js` are deleted
3. All three v0.01a seed cards are in the Done column
4. v0.02a cleanup card exists on the board
5. Command Deck server starts and serves the Kanban UI without errors
6. No unused imports remain in `server.py`
7. README reflects Kanban-only functionality

## Execution Notes
- This is an infrastructure hygiene contract — no strategy or content changes
- The SFX module is ~790 lines; removal will reduce `server.py` from ~1,614 to ~824 lines
- After v0.02a closeout, v0.03a will begin the content production pipeline work
