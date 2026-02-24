# CONTRACT: Documentation Rules Update

**Date:** 2026-02-24
**Status:** DRAFT (Awaiting Approval)
**Codename:** `BlackClaw`

## 1. Goal
Update the `AGENTS.md`, `CLAUDE.md`, and `.cursorrules` markdown documents—both locally in the current AmphionAgent repository and structurally within the `mcd-starter-kit-dev` generator templates—to remove the legacy `state.json` path references and enforce the new "Command Deck Board" terminology.

## 2. Affected File Paths (AFPs)
- `AGENTS.md` [MODIFY]
- `CLAUDE.md` [MODIFY]
- `.cursorrules` [MODIFY]
- `mcd-starter-kit-dev/extension/src/templates/adapters.ts` [MODIFY]
- `mcd-starter-kit-dev/extension/package.json` [MODIFY]

## 3. Scope & Execution Plan
1. **Local System Instruction Fixes:**
   - Update `AGENTS.md` (Line 24): Change Observability language to `"Always keep the Command Deck updated by creating cards in the Command Deck so you can monitor progress. (/board)"`
   - Update `CLAUDE.md` (Line 25): Apply the identical fix.
   - Update `.cursorrules` (Line 15 and Line 8): Apply the identical observability fix, and update the execution governance rule from "only change core files when there’s an active contract in referenceDocs/03_Contracts/active/." to "only change core files when there’s an active contract available".
2. **Template Generator Fixes:**
   - In `mcd-starter-kit-dev/extension/src/templates/adapters.ts`: Update `renderClaudeMd`, `renderAgentsMd`, and `renderCursorRules` to inject the new cleaned-up wording during scaffolding so that all new projects inherit the correct `sqlite3` agnostic phrasing.
3. **Version Bump:**
   - Increment `package.json` extension version to `1.26.4`.

## 4. Risk Assessment
- **Low Risk:** These are purely text string replacements in markdown documentation and hardcoded typescript template files. It has zero impact on application runtime logic.

## 5. Verification Plan
- Build and package the `v1.26.4` extension.
- Ask the user to re-run `/help` after the local files dictate the correct context.
