# EVALUATE: Edit Dialog Issue Number Display

## 1. Research & Analysis
The operator requested a hotfix to show the issue number in the edit-task modal (upper-right area in dialog header). Current runtime inspection confirms:

1. **Issue Number Source Exists and Is Stable**
   - `issueNumber` is already present on each card object and is rendered on board cards.
   - Existing usage: `ops/launch-command-deck/public/app.js` sets `.issue-badge` with `card.issueNumber || "—"`.
2. **Dialog Header Lacks Issue Number Slot**
   - Current modal header in `ops/launch-command-deck/public/index.html` contains only `#cardDialogTitle`.
   - `openCardDialog()` fills standard fields but does not render issue number in the header.
3. **UX Target Is Well Scoped**
   - Screenshot confirms desired location: top-right area of `Edit Task` header.
   - This is a presentation-only enhancement with no data model changes.

## 2. Gap Analysis
The gap is purely UI wiring:
- Data exists (`issueNumber`) and is already trusted in card rendering.
- Modal header lacks a dedicated element and binding logic.
- Need a graceful fallback for new cards without `issueNumber`.

## 3. Scoping
### In Scope
- Add a modal header element for issue number.
- Populate it from the same `card.issueNumber` source used by card badges.
- Hide/clear for new cards (or display `—`) per UX decision.
- Mirror the same change across runtime and mirrored frontend copies.

### Out of Scope
- No backend/API/state schema changes.
- No modification to issue number generation logic.
- No wider modal redesign outside header metadata display.

## 4. Primitive Review
No new architecture primitives required. This is a frontend presentation-layer hotfix over existing card metadata.

## 5. Conclusion
**HALT.** Evaluation complete. A minimal hotfix is feasible and low risk.
