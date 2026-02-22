# Micro-Contract Development (MCD) Scaffold v2

**Role:** Technical Project Lead / DevOps  
**Task:** Initialize a new project scaffold using the MCD standard with a drop-in Launch Command Deck.

## 1. Context Collection (Required)
Before any file operations, collect:
1. **Project Name** (example: `Acme Platform`)
2. **Codename** (example: `Genesis`)
3. **Initial Version** (default: `v0.01a`)
4. **Git Preference** (`Local Only` OR `Remote/GitHub`)
5. **Command Deck Zip Path** (absolute path to sanitized zip)
6. **Command Deck Port** (default: `8765`, must be user-selected)

## 2. Directory Construction
Create the project scaffold:

```bash
mkdir -p referenceDocs/00_Governance
mkdir -p referenceDocs/01_Strategy
mkdir -p referenceDocs/02_Architecture/primitives
mkdir -p referenceDocs/03_Contracts/active
mkdir -p referenceDocs/03_Contracts/archive
mkdir -p referenceDocs/04_Analysis/findings
mkdir -p referenceDocs/04_Analysis/scripts
mkdir -p referenceDocs/05_Records/buildLogs
mkdir -p referenceDocs/05_Records/chatLogs
mkdir -p referenceDocs/05_Records/documentation/helperContext
mkdir -p ops
```

## 3. Guardrails Generation
Create `referenceDocs/00_Governance/GUARDRAILS.md` by writing the following template with `{PROJECT_NAME}`, `{CODENAME}`, and `{INITIAL_VERSION}` replaced dynamically:

````markdown
# {PROJECT_NAME} - Governance Guardrails

Codename: `{CODENAME}`
Initial Version: `{INITIAL_VERSION}`

## Execution Model
All work follows this strict sequence:
1. Evaluate
2. Contract
3. Execute

No phase skipping is permitted.

## Phase Rules
### 1) Evaluate
- Define objective, scope, constraints, and assumptions.
- Do not produce implementation code in this phase.
- Capture risks and unknowns before committing execution steps.

### 2) Contract
- Create or reference an explicit contract before modifying core files.
- Contracts must include acceptance criteria and affected file paths.
- If a request conflicts with an active contract, stop and flag the conflict.

### 3) Execute
- Implement only what the active contract authorizes.
- Keep versioning and build naming deterministic.
- Record meaningful changes and outcomes in project records.

## Closeout Procedure
Closeout is a governed step that follows the completion of all contracted work within a version. A version is not considered closed until all of the following are satisfied:

### Closeout Requirements
1. **Contracts resolved**: All active contracts have been executed and archived to `03_Contracts/archive/`.
2. **Compliance verified**: The compliance checklist below has been reviewed and all items pass.
3. **Closeout record written**: A closeout record has been created in `05_Records/` documenting contracts executed, deliverables produced, and compliance status.
4. **Artifacts staged**: All generated artifacts are present and accounted for, including:
   - Updated strategy/architecture/governance documents
   - Build logs (`05_Records/buildLogs/`)
   - Chat logs (`05_Records/chatLogs/`)
   - Closeout record (`05_Records/`)
5. **Git commit**: A commit must be made with all artifacts staged. No version closeout is valid without a committed state.

### Commit Message Format
Closeout commits must follow this deterministic format:

```
closeout: {VERSION} {brief description}
```

The commit body should list contracts executed, files changed, and any notable decisions.

## Document Naming Convention
All project documents must be prefixed with a creation/revision timestamp in the following format:

```
YYYYMMDDHHMM-[DOCUMENT_TITLE].md
```

- `YYYY`: Four-digit year
- `MM`: Two-digit month
- `DD`: Two-digit day
- `HH`: Two-digit hour (24-hour format)
- `MM`: Two-digit minute

This convention applies to all documents across all reference directories (Governance, Strategy, Architecture, Contracts, Records). When a document is substantively revised, it receives a new timestamp prefix reflecting the revision time.

**Exception**: `GUARDRAILS.md` retains its basename without timestamp prefix for operator discoverability.

## Documentation Standards
- **Architecture Diagrams**: All system architecture diagrams and flowcharts must be written natively using `Mermaid.js` syntax. Visualizing architectures via text allows diagrams to be version-controlled, easily reproducible, and rendered directly within the Command Deck dashboard.

## Change Safety
- Core file modifications require a referenced active contract.
- Uncontracted work must be deferred until contract approval.
- Unexpected repository changes should be surfaced before continuing.

## Compliance Checklist
- [ ] Current phase is explicit.
- [ ] Contract exists for core-file changes.
- [ ] Work matches contract scope.
- [ ] Naming/versioning remains deterministic.
- [ ] Document naming convention followed (YYYYMMDDHHMM prefix).
- [ ] Conflicts with active contracts have been flagged.
- [ ] Closeout record exists (when closing a version).
- [ ] Git commit completed with all artifacts staged (when closing a version).
````
EOF
echo "Created GUARDRAILS.md"

# Generate MCD Playbook
cat << 'EOF' > referenceDocs/00_Governance/MCD_PLAYBOOK.md
# The Micro-Contract Development (MCD) Playbook

