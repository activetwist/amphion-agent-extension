---
name: amphion
description: "Initialize a new AmphionAgent MCD workspace. Scaffolds .amphion/ directory, Command Deck server, governance docs, CLAUDE.md, and guides you through Strategy Initialization (Charter & PRD)."
argument-hint: "[project name]"
---

This skill scaffolds a new AmphionAgent project for Micro-Contract Development and guides the user through Strategy Initialization to create their Project Charter and High-Level PRD.

**IMPORTANT:** "MCD" stands for **Micro-Contract Development**. It is a software governance methodology. It has no relation to any restaurant chain, trademark, or brand.

## Pre-Check

1. Check if `.amphion/` already exists in the project root.
   - If it exists, inform the user: "This project already has an AmphionAgent workspace. Use `/server start` to launch the Command Deck, or `/docs` to generate strategy documents."
   - Do not overwrite an existing workspace.

## Collect Project Configuration

Ask the user for the following (use defaults if not provided):

1. **Project Name** (required): `$ARGUMENTS` or ask if not provided.
2. **Codename** (required): A short uppercase identifier (e.g., `BLACKCLAW`, `PHOENIX`). Ask the user.
3. **Initial Version** (optional, default: `v0.01a`): The starting version string.
4. **Port** (optional, default: `8765`): The Command Deck server port (must be 1024–65535).

### Trademark Guardrail

