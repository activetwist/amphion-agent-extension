# CONTRACT · {{PROJECT_NAME}}

**Phase:** 2 (Planning & Agreement)
**Status:** Canonical Instruction Set
**Codename:** `{{CODENAME}}`

## When to Use
Invoke this command after Evaluate is complete and scope is locked. This phase defines the implementation "How" and secures operator approval before execution.

## Inputs
- [ ] Evaluation findings artifact (DB)
- [ ] Active board context
- [ ] Target milestone (new milestone for net-new work)
- [ ] Affected File Paths (AFPs)

## Instructions
1. **Runtime Gate**: Confirm Command Deck API is reachable and board context resolves.
2. **Blocked Behavior**: If API/board is unavailable, halt as blocked. Do not emit a chat-only or file-only contract as authority.
3. **Macro Contract Metadata**: Populate milestone-level contract metadata (`metaContract`, `goals`, `nonGoals`, `risks`).
4. **Micro-Contract Cards (Required)**: Create/update sequenced contract cards on board, each milestone-bound and acceptance-driven.
5. **AFP Enumeration**: Include exact files to be created/modified/deleted in card descriptions/acceptance.
6. **Risk Coverage**: Explicitly capture side effects and failure handling in contract scope.
7. **Approval Handoff**: Present milestone ID + issue-numbered contract cards for formal operator approval.
8. **Trigger-Based Execution**: `/execute` may begin only after explicit approval of the board-authored contract set.

**CRITICAL AGENT INSTRUCTION:** Chat summaries are explanatory only. Board/DB contract cards are the sole execution authority.

**CRITICAL AGENT INSTRUCTION:** After contract cards are authored and presented, halt and await explicit `/execute` authorization.

## Output
- [ ] Approved, milestone-bound contract card set on board (DB canonical).
- [ ] Milestone contract metadata recorded.
- [ ] Operator-facing summary with milestone ID + issue IDs.
