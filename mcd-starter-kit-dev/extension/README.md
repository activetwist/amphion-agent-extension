# MCD Starter Kit

**A VS Code Extension for the Micro-Contract Development (MCD) methodology.**

Scaffold a complete, governance-ready project workspace — in an empty folder or an existing project — in seconds. One command. Five prompts. Zero setup overhead.

---

## Table of Contents

1. [Overview](#overview)
2. [Installation](#installation)
3. [Getting Started](#getting-started)
4. [The 5-Prompt Wizard](#the-5-prompt-wizard)
5. [Using With an Existing Project](#using-with-an-existing-project)
6. [What Gets Scaffolded](#what-gets-scaffolded)
7. [The Command Deck](#the-command-deck)
8. [The MCD Methodology](#the-mcd-methodology)
9. [Core Rules & Guardrails](#core-rules--guardrails)
10. [Technical Architecture](#technical-architecture)
11. [Requirements](#requirements)
12. [Extension Commands](#extension-commands)

---

## Overview

The MCD Starter Kit bootstraps the complete **Micro-Contract Development** project scaffold directly inside your open VS Code workspace. It creates a deterministic, contract-governed development environment designed for solo operators working closely with AI coding agents.

The scaffold includes:
- A structured `referenceDocs/` governance directory tree
- Auto-generated `GUARDRAILS.md` and `MCD_PLAYBOOK.md` tailored to your project
- A fully operational **Command Deck** — a local Kanban board and project dashboard served by your choice of **Python** or **Node.js**
- An initial `git` commit establishing a clean provenance baseline

Works with both **empty folders** and **existing projects**.

---

## Installation

**Option A: Install from VSIX (offline)**
1. Open VS Code
2. Go to Extensions (`⌘⇧X` / `Ctrl+Shift+X`)
3. Click the `···` menu → **Install from VSIX...**
4. Select `mcd-starter-kit-1.1.0.vsix`

**Option B: VS Code Marketplace** *(coming soon)*
Search for `MCD Starter Kit` in the Extensions Marketplace.

---

## Getting Started

### New Project (Empty Folder)
1. Open an **empty folder** in VS Code (`File → Open Folder...`)
2. A notification appears automatically:

   > *"Initialize an MCD project in this workspace?"* → click **Initialize**

3. Complete the [5-prompt wizard](#the-5-prompt-wizard)
4. Watch the scaffold build automatically

### Existing Project
1. Open your **existing project** in VS Code
2. Open the Command Palette (`⌘⇧P` / `Ctrl+Shift+P`) and run:

   ```
   MCD: Initialize New Project
   ```

3. Complete the [5-prompt wizard](#the-5-prompt-wizard)
4. The extension will detect existing files and [ask before proceeding](#using-with-an-existing-project)

> **Tip:** If your workspace doesn't already contain a `referenceDocs/` directory, the extension will also show an automatic prompt offering to initialize.

---

## The 5-Prompt Wizard

The wizard collects five inputs before writing any files:

| Step | Prompt | Example | Notes |
|------|--------|---------|-------|
| 1/5 | **Project Name** | `Cymata` | The full human-readable project name |
| 2/5 | **Server Language** | `Python` or `Node.js` | Select the backend runtime for the Command Deck |
| 3/5 | **Codename** | `Genesis` | Short internal codename (used in commit messages and docs) |
| 4/5 | **Initial Version** | `v0.01a` | Default is `v0.01a`. Follows the MCD versioning format |
| 5/5 | **Command Deck Port** | `8765` | The local port the dashboard will run on (1024–65535) |

> **Tip:** Pressing `Escape` at any prompt cancels the wizard without writing any files.

---

## Using With an Existing Project

The MCD Starter Kit is designed to work safely alongside existing codebases. The scaffold is **purely additive** — it only creates new directories and files. No existing files are modified or overwritten.

### Conflict Detection

Before writing anything, the extension checks for:
- `referenceDocs/` — already exists?
- `ops/launch-command-deck/` — already exists?

If either is found, a **modal warning** appears:

> *"The following directories already exist: referenceDocs/, ops/launch-command-deck/. Proceeding will merge new files into these directories."*
> **[Continue]** **[Abort]**

Clicking **Abort** cancels cleanly — nothing is written.

### Git Branch Safety

If `.git/` already exists in your workspace (i.e., this is an active repository), you are offered a choice:

> *"Git repository detected."*
> - **Yes — create `mcd/init` branch**
> - **No — commit to current branch**

Choosing `mcd/init` creates a dedicated branch for the scaffold commit, keeping your main branch untouched until you're ready to merge.

### Result

Your existing project directory gains the MCD scaffold alongside your current code:

```
my-existing-app/
├── src/                   ← your existing code (untouched)
├── package.json           ← untouched
├── .git/                  ← untouched (or new mcd/init branch)
├── referenceDocs/         ← NEW: MCD governance scaffold
│   ├── 00_Governance/
│   ├── 01_Strategy/
│   └── ...
└── ops/
    └── launch-command-deck/  ← NEW: Command Deck app
```

---

## What Gets Scaffolded

After the wizard completes, the following structure is written to your workspace:

```
{workspace}/
├── referenceDocs/
│   ├── 00_Governance/
│   │   ├── GUARDRAILS.md          ← Auto-generated with your project name + codename
│   │   └── MCD_PLAYBOOK.md        ← The MCD operating manual
│   ├── 01_Strategy/               ← For PROJECT_CHARTER.md, HIGH_LEVEL_PRD.md
│   ├── 02_Architecture/
│   │   └── primitives/            ← For SYSTEM_ARCHITECTURE.md
│   ├── 03_Contracts/
│   │   ├── active/                ← Active build contracts live here
│   │   └── archive/               ← Completed/executed contracts are moved here
│   ├── 04_Analysis/
│   │   ├── findings/
│   │   └── scripts/
│   └── 05_Records/
│       ├── buildLogs/
│       ├── chatLogs/
│       └── documentation/
│           └── helperContext/
└── ops/
    └── launch-command-deck/       ← The Command Deck application
        ├── server.py              ← Python backend API
        ├── server.js              ← Node.js backend API (alternative)
        ├── public/                ← Vanilla JS/HTML/CSS frontend
        │   ├── index.html
        │   ├── app.js
        │   └── styles.css
        ├── scripts/
        │   └── init_command_deck.py
        └── data/
            └── state.json         ← Your Kanban board data
```

After writing the scaffold, the extension automatically:
1. **Initializes the Kanban board** for your specific project via `init_command_deck.py`
2. **Runs `git init`** (or offers a new branch if git already exists)
3. **Creates the initial commit**: `chore(init): {CODENAME} scaffold - establish guardrails + command deck`
4. **Starts the Command Deck server** in the VS Code integrated terminal (Python or Node.js based on your selection)
5. **Opens your browser** to `http://127.0.0.1:{PORT}` after a 2.5s startup buffer

---

## The Command Deck

The Command Deck is a fully local, zero-dependency project operations dashboard. It runs directly on your machine and renders in your browser with Vanilla JS.

### Server Language Options

| Language | Command | Dependencies |
|----------|---------|-------------|
| **Python** (default) | `python3 ops/launch-command-deck/server.py --port {PORT}` | Python 3 stdlib only — no `pip install` needed |
| **Node.js** | `node ops/launch-command-deck/server.js --port {PORT}` | Node.js stdlib only — no `npm install` needed |

Both servers expose an identical API surface. Choose whichever runtime you already have in your stack.

### Views

**Board** (Default)
The Kanban board. Drag cards between columns, assign milestones, set priorities and due dates, and filter by milestone. Supports full CRUD for boards, cards, lists, and milestones.

**Dashboard**
A live project telemetry panel containing:
- **Active Phase Indicator**: Infers your current development phase (Planning, Execution, Blocked, Closeout Ready) from the distribution of cards across columns
- **Milestone Burn-down**: Fraction of cards in the `Done` state per milestone, with progress bars
- **Blockers**: A live feed of any cards currently in the `Blocked` column
- **Domain Metrics**: Displays the configured project type
- **Core Reference Library**: One-click rendering of your governance documents (Charter, PRD, Guardrails, Active Contract) as formatted Markdown inside a modal dialog — with Mermaid diagram support
- **Traceability Feed (Git)**: Displays the last 8 git commits in real time directly from the SPA

**MCD Guide**
A fully rendered, in-app view of `MCD_PLAYBOOK.md`. Includes a **"Why MCD?"** button that opens an explanatory modal summarizing the core philosophy of the methodology.

### Left Sidebar (Persistent Across All Views)
- **Boards** list — switch between boards and set the active board
- **Milestone Progress** bars — always visible regardless of active tab
- **Utilities** — Clone Active Board, Export JSON, Import JSON

### State Persistence
The Command Deck remembers your last active view (`Board`, `Dashboard`, or `MCD Guide`) across hard browser refreshes using `localStorage`. The correct view is rendered on the very first paint frame via a synchronous `<head>` script, eliminating any visual flash.

### API Endpoints
Both the Python and Node.js servers expose identical endpoints:

| Method | Path | Description |
|--------|------|-------------|
| GET | `/api/state` | Full application state (boards, lists, cards, milestones) |
| GET/POST | `/api/boards` | List boards / create board |
| GET/PATCH/DELETE | `/api/boards/:id` | Manage a specific board |
| POST | `/api/boards/:id/clone` | Clone a board |
| POST | `/api/milestones` | Create a milestone |
| POST | `/api/lists` | Create a list |
| POST/PATCH/DELETE | `/api/cards` | Full card CRUD |
| GET | `/api/git/log` | Returns last 8 git commits |
| GET | `/api/docs/:doc_id` | Returns raw markdown for `charter`, `prd`, `guardrails`, `contract`, `playbook` |

### Restarting the Server
If you close the terminal, restart the server manually:

```bash
# Python
python3 ops/launch-command-deck/server.py --port {YOUR_PORT}

# Node.js
node ops/launch-command-deck/server.js --port {YOUR_PORT}
```

---

## The MCD Methodology

MCD (Micro-Contract Development) is a deterministic engineering framework for solo operators building software with AI agents. It eliminates scope creep and hallucination by requiring every code change to be explicitly authorized by a text-based contract.

### The 4-Phase Lifecycle

```
Evaluate → Contract → Execute → Closeout
```

**1. Evaluate** — *Understand before building.*
Assess the current state and write explicit evaluation findings. No code is written during this phase.
- **Output**: `evaluation_findings.md`

**2. Contract** — *Authorize the work.*
Draft a Micro-Contract specifying the exact files to change, the goal, and the acceptance criteria.
- **Output**: Timestamped Markdown in `referenceDocs/03_Contracts/active/` (e.g., `202602201400-CONTRACT_FEATURE_NAME.md`)
- **Rule**: The operator must approve the contract before execution begins.

**3. Execute** — *Build to specification.*
Implement exactly what the contract authorizes. If scope changes are needed, stop and amend the contract first.

**4. Closeout** — *Formalize the release.*
1. Archive the contract to `03_Contracts/archive/`
2. Write a closeout record in `05_Records/`
3. Git commit: `closeout: {VERSION} {brief description}`

> A version is **not** considered closed until the git commit is executed.

---

## Core Rules & Guardrails

These rules are embedded directly into your `GUARDRAILS.md` on scaffold:

1. **Local Only** *(applies to the Command Deck application)*: No cloud dependencies, no package managers during runtime. All logic executes natively on Python 3 or Node.js stdlib, or Vanilla JS/HTML/CSS in the browser.

2. **Mermaid.js Required**: All system architecture diagrams must be written in Mermaid.js syntax for version-controllable rendering. The Command Deck dashboard renders them natively.

3. **Immutability**: Once a contract is archived or a closeout record is written, it cannot be edited. Errors require a new remediation contract.

### Document Naming Convention
All project documents use a timestamp prefix:

```
YYYYMMDDHHMM-DOCUMENT_TITLE.md
```

**Exception**: `GUARDRAILS.md` retains its bare name for operator discoverability.

### Git Commit Format
```
closeout: {VERSION} {brief description}
```

---

## Technical Architecture

### Extension Modules

| File | Responsibility |
|------|---------------|
| `src/extension.ts` | Extension entry point. Registers `mcd.init` command. Detects workspaces without `referenceDocs/` and offers initialization. |
| `src/wizard.ts` | 5-step input wizard using VS Code's native `showInputBox` and `showQuickPick` APIs. Returns a typed `ProjectConfig` or `undefined` on cancellation. |
| `src/scaffolder.ts` | Core scaffold engine. Performs conflict detection, creates directories, writes governance docs, copies the Command Deck, handles git operations (init or branch), starts the server terminal, and opens the browser. |
| `src/templates/guardrails.ts` | Renders the full `GUARDRAILS.md` content as a string with project config values interpolated. |
| `src/templates/playbook.ts` | Returns the static `MCD_PLAYBOOK.md` content. |

### VS Code APIs Used

| API | Usage |
|-----|-------|
| `vscode.commands.registerCommand` | Registers the `mcd.init` command |
| `vscode.window.showInputBox` | Powers the wizard text prompts with validation |
| `vscode.window.showQuickPick` | Powers the server language and git branch selections |
| `vscode.window.showWarningMessage` | Displays the conflict detection modal |
| `vscode.workspace.fs` | Creates directories, writes files, and checks for existing paths |
| `vscode.window.createTerminal` | Opens integrated terminals for git and server operations |
| `vscode.env.openExternal` | Launches the browser to the Command Deck URL |
| `vscode.window.withProgress` | Shows a progress notification during scaffold build |

---

## Requirements

| Dependency | Version | Notes |
|---|---|---|
| VS Code | ≥ 1.85.0 | Required |
| Python 3 | ≥ 3.8 | Required if you select Python as the server language |
| Node.js | ≥ 16.0 | Required if you select Node.js as the server language |
| Git | Any | Must be installed for commit operations |

> **You only need one server runtime.** If you choose Python, Node.js is not required (and vice versa). Neither server uses any external packages — they run entirely on their respective standard libraries.

---

## Extension Commands

| Command | ID | Description |
|---|---|---|
| MCD: Initialize New Project | `mcd.init` | Runs the wizard and builds the full scaffold in the current workspace |

The command is also available via right-click on any folder in the VS Code Explorer sidebar.
