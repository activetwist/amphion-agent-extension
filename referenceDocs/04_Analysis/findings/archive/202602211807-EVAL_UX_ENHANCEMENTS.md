# Evaluation Findings: UX Enhancement Proposals

Date: `202602211807`
Version: `v0.01a`
Phase: Evaluate

---

## Enhancement 1 — Charter/PRD AI Derivation Follow-Through

### Observed Behavior (Bug Confirmed)

The `runCharterWizard` function is invoked in `scaffolder.ts` via a `setTimeout` at 3,500ms after server launch:

```typescript
// scaffolder.ts, line 176
setTimeout(async () => {
    await runCharterWizard(root, config, initTerminal);
}, 3500);
```

When the operator selects "Import source documents," `charterWizard.ts` executes Path B (`runSourceDocsPath`):
1. File picker opens → files copied to `helperContext/`
2. Stub Charter and PRD written with `[AI_DERIVE]` markers
3. Git commit fired via terminal
4. Closing notification shown: *"✅ {N} source document(s) added..."*

**The workflow stops here.** There is no step that invokes an AI agent to complete the stubs. The closing notification is effectively a passive message. The operator must manually discover the stubs are waiting and separately prompt an agent to derive the content.

### Root Cause

The extension has no mechanism to trigger an agent action post-write. VS Code extensions can open files, but they cannot issue a conversational prompt to an AI agent running in the IDE. Agentic IDEs (Antigravity, Cursor, Claude Code) all have their own invocation surfaces that the extension cannot directly control.

### Findings

- The **stub + helperContext approach is architecturally correct** — it provides the right artifact shape for the agent to act on.
- The **missing link is the invocation signal** — the operator needs a clear, actionable instruction telling them what to do next after the extension closes.
- The closing notification is the right place to deliver this signal, but it currently says only that files are "ready for AI completion" without giving the operator an explicit command to run.
- A secondary gap: the stubs themselves contain `*[Derive from source documents]*` placeholders, but **no explicit prompt or directive to the agent**. The agent therefore has to infer its task rather than being given a precise instruction.

### Proposed Direction

Two-part fix:

**A) Enhance the closing notification** to include an operator-facing instruction. Example:
> *"✅ Stubs ready. Open the Charter or PRD and run: 'Derive this document from the source files in helperContext/'"*

**B) Embed an agent prompt directive inside each stub document.** After the `[!IMPORTANT]` alert, add an explicit `[!NOTE]` block with a ready-to-use agent instruction, e.g.:
> *"Prompt your AI agent: 'Read the files listed above in helperContext/ and derive the content for each section marked [Derive from source documents]. Do not add sections not listed here.'"*

This converts the stub from a passive placeholder into an active agent brief. The operator can copy-paste the prompt directly into their IDE chat.

### Risks / Unknowns
- Prompt language needs to be agent-agnostic (Antigravity, Cursor, Claude Code, Codex all handle instructions differently in phrasing).
- File names in the `[!IMPORTANT]` block must be relative paths — already implemented correctly in `renderCharterStub.ts`.

---

## Enhancement 2 — Explicit MCD Command Files (Agent Invocation Layer)

### Context

The operator described this as building the "API layer" first — creating structured command files that expose MCD phase verbs (Evaluate, Contract, Execute, Closeout) as explicit, machine-readable directives that any supported agent environment can consume. The interface layer (richer UX on top) comes later.

### Target Environments

| Environment | Native Command Surface | File Type That Works Best |
|---|---|---|
| **Antigravity** | Reads workspace files in context | `.md` with YAML frontmatter (workflow files) |
| **Cursor** | `.cursorrules`, custom docs in workspace | `.md` with structured prompts |
| **Claude Code** | `CLAUDE.md` in project root | Markdown with inline instructions |
| **ChatGPT Codex** | System prompt + project context | Markdown files |

### Key Observation

