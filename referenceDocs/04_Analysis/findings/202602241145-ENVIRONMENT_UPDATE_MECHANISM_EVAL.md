# EVALUATE: Environment Update Mechanism (BlackClaw)

## 1. Research & Analysis
The goal is to ensure that when a user updates the Amphion Agent extension, they are prompted to update their local MCD environment (the `referenceDocs`, `ops`, and adapter files).

**Findings:**
1.  **Version Source**: The extension version is managed in `package.json` (currently `1.28.1`).
2.  **Environment Tracking**: The project currently uses `ops/amphion.json` to store project metadata (port, codename, etc.), but it lacks a version field to track which version of the MCD environment is actually installed.
3.  **Activation Hook**: `extension.ts` has an existing check for `referenceDocs` on activation, making it the perfect place to inject a version comparison.
4.  **Template Management**: Core governance files (`GUARDRAILS.md`, `MCD_PLAYBOOK.md`, and command definitions) and IDE adapters (`CLAUDE.md`, `.cursorrules`, etc.) are generated from TypeScript templates within the extension. These are the primary targets for updates.

## 2. Gap Analysis
- No version tracking within the scaffolded project.
- No automated comparison between the installed environment and the extension version.
- No dedicated migration/update function to synchronize stale project files with updated extension templates.

## 3. Scoping
**In-Scope:**
- Modify `ops/amphion.json` to include an `mcdVersion` field.
- Update `extension.ts` to perform a version check on activation if `referenceDocs` exists.
- Implement a `migrateEnvironment` function in `scaffolder.ts` to:
    - Perform a `git status` check (warn if dirty).
    - Overwrite core governance, command, and adapter files using the latest templates.
    - Update `ops/amphion.json` to the new version.
- Create a VS Code information prompt with a recommendation to use git for rollback safety.

**Out-of-Scope:**
- Modifying user-generated records (Charter, PRD, Contracts).
- Removing directories (non-destructive goal).
- Automated git committing (will recommend manual commit with a suggested message).

## 4. Primitive Review
No new architecture primitives required. Leverages existing `ProjectConfig` and `scaffolder.ts` patterns.

## 5. HALT AND PRESENT
Evaluation complete. The proposed plan establishes a robust "self-healing" environment that stays in sync with marketplace updates while respecting user changes via git-aware prompts.

Would you like to populate the Command Board or build a contract based on these findings?
