# AmphionAgent Command Reference

Complete guide to MCD commands across all supported environments.

---

## Command Availability Matrix

| Command | Claude Code | VS Code | Cursor | Windsurf | Antigravity | When Available |
|---------|:-----------:|:-------:|:------:|:--------:|:-----------:|---|
| `/amphion` | ✓ | ✓ | ✓ | ✓ | ✓ | Personal scope (personal) OR project scope (after init) |
| `/evaluate` | ✓ | ✓ | ✓ | ✓ | ✓ | Project scope (after `/amphion` init) |
| `/contract` | ✓ | ✓ | ✓ | ✓ | ✓ | Project scope (after `/amphion` init) |
| `/execute` | ✓ | ✓ | ✓ | ✓ | ✓ | Project scope (after `/amphion` init) |
| `/closeout` | ✓ | ✓ | ✓ | ✓ | ✓ | Project scope (after `/amphion` init) |
| `/help` | ✓ | ✓ | ✓ | ✓ | ✓ | Project scope (after `/amphion` init) |
| `/remember` | ✓ | ✓ | ✓ | ✓ | ✓ | Project scope (after `/amphion` init) |
| `/docs` | ✓ | ✓ | ✓ | ✓ | ✓ | Project scope (after `/amphion` init) |
| `/server` | ✓ | ✓ | ✓ | ✓ | ✓ | Project scope (after `/amphion` init) |

---

## Lifecycle Commands (MCD Phase 1-4)

### /evaluate — Phase 1: Research & Scoping
**Purpose:** Understand the problem, research the solution space, define scope.

**Availability:**
- Claude Code: Project scope (after `/amphion`)
- VS Code: Plugin (included in extension)
- Cursor, Windsurf, Antigravity: Plugin (included in extension)

**When to use:**
```
/ evaluate [feature or milestone to research]
```

**Output:** Findings artifact recorded in Command Deck DB. Halts for contract authorization.

---

### /contract — Phase 2: Planning & Agreement
**Purpose:** Define the "how" and secure operator approval before implementation.

**Availability:**
- Claude Code: Project scope (after `/amphion`)
- VS Code: Plugin (included in extension)
- Cursor, Windsurf, Antigravity: Plugin (included in extension)

**When to use:**
```
/contract
```

**Output:** Milestone-bound contract cards with acceptance criteria. Halts for execute authorization.

---

### /execute — Phase 3: Implementation & Verification
**Purpose:** Build exactly what the approved contract authorizes.

**Availability:**
- Claude Code: Project scope (after `/amphion`)
- VS Code: Plugin (included in extension)
- Cursor, Windsurf, Antigravity: Plugin (included in extension)

**When to use:**
```
/execute
```

**Output:** Implemented code, verified against acceptance criteria. Records execution outcomes.

---

### /closeout — Phase 4: Archiving & Release
**Purpose:** Verify outcomes, seal the version, commit the work.

**Availability:**
- Claude Code: Project scope (after `/amphion`)
- VS Code: Plugin (included in extension)
- Cursor, Windsurf, Antigravity: Plugin (included in extension)

**When to use:**
```
/closeout
```

**Output:** Outcomes artifact, archived milestone, git commit with `closeout:` prefix.

---

## Utility Commands

### /help — MCD Methodology Reference
**Purpose:** Get guidance on MCD, command usage, and governance.

**Availability:** Project scope (after `/amphion`)

**When to use:**
```
/help
```

---

### /remember — Operational Memory Checkpoint
**Purpose:** Capture compact operational context between sessions.

**Availability:** Project scope (after `/amphion`)

**When to use:**
```
/remember
```

---

### /docs — Generate Strategy Documents
**Purpose:** Create Project Charter and High-Level PRD.

**Availability:** Project scope (after `/amphion`)

**When to use:**
```
/docs
```

---

### /server — Manage Command Deck Runtime
**Purpose:** Start, stop, or check the local Command Deck server.

**Availability:** Project scope (after `/amphion`)

**When to use:**
```
/server start    # Launch the Command Deck in your browser
/server stop     # Stop the Command Deck server
/server status   # Check if the server is running
```

---

### /amphion — Initialize/Update Workspace
**Purpose:** Scaffold a new MCD workspace or update an existing one.

