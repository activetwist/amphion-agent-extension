# Contract: CT-033 Command Deck Toaster & Agent Rules Collisions (v1.13.0)

**Objective**: 
1. Introduce a one-time "toaster" notification in the Command Deck guiding users to explore the MCD Guide.
2. Prevent the MCD scaffolder from overwriting existing agent rule files (`.cursorrules`, `.clinerules`).

**Context**: 
When Command Deck launches, a subtle notification should warmly direct the user to the methodology guide. Concurrently, power users often already have agent instructions defined in `.cursorrules` or `.clinerules`. Currently, the scaffolder blindly overwrites them.

**Proposed Changes**:
1. **Command Deck Toaster (`index.html` & `app.js`)**:
   - Inject a styled `<div id="mcdWelcomeToast">` into the main `index.html` (both in source and the bundled assets directory).
   - In `app.js`, update `bootstrap()` to evaluate `localStorage.getItem("mcd_welcome_shown")`.
   - If missing, toggle the toaster visibility on, bind the dismiss button to hide it and set the flag, and trigger an auto-dismiss after 15 seconds.
2. **Safe Agent Rules Appending (`src/scaffolder.ts`)**:
   - Implement `async function appendOrWriteFile(root: vscode.Uri, relativePath: string, content: string)`.
   - The function will read the file if it exists. If the content doesn't already contain `--- MCD Governance Core Rules ---` (to prevent duplicate appends), it will append `\n\n# --- MCD Governance Core Rules ---\n\n` plus the rules.
   - Refactor the `.cursorrules` generation to use `appendOrWriteFile`.
   - Introduce explicitly calling `appendOrWriteFile` targeting `.clinerules` utilizing the exact same cursor rules template, securing compatibility for Cline/Roo Code users.

**Acceptance Criteria**:
- Scaffolding over an existing `.cursorrules` or `.clinerules` safely appends the MCD rules instead of destroying the file.
- The toaster appears exactly once on full workspace load.
- The toaster can be manually dismissed or safely auto-dismisses after 15 seconds.
