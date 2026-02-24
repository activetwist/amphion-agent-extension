# EVALUATE: VS Code Webview UI for AmphionAgent

**Phase:** 1 (Research & Scoping)
**Date:** 2026-02-23

## 1. Research & Analysis
- **Current State**: The AmphionAgent extension currently surfaces a `WebviewPanel` (via `onboardingWebview.ts`) when the `mcd.init` command is run. This panel acts as an onboarding/wizard experience for setting up the scaffolding.
- **User Request**: Introduce a persistent UI inside the VS Code environment to interact with extension capabilities seamlessly. Specifically:
  - Access Help
  - Initiate commands (MCD phases)
  - Launch/manage the server (Command Deck server)
  - Eliminate non-native IDE files (cleanup actions)
  - Link directly to Project Charter / PRD
  - General quick links

## 2. Gap Analysis
- The existing `OnboardingPanel` is transient (only shown on init or explicit trigger). While it takes up a full editor tab, there is no permanent or easily re-openable "Command Deck" Dashboard tailored to the developer's ongoing workflow.
- Visual reference provided by the user shows a rich, full-pane Editor Webview (a `WebviewPanel`) containing a grid of agent "personas" (Maestro, Zeno, Apollo, etc.) alongside a "Command Flow" list.
- No existing UI aggregates MCD commands, project artifact links, and server management in one place.

## 3. Scoping
**In-Scope:**
- Implementing a new rich `WebviewPanel` (Editor Tab) specifically for the ongoing "Command Deck" / Dashboard experience (comparable to the visual reference).
- Building the UI (HTML/CSS/JS) for this Panel to include a grid/dashboard layout featuring:
  - Command execution buttons (e.g., `/evaluate`, `/board`, `/contract`, `/execute`, `/closeout`)
  - Server management controls (Start/Stop Command Deck Server)
  - Quick links to `PROJECT_CHARTER.md` and `HIGH_LEVEL_PRD.md`
  - Help/Documentation links
  - Utility actions (e.g., "Eliminate non-native IDE files")
- Registering the necessary commands in `package.json` to back these UI actions.

**Out-of-Scope:**
- Replacing the existing `onboardingWebview.ts`; the wizard is still needed for initial project setup. The new Command Deck UI will be a separate, persistent dashboard.
- Creating the actual autonomous agent logic for the personas shown in the visual reference (assuming we are just building the UI scaffold/links to existing capabilities for now).

## 4. Primitive Review
- **Required Primitives**: A new UI architecture primitive for a persistent `WebviewPanel` (Editor Dashboard) is required.
  - E.g., `src/commandDeckDashboard.ts` that manages a singleton `vscode.WebviewPanel`.
- Updates to `package.json` `contributes.commands` to add a new command (e.g., `mcd.openDashboard`) that launches this UI natively inside the IDE.