**Availability:**
- Claude Code: Personal scope (install to `~/.claude/commands/`) OR project scope
- VS Code: Plugin command
- Cursor, Windsurf, Antigravity: Plugin command

**When to use:**
```
/amphion                 # Initialize new workspace
/amphion [project-name]  # Specify project name during init
```

(If `.amphion/` already exists, runs environment update to sync with latest release.)

---

## Environment-Specific Notes

### Claude Code
- Commands are file-based skill definitions
- **Personal scope** (`~/.claude/commands/`): `/amphion` is typically installed here for one-time initialization
- **Project scope** (`.claude/commands/`): Other 8 commands are installed automatically by `/amphion` and available in every Claude Code session in that project
- MCP bridge connects to local Command Deck HTTP API via `.mcp.json` configuration

### VS Code
- Commands are registered in plugin via `package.json` contributes
- Available when the AmphionAgent plugin is installed
- All 9 commands available in any workspace that has `.amphion/` initialized

### Cursor, Windsurf, Antigravity
- Commands are registered in plugin via `package.json` contributes
- Available when the AmphionAgent plugin is installed (same as VS Code)
- All 9 commands available in any workspace that has `.amphion/` initialized

---

## Two-Phase Availability (Claude Code)

1. **Phase 1: Personal Scope (before init)**
   - Only `/amphion` is available (installed to `~/.claude/commands/`)
   - Available in every project you open

2. **Phase 2: Project Scope (after init)**
   - All 9 commands are available (installed to `.claude/commands/` in the project)
   - Only available within the specific project that has `.amphion/` initialized
   - Takes precedence over personal scope commands

---

## Troubleshooting

### Command Not Found
**Problem:** Typing `/evaluate` and Claude doesn't recognize it.

**Solution:**
- **Claude Code**: Ensure you've run `/amphion` in this project. It should have created `.claude/commands/` with all 9 skills.
- **VS Code/Cursor/Windsurf/Antigravity**: Ensure the AmphionAgent extension is installed and enabled.

### Command Shows But Fails with "No Workspace"
**Problem:** Command runs but immediately fails saying no `.amphion/` found.

**Solution:**
- Run `/amphion` first to initialize your workspace.
- All commands except `/amphion` require an initialized `.amphion/` directory.

### Newly Installed Skills Not Showing in Claude Code
**Problem:** Just ran `/amphion` but the other 8 commands don't appear.

**Solution:**
- Reload Claude Code or close and reopen the Chat interface.
- File-based skills can take a moment to be discovered after installation.
- Verify that `.claude/commands/` directory exists and contains all 9 `.md` files.

### Permission Errors When Writing to Command Deck
**Problem:** Error message about "permission denied" when running `/contract` or `/execute`.

**Solution:**
- The `.amphion/command-deck/` directory should have 777 permissions.
- If you have an older installation, run: `chmod -R 777 .amphion/command-deck/`
- This ensures agents and any subprocess can write to the board.

### Command Deck Server Won't Start
**Problem:** `/server start` fails or the server starts but isn't reachable.

**Solution:**
- Ensure Python 3 is installed: `python3 --version`
- Check that the configured port (in `.amphion/config.json`) isn't already in use
- Run: `/server status` to see error details

---

## Prerequisites per Environment

### All Environments
- **Python 3.x** — Required for the local Command Deck server (for `/server start`)
- **.amphion/ directory** — All commands except `/amphion` require an initialized workspace

### Claude Code
- **Claude Code** (any recent version)
- File write access to `~/.claude/commands/` (for personal scope `/amphion` install)
- File write access to `.claude/commands/` in your project (auto-created by `/amphion`)

### VS Code Extensions (Cursor, Windsurf, Antigravity, VS Code)
- **VS Code** 1.85.0 or later
- **AmphionAgent extension** installed and enabled from the marketplace
- **Python 3.x** for Command Deck runtime

---

## Getting Help

- **MCD Methodology**: Run `/help` in any project
- **Full eBook**: Visit [mcdbook.com](https://mcdbook.com) (free, ungated)
- **Creator**: [Stanton Brooks](https://linkedin.com/in/stanton-brooks)
- **Company**: [Active Twist Consulting Group](https://activetwist.com)
