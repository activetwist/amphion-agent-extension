# EVALUATE: Safe Repair Strategy for Light Toggle Regression

## 1. Research & Analysis
The operator requested a non-disruptive path because the application is otherwise stable in active use. Existing findings confirm the regression is isolated to frontend theme-toggle wiring and copy synchronization across Command Deck frontend copies.

### Stability Constraint
- Current service behavior (board CRUD, reload, issue badges, dashboard/guide views) must remain uninterrupted.
- Any repair must avoid a broad refactor and avoid touching backend behavior.

## 2. Gap Analysis
The missing element is not only theme code restoration, but a **safe rollout method** that prevents accidental breakage while live usage continues.

Current risk factors:
1. Three duplicated frontend copies can diverge during patching.
2. A direct in-place overwrite of live `ops` frontend could introduce regressions if unvalidated.
3. No explicit pre/post smoke checklist is currently attached to the fix path.

## 3. Scoping (No-Break Plan)
### In Scope
1. Restore theme toggle behavior in a controlled sequence:
   - Stage on non-live preview port first.
   - Validate toggle button visibility, persistence, and dark/light variable application.
   - Apply to live `ops` copy only after pass.
2. Synchronize the extension asset copy from the validated source.
3. Add a minimal smoke checklist to verify unaffected core workflows.

### Out of Scope
- Any change to API contracts, state schema, or card workflow behavior.
- Additional UI redesign beyond theme restoration.

## 4. Primitive Review
No new architecture primitives required. This is an operationally safe patching sequence over existing frontend primitives.

## 5. Safety Acceptance Targets
- Light toggle visible in header.
- Toggle switches themes without console errors.
- Theme choice persists across refresh (`localStorage`).
- Board operations still function (create/edit/move task, reload state, tab switching).
- Both runtime and extension asset copies remain in sync after patch.

## 6. Conclusion
**HALT.** Evaluation complete. A no-downtime repair path is feasible and should be executed as a tightly scoped, validated frontend synchronization patch.