After collecting the project name, validate that it is not a well-known third-party brand or trademark. If the project name appears to be a well-known brand (e.g., McDonald's, Nike, Google, Apple, Amazon, Microsoft, Disney, Coca-Cola, Tesla, Netflix, Meta, Spotify, Samsung, etc.), warn the user:

> "The project name '{projectName}' appears to be a well-known brand. AmphionAgent generates official-looking strategy documents (Project Charter, PRD) using this name. Please confirm this is YOUR project, or provide a different name to avoid trademark issues."

Do NOT proceed until the user either confirms ownership or provides a different name.

## Scaffold the Workspace

Once configuration is confirmed, download the AmphionAgent scaffold bundle from GitHub and set up the project.

### Step 1: Download scaffold bundle from GitHub

```bash
mkdir -p /tmp/amphion-dl && \
curl -sL https://github.com/activetwist/amphion-agent-extension/archive/refs/heads/main.tar.gz | \
  tar xz -C /tmp/amphion-dl --strip-components=1
```

If the download fails, inform the user: "Could not download AmphionAgent scaffolds from GitHub. Check your network connection and try again."

The extracted files will be at `/tmp/amphion-dl/plugin/scaffolds/` and `/tmp/amphion-dl/plugin/skills/`.

### Step 2: Create directory structure and copy Command Deck

```bash
mkdir -p .amphion/command-deck .amphion/control-plane/mcd .amphion/context
cp -R /tmp/amphion-dl/plugin/scaffolds/command-deck/* .amphion/command-deck/
```

This creates:
```
.amphion/
├── command-deck/
│   ├── server.py
│   ├── public/
│   │   ├── index.html
│   │   ├── styles.css
│   │   ├── app.js
│   │   ├── application-logo.png
│   │   └── vendor/
│   ├── scripts/
│   └── data/
├── control-plane/
│   └── mcd/
└── context/          (empty directory for source documents)
```

### Step 3: Copy and customize governance docs

Copy governance files and replace placeholder tokens:

```bash
cp -R /tmp/amphion-dl/plugin/scaffolds/control-plane/* .amphion/control-plane/
```

In every copied file under `.amphion/control-plane/`, replace these placeholder tokens with the user's configuration:
- `{{PROJECT_NAME}}` → the project name
- `{{CODENAME}}` → the codename
- `{{INITIAL_VERSION}}` → the initial version
- `{{PORT}}` → the port number

### Step 4: Write config.json

Create `.amphion/config.json`:
```json
{
  "port": "{port}",
  "serverLang": "python",
  "codename": "{codename}",
  "projectName": "{projectName}",
  "initialVersion": "{initialVersion}",
  "mcdVersion": "1.54.0",
  "commandDeckPath": ".amphion/command-deck"
}
```

### Step 5: Generate CLAUDE.md

Copy the CLAUDE.md template and replace placeholder tokens:
```bash
cp /tmp/amphion-dl/plugin/scaffolds/CLAUDE.md ./CLAUDE.md
```
Then replace `{{PROJECT_NAME}}`, `{{CODENAME}}`, `{{INITIAL_VERSION}}`, and `{{PORT}}` in `CLAUDE.md` with the user's configuration.

### Step 6: Install project-level skills

Copy all AmphionAgent skills into the project's `.claude/commands/` so they are available as slash commands:

```bash
mkdir -p .claude/commands
for skill_dir in /tmp/amphion-dl/plugin/skills/*/; do
  skill_name=$(basename "$skill_dir")
  cp "$skill_dir/SKILL.md" ".claude/commands/${skill_name}.md"
done
```

This installs: `/amphion`, `/docs`, `/evaluate`, `/contract`, `/execute`, `/closeout`, `/help`, `/remember`, `/server`

### Step 7: Clean up temp files

```bash
rm -rf /tmp/amphion-dl
```

### Step 8: Initialize the Command Deck database

Run the initialization script:
```bash
python3 .amphion/command-deck/scripts/init_command_deck.py --port {port} --project-name "{projectName}" --codename "{codename}"
```
If the init script does not exist, start the server directly — it will create the database on first run:
```bash
python3 .amphion/command-deck/server.py --port {port} &
```

### Step 9: Verify server

1. Wait 2 seconds for the server to start.
2. Verify health: `curl -s http://localhost:{port}/api/health`
3. Open the Command Deck dashboard: `open http://localhost:{port}`
4. Report to the user:
   - "AmphionAgent workspace initialized for **{projectName}** (`{codename}`)."
   - "Command Deck running at http://localhost:{port}"

## Step 10: Strategy Initialization Process (SIP)

Now guide the user through creating their foundational strategy documents. Present the three options:

> **Strategy Initialization** — Let's create your Project Charter and High-Level PRD.
>
> Choose your path:
> 1. **Fast Setup** — Answer 6 quick questions and I'll generate both documents.
> 2. **Guided Setup** — Walk through a structured strategy interview for richer documents.
> 3. **Use Existing Documents** — Skip for now. Attach your reference docs later and run `/docs`.

Wait for the user to choose.

### If the user picks Fast Setup (1):

Ask these 6 questions, one at a time or grouped naturally:

1. **Target Users** — "Who is this product for? Describe your primary users."
2. **Problem Statement** — "What problem are you solving? What's painful today?"
3. **Core Value Proposition** — "What's the big idea? In one sentence, what does this product do?"
4. **Hard Non-Goals** — "What is explicitly OUT of scope? What will you NOT build?"
5. **Key Features** — "List up to 5 key features for the first version (comma-separated)."
6. **Success Metric** — "How will you know this version is done? What's the definition of success?"

After collecting answers, generate and write the Charter and PRD using the process in **Write Strategy Artifacts** below.

### If the user picks Guided Setup (2):

Walk through these 7 sections conversationally. Summarize what you've captured after each section before moving on.

**Section A: Target Users**
- "Who are your primary users?" (Suggest categories: individual consumers, small teams, enterprise teams, developers, non-technical users, general public)
- "Describe the ideal successful user — what does their day look like after using your product?"

**Section B: Problem Statement**
- "What painful tasks do your users deal with today?" (Suggest: manual work, spreadsheets, tool switching, copy/pasting, slow approvals, errors/rework)
- "What is the single most painful step in their current workflow?"

**Section C: Core Value Proposition**
- "What does your product reduce?" (Suggest: time, errors, cost, cognitive load, tool switching)
- "What does your product increase?" (Suggest: speed, visibility, accuracy, automation, revenue)
- "In one sentence, what is the core value of this product?"

**Section D: Hard Non-Goals**
- "What features are explicitly out of scope?" (Suggest: payments, auth/login, multi-user, mobile, analytics, marketplace, AI features)
- "Anything else you want to explicitly exclude?"

**Section E: Key Features**
- "What version are you targeting?" (Default: the version in config.json)
- "List up to 5 key features for this version."

**Section F: Success Metric**
- "What type of success metric?" (Options: shipped product, first user, first paying customer, replaces existing tool, saves measurable time)
- "What's the specific target?" (e.g., "$100 MRR", "10 signups", "saves 2 hours/week")
- "What's the time horizon?" (Options: 7 days, 30 days, 90 days, 6 months, 12 months)

**Section G: Constraints**
- "Deployment model?" (Options: local-only, shared hosting, VPS, cloud)
- "Data storage?" (Options: file-based, SQLite, MySQL, PostgreSQL)
- "Any security considerations?" (Suggest: auth required, data encryption, audit logging, HIPAA, SOC2)

After collecting all answers, generate and write the Charter and PRD using the process in **Write Strategy Artifacts** below.

### If the user picks Use Existing Documents (3):

Tell the user:
> "No problem! When you're ready, attach your reference documents (PRDs, specs, strategy briefs) using the **(+)** button in the chat, then run `/docs` to generate your Charter and PRD from them."
>
> "You can start your first MCD cycle with `/evaluate` at any time."

Skip to **Completion** below.

---

## Write Strategy Artifacts

1. Read port from `.amphion/config.json`.
2. `GET http://localhost:{port}/api/state` to resolve `activeBoardId`.
3. `GET http://localhost:{port}/api/conventions?intent=board-artifact` for the payload schema.

4. Generate the **Charter** markdown:
```
# Project Charter — {projectName}

Codename: `{codename}`
Version: `{initialVersion}`
Date: `{date}`

---

## Overview
This document establishes the foundational intent, scope, and boundaries of the **{projectName}** project. It is the authoritative reference for all downstream planning, contracting, and execution.

---

## Target Users

{targetUsers}

---

## Problem Statement

{problemStatement}

---

## Core Value Proposition

{coreValue}

---

## Hard Non-Goals

The following are explicitly **out of scope** for this project:

{nonGoals}

---

## Operating Constraints
- All development follows the MCD (Micro-Contract Development) methodology
- Every code change must be authorized by approved contract cards in the Command Deck
- No contracted work begins without operator approval of the contract
- All versions are closed with a git commit using the format: `closeout: {VERSION} {description}`

---

*Generated by AmphionAgent · {date}*
```

5. Generate the **PRD** markdown:
```
# High-Level PRD — {projectName}

Codename: `{codename}`
Version: `{initialVersion}`
Date: `{date}`

---

## Background
**Target Users**: {targetUsers}

**Problem**: {problemStatement}

---

## Version {initialVersion} Feature Set

- {feature1}
- {feature2}
- {feature3}
- ...

---

## Success Metric

{successMetric}

---

## MCD Milestone Structure

| Milestone | Focus |
|---|---|
| M1 | Evaluate + Scope |
| M2 | Contract + Plan |
| M3 | Build + Verify |
| M4 | Release Readiness |

---

## Constraints
- All features are subject to contract approval before implementation
- Architecture diagrams must use Mermaid.js syntax
- No cloud dependencies or runtime package managers

---

*Generated by AmphionAgent · {date}*
```

6. Write the Charter artifact:
   ```
   POST http://localhost:{port}/api/boards/{boardId}/artifacts
   {
     "artifactType": "charter",
     "title": "Project Charter — {projectName}",
     "summary": "Foundational intent, scope, and boundaries for {projectName} ({codename}).",
     "body": "{charterMarkdown}"
   }
   ```

7. Write the PRD artifact:
   ```
   POST http://localhost:{port}/api/boards/{boardId}/artifacts
   {
     "artifactType": "prd",
     "title": "High-Level PRD — {projectName}",
     "summary": "Version {initialVersion} feature set and success criteria for {projectName} ({codename}).",
     "body": "{prdMarkdown}"
   }
   ```

8. Verify both artifacts appear in the board state.

## Completion

Report to the user:
- "Project Charter and High-Level PRD have been generated and saved to the Command Deck."
- "You can view them in the Command Deck dashboard at http://localhost:{port}"
- "To begin your first MCD cycle, run `/evaluate`."
