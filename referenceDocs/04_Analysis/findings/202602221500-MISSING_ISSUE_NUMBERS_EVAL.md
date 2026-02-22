# EVALUATE: Missing Issue IDs on Task Cards

## 1. Research & Analysis
The user reported that the unique issue IDs (e.g., `AM-001`) are missing from the bottom left of their Command Deck task cards, displaying as empty space or `—`.

**Findings:**
1. **Frontend Logic is Correct**: `public/app.js` is correctly attempting to render `card.issueNumber || "—"` into the `.issue-badge` HTML element. The CSS formatting correctly styles this badge.
2. **Missing Data**: Upon inspecting `ops/launch-command-deck/data/state.json`, almost all cards in the active `cards` array completely lack the `"issueNumber"` JSON property. Only the parent board object possesses `nextIssueNumber: 9`. Because the property is undefined on the cards, the UI defaults to `—`.

## 2. Gap Analysis (The Root Cause)
When a human user creates a card via the Command Deck UI, the frontend sends a `POST /api/cards` payload to the server. The server (`server.py` or `server.js`) intercepts the request, looks up the board's `nextIssueNumber`, assigns it to the new card (e.g., `AM-004`), and increments the board's counter before saving to disk.

However, the new **`/board` workflow** instructs the AI agent to:
> "Create corresponding task cards in the Command Deck (`ops/launch-command-deck/data/state.json`)"

By directly editing the `.json` file, the AI agent completely **bypasses the backend server's auto-assignment logic**. Because `BOARD.md` doesn't explicitly teach the agent about the `issueNumber`/`nextIssueNumber` schema, the agent obliviously pushes card objects without that metadata. 

## 3. Scoping & Action Plan

**In-Scope Fixes (Requires Execution):**
1. Update `BOARD.md` (both in the repository's `referenceDocs` and the extension's string templates) to explicitly instruct the agent on the `issueNumber` schema when writing to `state.json`:
   - It must read the parent board's `codename` and `nextIssueNumber`.
   - It must assign `"issueNumber": "{codename}-{00X}"` to the new card.
   - It must increment the board's `nextIssueNumber`.
2. Write a one-off migration script (or manually edit `state.json`) to retroactively assign issue numbers to the existing orphaned cards so the UI resolves immediately for the user. 
3. Increment version to `v1.24.2`.

## 4. Primitive Review
No new primitives required.

## 5. Conclusion
**HALT.** Evaluation complete. The fix requires updating the canonical `BOARD.md` instruction schema to enforce deterministic ID assignment during direct file manipulation. Proceed to execution upon user approval.