All four environments share a lowest common denominator: **structured Markdown files in a known directory**. If MCD command files are placed in a predictable location and follow a consistent schema, any agent that reads workspace context will have access to them.

### Proposed Architecture

Create a new directory scaffolded by the extension:

```
referenceDocs/00_Governance/commands/
├── EVALUATE.md
├── CONTRACT.md
├── EXECUTE.md
└── CLOSEOUT.md
```

Each file follows a consistent schema:

```markdown
---
command: evaluate
phase: 1
description: Assess the current state before contracting any work
---

# MCD: Evaluate

## When to Use
Run this command at the start of any new work cycle, or when the operator needs to understand the current state before scoping a contract.

## Inputs Required
- [Topic or area to evaluate]

## Agent Instructions
1. Read the active board from the Command Deck or referenceDocs/ to understand current project state.
2. Examine relevant existing files in the workspace.
3. Write evaluation findings to: `referenceDocs/04_Analysis/findings/YYYYMMDDHHMM-EVAL_[TOPIC].md`
4. Do NOT produce implementation code during Evaluate.
5. Conclude with: recommended next step (Contract, Research, or Synthesis).

## Output
`referenceDocs/04_Analysis/findings/YYYYMMDDHHMM-EVAL_[TOPIC].md`
```

### Environment-Specific Adapters

To support each target environment without fragmentation:

