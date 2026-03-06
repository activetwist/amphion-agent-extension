---
name: docs
description: "Generate Project Charter and High-Level PRD from source documents or interactive questions. Use after /amphion to complete strategy initialization, or standalone to regenerate documents."
argument-hint: "[fast | guided]"
---

This skill generates the two foundational MCD governance documents — the **Project Charter** and **High-Level PRD** — and writes them as board-artifacts to the Command Deck API.

## Runtime Gate

1. Read port from `.amphion/config.json` (default: `8765`).
2. `GET http://localhost:{port}/api/health` — confirm server is running.
3. If offline, halt and tell the user: "Command Deck is not running. Run `/server start` first."
4. `GET http://localhost:{port}/api/state` — resolve `activeBoardId`.
5. Read `projectName` and `codename` from `.amphion/config.json`.

## Existing Document Check

1. Check if charter or prd artifacts already exist in the board state (look for artifacts with `artifactType: charter` or `artifactType: prd` in the board's `artifacts` array).
2. If either exists, inform the user and ask: "Charter and/or PRD already exist on the board. Do you want to regenerate them? This will create a new revision."
3. If the user says no, stop.

## Trademark Guardrail

Before generating any documents, validate the `projectName` from `.amphion/config.json`. If the project name appears to be a well-known third-party brand or trademark (e.g., McDonald's, Nike, Google, Apple, Amazon, Microsoft, Disney, Coca-Cola, etc.), warn the user:

> "The project name '{projectName}' appears to be a well-known brand. AmphionAgent generates official-looking strategy documents using this name. Please confirm this is YOUR project, or update the project name in `.amphion/config.json` to avoid trademark issues."

Do NOT proceed until the user confirms or changes the name.

## Determine Input Mode

Check `$ARGUMENTS` and available context:

- If `$ARGUMENTS` is `fast` → go to **Fast Path**
- If `$ARGUMENTS` is `guided` → go to **Guided Path**
- If the user has attached files in this conversation (images, PDFs, text files) → go to **Source Document Path**
- If files exist in `.amphion/context/` directory → go to **Source Document Path**
- Otherwise → ask the user which path they want:
  1. **Fast** — Answer 6 quick questions
  2. **Guided** — Structured strategy interview
  3. **Use Existing Documents** — Attach your docs with (+) and I'll derive the Charter & PRD

---

## Fast Path (6 Questions)

Ask the user these 6 questions, one at a time or grouped naturally:

1. **Target Users** — "Who is this product for? Describe your primary users."
2. **Problem Statement** — "What problem are you solving? What's painful today?"
3. **Core Value Proposition** — "What's the big idea? In one sentence, what does this product do?"
4. **Hard Non-Goals** — "What is explicitly OUT of scope? What will you NOT build?"
5. **Key Features** — "List up to 5 key features for the first version (comma-separated)."
6. **Success Metric** — "How will you know this version is done? What's the definition of success?"

After collecting answers, generate the Charter and PRD using the templates below, then go to **Write Artifacts**.

---

## Guided Path (Structured Interview)

Walk the user through these 7 sections. Be conversational — summarize what you've captured after each section before moving on.

### Section A: Target Users
- "Who are your primary users?" (Suggest categories: individual consumers, small teams, enterprise teams, developers, non-technical users, general public)
- "Describe the ideal successful user — what does their day look like after using your product?"

### Section B: Problem Statement
- "What painful tasks do your users deal with today?" (Suggest: manual work, spreadsheets, tool switching, copy/pasting, slow approvals, errors/rework)
- "What is the single most painful step in their current workflow?"

### Section C: Core Value Proposition
- "What does your product reduce?" (Suggest: time, errors, cost, cognitive load, tool switching)
- "What does your product increase?" (Suggest: speed, visibility, accuracy, automation, revenue)
- "In one sentence, what is the core value of this product?"

### Section D: Hard Non-Goals
- "What features are explicitly out of scope?" (Suggest: payments, auth/login, multi-user, mobile, analytics, marketplace, AI features)
- "Anything else you want to explicitly exclude?"

### Section E: Key Features
- "What version are you targeting?" (Default to the version in config.json)
- "List up to 5 key features for this version."

### Section F: Success Metric
- "What type of success metric?" (Options: shipped product, first user, first paying customer, replaces existing tool, saves measurable time)
- "What's the specific target?" (e.g., "$100 MRR", "10 signups", "saves 2 hours/week")
- "What's the time horizon?" (Options: 7 days, 30 days, 90 days, 6 months, 12 months)

### Section G: Constraints
- "Deployment model?" (Options: local-only, shared hosting, VPS, cloud)
- "Data storage?" (Options: file-based, SQLite, MySQL, PostgreSQL)
- "Any security considerations?" (Suggest: auth required, data encryption, audit logging, HIPAA, SOC2)

After collecting all answers, generate the Charter and PRD using the templates below, then go to **Write Artifacts**.

---

## Source Document Path

1. Read all files the user has attached in this conversation.
2. Read all files in `.amphion/context/` if the directory exists and contains files.
3. From the source material, derive answers to the 6 core questions:
   - Target Users
   - Problem Statement
   - Core Value Proposition
   - Hard Non-Goals
   - Key Features (up to 5)
   - Success Metric
4. Present your derived answers to the user for confirmation: "Here's what I derived from your documents. Please confirm or correct any of these before I generate the Charter and PRD."
5. After confirmation, generate the Charter and PRD using the templates below, then go to **Write Artifacts**.

---

## Charter Template

Generate the following markdown, filling in values from the collected answers. Use `{projectName}`, `{codename}`, and `{initialVersion}` from `.amphion/config.json`. Use today's date for `{date}`.

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

---

## PRD Template

Generate the following markdown. Split `{keyFeatures}` into a bulleted list.

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

---

## Write Artifacts

1. Get the conventions schema: `GET http://localhost:{port}/api/conventions?intent=board-artifact`
2. Write the Charter:
   ```
   POST http://localhost:{port}/api/boards/{boardId}/artifacts
   {
     "artifactType": "charter",
     "title": "Project Charter — {projectName}",
     "summary": "Foundational intent, scope, and boundaries for {projectName} ({codename}).",
     "body": "{charterMarkdown}"
   }
   ```
3. Write the PRD:
   ```
   POST http://localhost:{port}/api/boards/{boardId}/artifacts
   {
     "artifactType": "prd",
     "title": "High-Level PRD — {projectName}",
     "summary": "Version {initialVersion} feature set and success criteria for {projectName} ({codename}).",
     "body": "{prdMarkdown}"
   }
   ```
4. Verify both artifacts appear in the board state.

## Completion

Report to the user:
- "Project Charter and High-Level PRD have been generated and saved to the Command Deck."
- "You can view them in the Command Deck dashboard at http://localhost:{port}"
- "To begin your first MCD cycle, run `/evaluate`."
