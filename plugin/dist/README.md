# AmphionAgent for Claude Code

**This is not your average Claude Code skill.**

Most skills add a shortcut. AmphionAgent adds a governance system — a complete project management infrastructure that runs locally on your machine, wired directly into Claude Code. One file. One command. A full MCD workspace in under 60 seconds.

---

## What You Get

### 9 Claude Code Skills (installed automatically)

| Skill | Purpose |
|---|---|
| `/amphion` | Initialize a new MCD workspace in any project directory |
| `/evaluate` | Research, scope, and record findings for a new milestone or feature |
| `/contract` | Author milestone-bound contract cards with acceptance criteria |
| `/execute` | Implement exactly what the approved contract authorizes |
| `/closeout` | Seal a version with verified outcomes and a canonical git commit |
| `/docs` | Generate your Project Charter and High-Level PRD |
| `/server` | Start, stop, or check the status of your local Command Deck |
| `/help` | Surface MCD methodology guidance and command reference |
| `/remember` | Write compact operational memory across sessions |

### The Command Deck

A fully-featured local Kanban application that launches in your browser — no cloud, no account, no subscription. It includes:

- **Milestone & card management** — operator-gated, phase-bound contract cards
- **Artifact storage** — findings, outcomes, Project Charters, PRDs stored in a local SQLite DB
- **Memory system** — persistent handoff state across Claude Code sessions
- **API layer** — Claude talks to the board directly via a local HTTP API

### Strategy Initialization (SIP)

When you run `/amphion` for the first time, Claude guides you through creating your foundational strategy documents:

- **Fast Setup** — 6 questions, Charter + PRD generated in minutes
- **Guided Setup** — Structured strategy interview for richer documentation
- **Use Existing Docs** — Attach your own PRDs or specs and Claude derives the Charter + PRD from them

### Governance Infrastructure

Your project gets a complete `.amphion/` control plane including:

- **GUARDRAILS.md** — Phase rules, security gate policy, compliance checklist
- **MCD Playbook** — Canonical methodology reference
- **Phase command files** — EVALUATE, CONTRACT, EXECUTE, CLOSEOUT, REMEMBER, HELP
- **CLAUDE.md** — Project routing table wired to your Command Deck

---

## Install

### Option 1: Drop the file (manual) — Install `/amphion` (recommended)

1. Copy `amphion.md` from this ZIP to `~/.claude/commands/`:
   ```
   ~/.claude/commands/amphion.md
   ```
2. Open Claude Code in any project directory.
3. Type `/amphion`.

That's it. Claude handles everything from there, including automatic installation of the other 8 MCD skills.

### Option 2: One-liner (terminal)

```bash
curl -sL https://github.com/activetwist/amphion-agent-extension/releases/latest/download/amphion.md \
  -o ~/.claude/commands/amphion.md
```

### Option 3: Install individual skills manually

All 9 skills are included in this ZIP under the `skills/` directory:
- `skills/amphion.md` — Initialize a new MCD workspace
- `skills/evaluate.md` — Run the EVALUATE phase
- `skills/contract.md` — Run the CONTRACT phase
- `skills/execute.md` — Run the EXECUTE phase
- `skills/closeout.md` — Run the CLOSEOUT phase
- `skills/help.md` — Get MCD methodology help
- `skills/remember.md` — Save operational memory
- `skills/docs.md` — Generate project documents
- `skills/server.md` — Manage the local Command Deck server

Copy any of these to `~/.claude/commands/` to install them as personal skills.

> **Note:** `~/.claude/commands/` is the personal skill scope — installed skills will be available in every project you open in Claude Code, permanently. Typically, you only need `/amphion` initially; it will install the other 8 skills into your project when you run it.

---

## How It Works

AmphionAgent implements **Micro-Contract Development (MCD)** — a structured 4-phase governance workflow designed for AI-assisted software development.

### The 4 Phases

- **Evaluate** — Research the problem, define scope, record findings as canonical DB artifacts. No code in this phase.
- **Contract** — Author milestone-bound card sets with acceptance criteria. Nothing gets built without an approved contract.
- **Execute** — Implement exactly what the contract authorizes. Claude stays within the approved scope.
- **Closeout** — Verify outcomes, seal the version, write the canonical git commit. Mandatory — not optional.

### Why This Matters

AI agents are fast. Dangerously fast. Without governance, they drift, gold-plate, and ship untested work. MCD puts the operator back in control — every phase requires explicit authorization before the next one begins. The Command Deck makes that governance visible, trackable, and persistent across sessions.

---

## Recommended Model

**Use Claude Sonnet.** Not Haiku. Not Opus.

AmphionAgent is not a simple shortcut — it scaffolds a workspace, runs a structured strategy interview, constructs API payloads, replaces tokens across multiple files, and manages a local server. Haiku handles the mechanical steps adequately, but struggles with the Guided Setup path (17 questions, long context, structured output) and multi-step API call sequences. Opus handles everything fine but is overkill for this workload.

Sonnet is the right balance: reliable context retention, accurate structured output, and consistent API call construction across the full initialization flow.

---

## Requirements

- [Claude Code](https://claude.ai/download) (any recent version)
- Python 3.x (for the local Command Deck server)
- A project directory (empty or existing)

---

## Learn More

- **MCD Methodology & Free eBook** — [mcdbook.com](https://mcdbook.com)
- **Active Twist Consulting Group** — [activetwist.com](https://activetwist.com)
- **Creator: Stanton Brooks** — [linkedin.com/in/stantonbrooks](https://www.linkedin.com/in/stantonbrooks/)

The eBook at mcdbook.com is free, ungated, and comprehensive. If you want to understand the full MCD methodology — why it exists, how it works, and how to get the most out of AmphionAgent — start there.

---

*AmphionAgent v1.57.0 · MIT License · © Active Twist Consulting Group, LLC*
