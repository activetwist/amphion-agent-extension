# AmphionAgent Evidence Index

**Purpose:** Map major claims in the totality record to verifiable source artifacts.  
**Date:** 2026-02-22  
**Companion Record:** `202602221955-AMPHIONAGENT_EXTENSION_TOTALITY_RECORD.md`

---

## 1. Product Identity and Packaging

| Claim ID | Claim | Evidence |
|---|---|---|
| E-001 | Extension identity is `amphion-agent` / `AmphionAgent` at `1.25.0` by publisher `active-twist`. | `mcd-starter-kit-dev/extension/package.json` |
| E-002 | Extension contributes command `mcd.init` titled `MCD: Initialize New Project`. | `mcd-starter-kit-dev/extension/package.json` |
| E-003 | Release artifacts include AmphionAgent and legacy MCD Starter Kit VSIX files. | `mcd-starter-kit-dev/extension/*.vsix` |

---

## 2. Extension Runtime and Onboarding

| Claim ID | Claim | Evidence |
|---|---|---|
| E-010 | Activation registers `mcd.init` and prompts initialization when `referenceDocs/` is absent. | `mcd-starter-kit-dev/extension/src/extension.ts` |
| E-011 | Onboarding flow is Webview-based and handles scaffold start, strategy path, clipboard, and deck launch. | `mcd-starter-kit-dev/extension/src/onboardingWebview.ts` |
| E-012 | Wizard captures 5 inputs: project name, runtime, codename, version, port. | `mcd-starter-kit-dev/extension/src/wizard.ts` |
| E-013 | Manual strategy path writes populated Charter/PRD docs and commits. | `mcd-starter-kit-dev/extension/src/charterWizard.ts` |
| E-014 | Source-doc path imports files to helper context and writes stub Charter/PRD for AI derivation. | `mcd-starter-kit-dev/extension/src/charterWizard.ts`, `mcd-starter-kit-dev/extension/src/templates/charterStub.ts`, `mcd-starter-kit-dev/extension/src/templates/prdStub.ts` |

---

## 3. Scaffold and Governance Generation

| Claim ID | Claim | Evidence |
|---|---|---|
| E-020 | Scaffold builder creates deterministic `referenceDocs/` hierarchy and IDE adapter folders. | `mcd-starter-kit-dev/extension/src/scaffolder.ts` (`DIRS`) |
| E-021 | Scaffold writes GUARDRAILS, playbook, and canonical MCD phase command files. | `mcd-starter-kit-dev/extension/src/scaffolder.ts`, `mcd-starter-kit-dev/extension/src/templates/guardrails.ts`, `mcd-starter-kit-dev/extension/src/templates/playbook.ts`, `mcd-starter-kit-dev/extension/src/templates/commands.ts` |
| E-022 | Scaffold deploys workflow adapters across `.agents`, `.cursor`, and `.windsurf`. | `mcd-starter-kit-dev/extension/src/scaffolder.ts`, `mcd-starter-kit-dev/extension/src/templates/adapters.ts` |
| E-023 | Scaffold performs conflict checks for existing `referenceDocs` and `ops/launch-command-deck`. | `mcd-starter-kit-dev/extension/src/scaffolder.ts` (`CONFLICT_CHECK_DIRS`) |
| E-024 | Git behavior supports new repo init or branch-safe flow for existing repos. | `mcd-starter-kit-dev/extension/src/scaffolder.ts` |

---

## 4. Command Deck Runtime and API

