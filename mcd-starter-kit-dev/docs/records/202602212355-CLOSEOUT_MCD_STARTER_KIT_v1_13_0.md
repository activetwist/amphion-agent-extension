# Closeout Record: MCD Starter Kit v1.13.0 — Toaster & Agent Rules Collisions

**Date:** 2026-02-21
**Version:** `1.13.0` (CT-033)
**Status:** COMPLETED

## Summary of Changes

Introduced a first-time launch toaster notification to the Command Deck and implemented safe file-appending logic in the scaffolding orchestrator to avoid destroying existing agent rules.

### Command Deck Toaster
- **Action**: Modified `public/index.html` and `public/app.js` in the Command Deck source (and the corresponding compiled assets directory).
- **Implementation**: 
  - Added an elegant fixed-position HTML toast (`#mcdWelcomeToast`) welcoming the user to MCD and pointing them to the playbook.
  - Implemented `localStorage.getItem("mcd_welcome_shown")` inside the UI `bootstrap()` function to ensure the toast only fires on the very first board load.
  - Auto-dismisses after 15 seconds or upon manual click.
- **Result**: New users receive a subtle call to action pointing them toward the framework's philosophical documentation, vastly improving initial onboarding.

### Safe Agent Rules Appending
- **Action**: Modified `src/scaffolder.ts`.
- **Implementation**: 
  - Substituted the definitive `writeFile()` call for `.cursorrules` with a new `appendOrWriteFile()` network.
  - The script now uses `fs.readFile` to check for prior instructions. If instructions exist, it safely appends `\n\n# --- MCD Governance Core Rules ---\n\n` followed by the MCD framework guardrails, preserving the user's initial instructions context.
  - Duplicated this exact append call to target `.clinerules` as well.
- **Result**: Scaffolding over an existing repository containing Roo Code, Cline, or Cursor agent instructions will seamlessly add MCD governance logic *in addition to* the user's legacy protocols, ensuring the AI operates with the "best of both worlds."

## Verification Results

### Build Verification
- [x] Extension compiled via `tsc` with no errors.
- [x] `vsce package` generated `mcd-starter-kit-1.13.0.vsix`.

## Release Metadata
- **Modified Files**: `index.html`, `app.js`, `scaffolder.ts`, `package.json`.
- **Commit Hash**: `v1.13.0`
