# Contract: MCD Starter Kit v1.7 — Server State Hot-Reload

Contract ID: `CT-20260221-OPS-020`
Date: `2026-02-21`
Base Version: `1.6.0`
Target Version: `1.7.0`

---

## Objective

Eliminate the need to restart the Command Deck server when `state.json` is modified externally (e.g., by an AI agent writing cards, by a direct file edit, or by a future toolchain integration). Currently the server loads state once into memory at startup via `self._state = self._load_or_create()` and never re-reads from disk — making any external write invisible until restart. This contract adds a `POST /api/reload` endpoint that forces the server to re-read `state.json` from disk and replace its in-memory state, with no process restart required.

---

## Authorized File Changes

| File | Action | Purpose |
|---|---|---|
| `ops/launch-command-deck/server.py` | **[MODIFY]** | Add `POST /api/reload` handler; add `StateStore.reload()` method |
| `ops/launch-command-deck/server.js` | **[MODIFY]** | Same — identical API surface |
| `ops/launch-command-deck/public/app.js` | **[MODIFY]** | Add a **Reload State** utility button in the sidebar Utilities section |
| `extension/assets/launch-command-deck/server.py` | **[MODIFY]** | Mirror server.py change in the bundled extension copy |
| `extension/assets/launch-command-deck/server.js` | **[MODIFY]** | Mirror server.js change in the bundled extension copy |
| `extension/assets/launch-command-deck/public/app.js` | **[MODIFY]** | Mirror app.js change in the bundled extension copy |
| `package.json` | **[MODIFY]** | Bump version to `1.7.0` |
| `README.md` | **[MODIFY]** | Document the `/api/reload` endpoint and the Reload State button |

---

## Behavioral Specification

### Server — `StateStore.reload()` method

```python
def reload(self):
    with self._lock:
        self._state = self._load_or_create()
        return copy.deepcopy(self._state)
```

Thread-safe: acquires the same lock used by `mutate()` and `snapshot()`.

### Server — `POST /api/reload` endpoint

- No request body required
- Calls `STORE.reload()`
- Returns `{"ok": true, "state": <reloaded state>}`
- On read error: returns `{"ok": false, "error": "<message>"}` with HTTP 500

Both `server.py` and `server.js` implement the endpoint identically.

### Frontend — Reload State button (`app.js`)

Add a **Reload State** button to the existing Utilities section in the left sidebar, below the Import JSON button:

```javascript
el.btnReloadState.addEventListener('click', async () => {
  await api('/api/reload', 'POST');
  await refresh();
});
```

Button label: `Reload State`
Style: same `.btn` class as other utility buttons — no special styling needed.

> The button is intentionally low-prominence. It is a developer utility, not a primary workflow action.

---

## Acceptance Criteria

1. `POST /api/reload` returns `{"ok": true, "state": ...}` with the freshly read state from disk
2. After an external write to `state.json`, calling `POST /api/reload` (via button or direct API call) makes the new data visible without restarting the server
3. The Reload State button appears in the sidebar Utilities section and triggers a full board refresh on click
4. The reload is thread-safe — concurrent API requests during a reload do not produce corrupted state
5. Both `server.py` and `server.js` implement identical behavior
6. Both `ops/launch-command-deck/` and `extension/assets/launch-command-deck/` copies are updated
7. `package.json` version is `1.7.0`
8. TypeScript compiles with zero errors (extension layer unaffected — no `.ts` files changed)