| Claim ID | Claim | Evidence |
|---|---|---|
| E-030 | Command Deck supports both Python and Node backends with same API surface intent. | `ops/launch-command-deck/server.py`, `ops/launch-command-deck/server.js`, `mcd-starter-kit-dev/extension/src/scaffolder.ts` |
| E-031 | API surface includes state, board/list/card/milestone CRUD, docs resolver, git log, reload, and health endpoints. | `ops/launch-command-deck/server.py`, `ops/launch-command-deck/server.js` |
| E-032 | UI exposes Board, Dashboard, and MCD Guide views. | `ops/launch-command-deck/public/index.html`, `ops/launch-command-deck/public/app.js` |
| E-033 | UI supports clone/export/import/reload board utilities. | `ops/launch-command-deck/public/index.html`, `ops/launch-command-deck/public/app.js` |
| E-034 | Deterministic issue-number badges are rendered from card `issueNumber`. | `ops/launch-command-deck/public/app.js`, `ops/launch-command-deck/server.py`, `ops/launch-command-deck/server.js` |
| E-035 | State auto-refresh uses `/api/state/version` polling and manual reload via `/api/reload`. | `ops/launch-command-deck/public/app.js`, `ops/launch-command-deck/server.py`, `ops/launch-command-deck/server.js` |
| E-036 | Theme persistence uses `localStorage` key `mcd_theme` and runtime toggle behavior. | `ops/launch-command-deck/public/index.html`, `ops/launch-command-deck/public/app.js` |

---

## 5. Governance, Contracts, and Pivots

| Claim ID | Claim | Evidence |
|---|---|---|
| E-040 | Major pivot arcs are represented by archived contract chain from CT-017 through v1.25.0 release hardening contracts. | `referenceDocs/03_Contracts/archive/*.md` |
| E-041 | Board command parity restoration is explicitly contracted and executed. | `referenceDocs/03_Contracts/archive/202602221721-CONTRACT_BOARD_COMMAND_PARITY.md`, `referenceDocs/05_Records/buildLogs/202602221721-EXECUTE_BOARD_COMMAND_PARITY.md` |
| E-042 | Playbook drift remediation and 1.25.0 rebuild are explicitly contracted and logged. | `referenceDocs/03_Contracts/archive/202602221802-CONTRACT_PLAYBOOK_DRIFT_REMEDIATE_REBUILD_1250.md`, `referenceDocs/05_Records/buildLogs/202602221802-EXECUTE_PLAYBOOK_DRIFT_REMEDIATE_REBUILD_1250.md` |
| E-043 | Marketplace/repo path hardening and extension-only repo workflow are explicitly documented. | `referenceDocs/03_Contracts/archive/202602221818-CONTRACT_EXTENSION_ONLY_REPO_AND_MARKETPLACE_PUBLISH.md`, `referenceDocs/05_Records/buildLogs/202602221818-EXECUTE_EXTENSION_ONLY_REPO_AND_MARKETPLACE_PUBLISH.md` |
| E-044 | v1.25.0 closeout includes consolidated contract resolution and release narrative. | `referenceDocs/05_Records/documentation/202602221920-CLOSEOUT_RECORD_v1_25_0_MARKETPLACE_RELEASE.md` |

---

## 6. Measured Outcomes and Development Metrics

| Claim ID | Claim | Evidence |
|---|---|---|
| E-050 | Active development time was measured at `9h 50m 32s (9.8422h)` using deterministic git-sessionized accounting. | `referenceDocs/04_Analysis/findings/202602221932-BUILD_GIT_TIME_ACCOUNTING_EVAL.md` |
| E-051 | Elapsed commit window was measured at `25h 35m 59s`. | `referenceDocs/04_Analysis/findings/202602221932-BUILD_GIT_TIME_ACCOUNTING_EVAL.md` |
| E-052 | Commit history shows extensive iterative evolution through version-tagged commit messages up to v1.25.0 closeout. | `git log --reverse --date=iso-strict` (project repository) |

---

## 7. Architecture and Totality Record Anchors

| Claim ID | Claim | Evidence |
|---|---|---|
| E-060 | System architecture is formally documented with Mermaid diagrams for extension, scaffold, deck runtime, and governance lifecycle. | `referenceDocs/02_Architecture/primitives/202602221955-AMPHIONAGENT_EXTENSION_SYSTEM_ARCHITECTURE.md` |
| E-061 | Comprehensive portfolio narrative and totality synthesis are consolidated in one master record. | `referenceDocs/05_Records/documentation/202602221955-AMPHIONAGENT_EXTENSION_TOTALITY_RECORD.md` |

---

## 8. Validation Notes

- When using this index externally, prefer file-level claims over summary claims.
- If a claim requires a numeric metric, cite the measurement artifact directly rather than paraphrasing from memory.
- For release/marketplace statements, pair closeout records with build logs and git history where possible.

