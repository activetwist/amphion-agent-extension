# EVALUATE: Command Deck Auto-Reload Mechanism

## 1. Research & Analysis
The user requested an evaluation on how to implement automatic hot-reloading on the Command Deck frontend so that browser clients instantly reflect updates to `state.json` without requiring a manual page refresh.

**Findings:**
1. **Server-Side Readiness**: Complete. Both the Node.js (`server.js`) and Python (`server.py`) backends already track the precise disk modification time of `state.json` via their internal `_last_mtime` properties.
2. **Client-Side Readiness**: The browser (`app.js`) currently executes a full `refresh()` routine (which fetches the entire state payload and re-renders the DOM) only on initial load and after manual destructive actions.
3. **Infrastructure Constraints**: Implementing full WebSockets (WS/WSS) natively in Python's standard `http.server` is non-trivial without external async dependencies. The Node.js server also relies solely on standard `http`.

## 2. Gap Analysis
The browser has no way of knowing when `state.json` changes. Asking the browser to download the entire `/api/state` payload every 2 seconds is incredibly network-inefficient and will cause severe DOM thrashing. 

## 3. Scoping & Action Plan (The Polling Strategy)
**Proposed Architecture: Lightweight Semantic Polling**
Instead of WebSockets, we can implement an extremely efficient HTTP polling mechanism:

1. **Backend Extension**: 
   - Expose a new endpoint: `GET /api/state/version`.
   - Both `server.js` and `server.py` will respond with a tiny JSON object containing only their `_last_mtime` (e.g., `{"ok": true, "version": 1740250000.123}`).
2. **Frontend Extension**:
   - `app.js` will establish a background interval (e.g., `setInterval(pollVersion, 2000)`).
   - Every 2 seconds, the client asks for the version. It compares the server's `version` against its locally memorialized version.
   - If (and only if) the version differs, the frontend invokes a native `refresh()` to pull the full payload and cleanly re-render the UI.

This effectively delivers instant, WebSocket-like hot reloading with near-zero network overhead and zero new dependencies.

## 4. Primitive Review
No new primitives required.

## 5. Conclusion
**HALT.** Evaluation complete. The lightweight `version` polling strategy is highly viable. Proceed to Contract upon Product Owner approval.