- **Antigravity**: The `commands/` directory maps directly to its workflow system — files can be symlinked or cross-referenced in `.agents/workflows/` using the existing skill/workflow convention.
- **Cursor/Claude Code**: A root-level `CLAUDE.md` or `.cursorrules` can reference the `commands/` directory with an instruction like: *"When the operator says 'Evaluate', follow the instructions in `referenceDocs/00_Governance/commands/EVALUATE.md`."*
- **ChatGPT Codex**: Same pattern — a root-level `AGENTS.md` (Codex's convention) that references the command files.

This means: **one canonical command definition, multiple entry point adapters**. The commands themselves are environment-agnostic. The adapters are thin routing files.

### What Gets Scaffolded By the Extension

The `scaffolder.ts` would write:
1. `referenceDocs/00_Governance/commands/EVALUATE.md`
2. `referenceDocs/00_Governance/commands/CONTRACT.md`
3. `referenceDocs/00_Governance/commands/EXECUTE.md`
4. `referenceDocs/00_Governance/commands/CLOSEOUT.md`
5. `CLAUDE.md` (root level) — references commands, sets MCD context for Claude Code
6. `AGENTS.md` (root level) — same for Codex
7. `.agents/workflows/evaluate.md`, `.agents/workflows/contract.md`, etc. — for Antigravity

### Risks / Unknowns
- **Cursor** doesn't have a single canonical context file — `.cursorrules` is workspace-level but its parsing varies by Cursor version. Should confirm current Cursor behavior before writing a `.cursorrules` template.
- **Codex `AGENTS.md`** convention is relatively new and may evolve. The canonical commands/ files are the stable layer; the adapters can be updated independently.
- The wizard already collects project name, codename, and version — all of which can be interpolated into the command files at scaffold time, making them project-specific from day one.

---

## Enhancement 3 — Deterministic Issue Numbers on Cards

### Current State

Cards have a `priority` field (`P0`, `P1`, `P2`) displayed as a badge in the top-right corner of each card (via `createCardNode()` in `app.js`, lines 229–231). Priority badges use color classes (`priority-p0`, `priority-p1`, `priority-p2`).

Cards have no numeric identifier. The only unique identifier is the internal `id` field (e.g., `card_7c3a215378`) — a random hex string, not human-readable.

### What the Operator Wants

A **deterministic, human-readable issue number** per card — analogous to GitHub Issues `#1`, Jira `PROJ-001` — displayed in the bottom-left corner of each card for easy verbal and written reference.

### Numbering Scheme Options

| Scheme | Example | Pros | Cons |
|---|---|---|---|
| **Global sequential** | `#1`, `#2`, `#3` | Simple, familiar | Gaps appear when cards are deleted; numbers on cloned boards collide |
| **Board-scoped sequential** | `BC-001`, `BC-002` | Scoped per board, codename-prefixed | Still gaps on deletion; requires board-level counter |
| **Milestone-scoped sequential** | `v001a-01`, `v001a-02` | Aligns with MCD versioning; self-documenting | Longer strings; harder to reference verbally |
| **Creation timestamp** | `2026022117` | Zero collisions, always deterministic | Not sequential; not concise; not human-friendly |
| **Board-scoped alpha-numeric** | `BC-1` through `BC-N`, no reuse | Simple + no collision | Requires a persisted counter in `state.json` |

### Recommended Scheme

**Board-scoped sequential with codename prefix**, stored as a persistent field on the card:

- Format: `{CODENAME_PREFIX}-{NNN}` → e.g., `BC-001`, `BC-002`
- `{CODENAME_PREFIX}` = first 2–3 uppercase characters of the board codename (set at init time)
- `{NNN}` = zero-padded 3-digit integer, auto-incremented per board, **never reused** (counter only increases, even after deletion)
- Stored as `issueNumber` (a `string`) on the card record in `state.json`
- Counter stored as `nextIssueNumber` (integer) on the board record in `state.json`

This produces short, readable, verbally referenceable IDs (`BC-003`) with zero collision risk within a board and clear cross-board disambiguation via prefix.

### UI Placement

Bottom-left of the card, as the operator suggested. This is the correct call:
- Bottom-right is already used for `@owner` and due date
- Top-right is the priority badge
- Top-left is the milestone badge
- Bottom-left is currently empty — clean placement with no conflicts

Rendered as a small, muted monospace label (dim color, small font, `font-family: monospace`) to distinguish it from interactive badges and avoid visual competition with the card title.

### Implementation Surface

| Component | Change |
|---|---|
| `state.json` schema | Add `issueNumber: string` to card, `nextIssueNumber: number` to board |
| `server.py` / `server.js` | Auto-assign `issueNumber` on card creation using board's `nextIssueNumber`, increment counter |
| `app.js` `createCardNode()` | Render `card.issueNumber` in bottom-left of card DOM |
| `styles.css` | Add `.issue-number` class — monospace, muted, small |
| `init_command_deck.py` | Initialize `nextIssueNumber: 1` on new board; assign seed cards with `BC-001`, `BC-002`, `BC-003` |
| Card HTML template | Add `<span class="issue-number"></span>` in bottom-left |

### Risks / Unknowns
- **Existing cards** (including current board's 3 seed cards) have no `issueNumber`. Migration / backfill strategy needed: either assign at first server restart (risky — order is indeterminate) or leave existing cards with a displayed `—` until manually assigned.
- **Cloned boards**: should the clone inherit issue numbers or restart from `BC-001`? Recommendation: inherit numbers from source board, do NOT reset the counter — preserves traceability if a card is discussed by number across board copies.
- **Priority tags (P0/P1/P2)**: operator noted these are canonical references and must be preserved. Issue numbers are additive — they do not replace the priority badge, they add a second reference identifier.

---

## Summary of Findings

| Enhancement | Complexity | Risk | Recommended Action |
|---|---|---|---|
| **1 — AI Derivation Follow-Through** | Low | Low | Contract a targeted fix: enhance stub template + closing notification copy |
| **2 — MCD Command Files** | Medium | Low-Medium | Contract scaffold of `commands/` directory + 3 environment adapters (Antigravity first, Cursor/Claude Code/Codex as stretch) |
| **3 — Issue Numbers** | Medium | Low | Contract schema + server + frontend changes; define backfill strategy for existing cards before execution |

All three enhancements are independent and can be contracted and executed in any order. Enhancement 2 delivers the most systemic long-term value. Enhancement 3 is the most self-contained and lowest-risk execution slice.
