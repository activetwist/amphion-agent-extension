---
type: CONTRACT
id: CT-038
date: 2026-02-23
status: DRAFT
objective: Server Launch Configuration Persistence (v1.25.9)
---

# CONTRACT: Server Launch Configuration Persistence

## 1. Goal
Ensure the Command Deck Dashboard WebView respects the user's selected port and language backend (Node vs. Python) when re-launching the server on an existing MCD project.

## 2. Affected File Paths (AFPs)
- `mcd-starter-kit-dev/extension/src/scaffolder.ts`
- `mcd-starter-kit-dev/extension/src/commandDeckDashboard.ts`
- `mcd-starter-kit-dev/extension/package.json`

## 3. Scope Boundaries
**In-Scope:**
- Modify `scaffolder.ts` to write `ops/amphion.json` containing the `{ port, serverLang, projectName, codename }` properties.
- Modify `commandDeckDashboard.ts` to attempt to parse `ops/amphion.json` when the `startServer` IPC message is received.
- Fallback to port `8765` and `node` if the config is unreadable.
- Bump version to `1.25.9` and package VSIX.

**Out-of-Scope:**
- Persisting settings inside `.vscode/settings.json`, as a discrete extension-specific state file (`amphion.json`) keeps the implementation simpler and decoupled from VS Code's global settings API.

## 4. Execution Plan
1. **Scaffolding:** In `buildScaffold()` inside `scaffolder.ts`, generate `ops/amphion.json` using `JSON.stringify()`.
2. **Dashboard Initialization:** In the `startServer` switch case in `commandDeckDashboard.ts`, read the file dynamically using `vscode.workspace.fs.readFile(configUri)`.
3. **Release:** Bump `package.json` to `1.25.9` and execute `npm run package`.
4. **Validation:** Initialize a new project, kill the server, re-launch via the "Launch Command Deck" button, and verify the correct port and language are used.

## 5. Risk Assessment
- **Severity:** Low. Safely adds a configuration file step and uses a `try/catch` fallback in the dashboard to ensure backward compatibility.

## 6. Acceptance Criteria
- [ ] New project scaffolds generate `ops/amphion.json` with the chosen port and backend language.
- [ ] Clicking "Server Start" after stopping the server reads the port and target binary accurately, instead of hardcoding `8765`.
- [ ] Build `1.25.9` compiles successfully.