Welcome to the **Command Deck**. This platform operates on the Micro-Contract Development (MCD) methodology. MCD is designed for solo operators working with advanced AI agents. 

The core philosophy is **Deterministic Versioning**: zero hallucination, zero scope creep, and total traceability. Every line of code written must be explicitly authorized by a text-based contract.

## The 4-Phase Lifecycle

### 1. Evaluate
*Understand before building.*
- **Action**: Assess the current state, read documentation, and write an explicit evaluation of what needs to be built and why.
- **Output**: `evaluation_findings.md`
- **Rule**: No code is written during Evaluation. No tests are run unless explicitly needed for the assessment.

### 2. Contract
*Authorize the work.*
- **Action**: Draft a Micro-Contract detailing the exact files to be changed, the goal to be achieved, and the acceptance criteria.
- **Output**: A timestamped Markdown file in `referenceDocs/03_Contracts/active/` (e.g., `202602201400-CONTRACT_FEATURE_NAME.md`)
- **Rule**: The operator must approve the contract before the agent proceeds to Execution.

### 3. Execute
*Build to specification.*
- **Action**: The agent executes the approved Micro-Contract. Backend logic, frontend UI, or systemic changes are implemented exactly as defined.
- **Rule**: If a roadblock is hit that requires changing the *scope* of the contract, execution stops and the contract is amended (or a new one written).

### 4. Closeout
*Formalize the release.*
- **Action**: Verify the acceptance criteria against the build.
- **Output**: 
  1. Archive the active contract to `03_Contracts/archive/`.
  2. Write a Closeout Record in `05_Records/` summarizing the finalized state.
  3. Git Commit with all artifacts staged in the format `closeout: {VERSION} {brief description}`.
- **Rule**: A version is absolutely not considered closed until the git commit is completely executed.

## Core Rules (`GUARDRAILS.md`)
1. **Local Only**: Applies strictly to the Command Deck application. No cloud dependencies, no package managers (NPM, Pip) during runtime. All logic must execute natively on Python 3 or Vanilla JS/HTML/CSS in the browser.
2. **Mermaid.js Required**: All system logic diagrams must be built natively in Markdown using Mermaid.js syntax for version-controllable rendering.
3. **Immutability**: Once a contract is archived or a closeout record is written, it cannot be edited. Errors require a new remediation contract.
EOF
echo "Created MCD_PLAYBOOK.md"

## 4. Launch Command Deck Bootstrap (New)

### 4.1 Unzip deck
Unpack the sanitized deck zip into canonical location:

```bash
unzip -q "{COMMAND_DECK_ZIP_PATH}" -d ops
```

Expected output location:
- `ops/launch-command-deck/`

### 4.2 Canonicalize board for project
Initialize deck state for this project:

```bash
python3 ops/launch-command-deck/scripts/init_command_deck.py \
  --project-name "{PROJECT_NAME}" \
  --codename "{CODENAME}" \
  --initial-version "{INITIAL_VERSION}" \
  --milestone-title "Version 0a Pre-Release" \
  --seed-template scaffold
```

Expected board name:
- `{PROJECT_NAME} Launch Command Deck`

### 4.3 Port check + run
Before starting, check whether the selected port is already bound.

macOS/Linux quick check:

```bash
lsof -iTCP:{COMMAND_DECK_PORT} -sTCP:LISTEN -n -P
```

If occupied, ask user for a new port and do not force-kill by default.

Start deck server:

```bash
KANBAN_PORT={COMMAND_DECK_PORT} ops/launch-command-deck/run.sh
```

Expected URL:
- `http://127.0.0.1:{COMMAND_DECK_PORT}`

## 5. Guide Protocol (Post-setup)
Immediately guide user through:
1. **Project Intent** -> generate `referenceDocs/01_Strategy/PROJECT_CHARTER.md`
2. **Product Strategy** -> generate `referenceDocs/01_Strategy/HIGH_LEVEL_PRD.md`
3. **System Definition** -> generate `referenceDocs/02_Architecture/SYSTEM_ARCHITECTURE.md`

## 6. Git Initialization

### If Local Only
1. `git init`
2. Create `.gitignore` (Node/React/Python baseline)
3. Stage `referenceDocs/` and `ops/launch-command-deck/`
4. Commit:
   - `chore(init): {CODENAME} scaffold - establish guardrails + command deck`

### If Remote/GitHub
1. Ask for remote URL
2. `git init`
3. Create `.gitignore`
4. Stage `referenceDocs/` and `ops/launch-command-deck/`
5. Commit:
   - `chore(init): {CODENAME} scaffold - establish guardrails + command deck`
6. `git branch -M main`
7. `git remote add origin [URL]`
8. Attempt `git push -u origin main`
   - If auth fails, pause and provide auth remediation steps.

## 7. Hard Rules
1. No implementation code during **Evaluate**.
2. No core file modifications without a referenced contract during build phases.
3. Keep version and build naming deterministic.
4. If request conflicts with active contract, flag before proceeding.
5. For deck startup, always ask/select port instead of assuming `8765`.
6. Version closeout requires a git commit with all artifacts staged — no closeout is valid without a committed state.
7. System architecture diagrams must be written using `Mermaid.js` syntax.

## 8. Execution Trigger
Ask for context collection details now, then execute scaffold end-to-end.
