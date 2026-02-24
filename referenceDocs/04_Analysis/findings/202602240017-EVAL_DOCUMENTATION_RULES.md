# EVALUATE: Documentation Rules Update

**Phase: 1 (Research & Scoping)**
**Date:** 2026-02-24
**Focus:** Updating the canonical Agent system context instructions to align with the new Command Deck SQLite architecture.

## 1. Research & Analysis
- **The Issue:** When the user interacted with the new `/help` command, the AmphionAgent hallucinated and regurgitated outdated instructions. Specifically, the agent output:
  - *"Keep the Command Deck updated by writing cards to ops/launch-command-deck/data/state.json so you can track progress."*
  - *"Follow governance... and only change core files when there’s an active contract in referenceDocs/03_Contracts/active/."*
- **The Source:** This text is not coming from the newly created `help.md` workflow itself, but rather from the persistent system instructions injected into every AI agent context window across the IDE ecosystem. The outdated `state.json` file path is explicitly codified in:
  - `AGENTS.md`
  - `CLAUDE.md`
  - `.cursorrules`
- Furthermore, the root templates that generate these files for *all new projects* are located in `mcd-starter-kit-dev/extension/src/templates/adapters.ts`.

## 2. Gap Analysis
The "Observability" directive currently instructs the agent to write JSON files which have been deprecated in favor of the new Python/SQLite backend. The prompt itself needs to be updated to match the user's requested wording exactly.

## 3. Scoping Boundaries
**In-Scope:**
- Modifying `mcd-starter-kit-dev/extension/src/templates/adapters.ts` (lines ~103, ~131, ~150) to change the default observability rule to:
  `2. **Observability**: Always keep the Command Deck updated by creating cards in the Command Deck so you can monitor progress. (/board)`
- Modifying the same file to update the Operational Rules bullet point regarding core file changes to explicitly state:
  `Follow governance and only change core files when there’s an active contract available`
- Modifying the *local* `AGENTS.md`, `CLAUDE.md`, and `.cursorrules` files in this current project root to reflect these exact same changes so the agent stops hallucinating in this specific conversational context immediately.
- Re-compiling the `mcd-starter-kit-dev` extension and bumping the build version to deploy this template fix to all future projects.

**Out-of-Scope:**
- Modifying the actual node generation script or the backend; this is strictly an updating of markdown/string templates.

## 4. Primitive Review
- N/A. No new architecture primitives needed.

## 5. Next Steps
Would you like to populate the Command Board or build a contract based on these findings?
