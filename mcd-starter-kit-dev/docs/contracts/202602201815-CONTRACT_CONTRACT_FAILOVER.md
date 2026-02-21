# Contract: v0.03a-hotfix Contract Failover Logic

Contract ID: `CT-20260220-OPS-004`
Date: `2026-02-20`
Project: `Content Monetization` (`Stacks`)
Phase: `Contract`

## Objective
Implement graceful fallback logic for the Command Deck's contract viewer to handle states where no active contract exists (such as immediately after closeout).

## Authorized File Changes

### 1. Server Backend
**Files**: `ops/launch-command-deck/server.py`
- Update the `/api/docs/contract` logic.
- Attempt to retrieve the latest `.md` file from `03_Contracts/active/`.
- If zero files exist, attempt to retrieve the latest `.md` file from `03_Contracts/archive/`.
- Prepend the returned markdown content with a header indicating whether the contract is `[STATUS: ACTIVE]` or `[STATUS: ARCHIVED]`.

### 2. Client Frontend
**Files**: `ops/launch-command-deck/public/index.html`
- Rename the button text from "Active Contract" to "Latest Contract".

## Acceptance Criteria
1. Clicking "Latest Contract" when the `active/` directory is empty successfully loads the most recent archived contract.
2. The UI explicitly denotes whether the viewed contract is currently active or archived.
3. The underlying `FileNotFoundError` crash is resolved.
