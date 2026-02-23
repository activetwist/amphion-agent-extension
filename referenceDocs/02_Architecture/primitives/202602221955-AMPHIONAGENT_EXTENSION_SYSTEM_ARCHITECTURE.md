# AmphionAgent Extension System Architecture

**Codename:** `BlackClaw`  
**Record Date:** 2026-02-22  
**Scope:** Extension runtime, scaffold pipeline, Command Deck subsystem, and governance artifact lifecycle.

---

## 1. Purpose

This primitive documents the AmphionAgent extension as a system: how VS Code activation, onboarding flows, scaffold generation, command adapters, Command Deck runtime, and governance records interoperate to implement MCD.

---

## 2. Runtime Topology

```mermaid
flowchart LR
  VSCode["VS Code Host"] --> EXT["AmphionAgent Extension\n(out/extension.js)"]
  EXT --> ONBOARD["Onboarding Webview\n(src/onboardingWebview.ts)"]
  ONBOARD --> SCAFFOLD["Scaffold Builder\n(src/scaffolder.ts)"]

  SCAFFOLD --> DOCS["referenceDocs/\nGovernance + Strategy + Contracts + Records"]
  SCAFFOLD --> ADAPTERS["IDE Adapters\n.agents/.cursor/.windsurf"]
  SCAFFOLD --> DECK["ops/launch-command-deck/\n(copied assets)"]

  ONBOARD --> WIZ["Strategy Generation\n(src/charterWizard.ts)"]
  WIZ --> STRAT["01_Strategy/*.md"]

  ONBOARD --> LAUNCH["launchCommandDeck()"]
  LAUNCH --> PY["server.py"]
  LAUNCH --> NODE["server.js"]

  PY --> STATE["data/state.json"]
  NODE --> STATE
  STATE --> UI["public/app.js + index.html + styles.css"]
  UI --> USER["Operator Browser Session"]
```

---

## 3. Scaffold Generation Pipeline

```mermaid
sequenceDiagram
  participant U as Operator
  participant V as VS Code
  participant E as Extension (mcd.init)
  participant O as Onboarding Webview
  participant S as buildScaffold
  participant G as Git

  U->>V: Run "MCD: Initialize New Project"
  V->>E: invoke mcd.init
  E->>O: create onboarding panel
  O->>S: startScaffold(config)
  S->>S: conflict checks + directory creation
  S->>S: write guardrails/playbook/mcd commands
  S->>S: deploy adapters (.agents/.cursor/.windsurf)
  S->>S: copy launch-command-deck assets
  S->>G: git init or branch prompt + scaffold commit
  O->>E: generate strategy path (manual/import)
  E->>O: launch command deck on selected runtime
```

---

## 4. Command Deck Service Architecture

```mermaid
flowchart TD
  UI["Command Deck SPA\n(public/app.js)"] --> API["HTTP JSON API\n(server.py OR server.js)"]
  API --> STORE["StateStore\n(in-memory snapshot + disk persistence)"]
  STORE --> FILE["data/state.json"]

  API --> DOCRES["Docs Resolver\nreferenceDocs/*"]
  API --> GITLOG["Git Log Reader\nlast commits"]

  UI --> ROUTES["Views\nBoard / Dashboard / MCD Guide"]
  UI --> THEME["Theme Persistence\nlocalStorage:mcd_theme"]
  UI --> POLL["State Version Polling\n/api/state/version"]
  UI --> RELOADBTN["Manual Reload\n/api/reload"]
```

---

## 5. Governance Artifact Lifecycle

```mermaid
flowchart LR
  EVAL["/evaluate\nFindings"] --> BOARD["/board\nCards + Contract Drafts"]
  BOARD --> CONTRACT["/contract\nApproved Scope"]
  CONTRACT --> EXECUTE["/execute\nImplementation + Verification"]
  EXECUTE --> CLOSEOUT["/closeout\nArchive + Records + Commit"]

  EVAL --> F04["04_Analysis/findings/"]
  BOARD --> STATE["ops/launch-command-deck/data/state.json"]
  CONTRACT --> C03A["03_Contracts/active/"]
  CLOSEOUT --> C03R["03_Contracts/archive/"]
  EXECUTE --> B05["05_Records/buildLogs/"]
  CLOSEOUT --> D05["05_Records/documentation/"]
```

---

## 6. Deterministic Boundaries and Invariants

- Extension command surface is intentionally narrow: one contributed command (`mcd.init`) with flow expansion handled in Webview and scaffolder.
- Scaffold is additive-by-design with conflict prompts for existing `referenceDocs/` and `ops/launch-command-deck/`.
- Command Deck backend is dual-runtime but API-compatible (`server.py` and `server.js`).
- Project governance is file-first and local-first: contracts/findings/records are persisted in-repo.
- State is deterministic and inspectable through `ops/launch-command-deck/data/state.json` with issue-number continuity.

---

## 7. Primary Implementation Anchors

- `mcd-starter-kit-dev/extension/src/extension.ts`
- `mcd-starter-kit-dev/extension/src/onboardingWebview.ts`
- `mcd-starter-kit-dev/extension/src/scaffolder.ts`
- `mcd-starter-kit-dev/extension/src/charterWizard.ts`
- `mcd-starter-kit-dev/extension/src/templates/commands.ts`
- `mcd-starter-kit-dev/extension/src/templates/adapters.ts`
- `ops/launch-command-deck/server.py`
- `ops/launch-command-deck/server.js`
- `ops/launch-command-deck/public/app.js`

