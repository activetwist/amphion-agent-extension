---
name: remember
description: "Capture a compact memory checkpoint without changing lifecycle phase. Use to persist operational context between sessions."
argument-hint: "[what to remember]"
---

This skill invokes the canonical MCD REMEMBER command.

## Instructions

1. **Read the command instructions** at `.amphion/control-plane/mcd/REMEMBER.md`.

2. **Runtime gate**:
   - Read port from `.amphion/config.json`.
   - `GET http://127.0.0.1:{port}/api/health` — confirm canonical runtime.

3. **Resolve board context**: `GET http://127.0.0.1:{port}/api/find` to identify active board.

4. **Write memory event**: `POST http://127.0.0.1:{port}/api/memory/events` with:
   - `memoryKey`: deterministic key for the checkpoint
   - `eventType`: `upsert`
   - `sourceType`: `user` or `verified-system`
   - `value`: compact facts to remember about: `$ARGUMENTS`

5. **Verify**: `GET http://127.0.0.1:{port}/api/memory/query?key={memoryKey}` to confirm persistence.

6. **No phase transition**: Confirm checkpoint completion and remain in current lifecycle phase.

7. Keep entries short and factual. Do not write speculative or unverified facts into memory.
