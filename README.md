# AmphionAgent

AmphionAgent is a VS Code extension for teams using AI to build software with tighter control. It scaffolds a complete Micro-Contract Development (MCD) workspace, enforces phase-gated execution, and launches a local Command Deck for planning, traceability, and release discipline.

## Who It's For

- Teams using AI assistants that need deterministic planning and approval gates
- Product/engineering operators who want execution traceability from evaluation through closeout
- Projects where governance artifacts must be created and maintained alongside code

## What You Get in <5 Minutes

Running `MCD: Initialize New Project` generates:
- `referenceDocs/` governance structure (`00_Governance` through `06_AgentMemory`)
- Canonical MCD command docs (`EVALUATE`, `BOARD`, `CONTRACT`, `EXECUTE`, `CLOSEOUT`, `REMEMBER`)
- IDE workflow artifacts (`.agents/workflows`, `.cursor/rules`, `.cursor/commands`)
- Local Command Deck app under `ops/launch-command-deck/`
- Operator-gated workflow where each phase halts until explicit authorization

The scaffold is additive and works in both empty folders and existing repositories.

## How It Works

AmphionAgent uses explicit slash-command phases:

1. `/evaluate` - research and scope
2. `/board` - create board cards and map contracts
3. `/contract` - define the approved implementation plan
4. `/execute` - implement only approved AFP scope
5. `/closeout` - archive and finalize release records

Each phase must halt and wait for explicit operator authorization before moving to the next.

## Screenshots

### Project Onboarding
![Project Onboarding](./media/screenshots/20260224/01-Project-Onboarding.png)
Guided setup for project identity, codename, version, and local Command Deck configuration.

### Command Deck Board
![Command Deck Board](./media/screenshots/20260224/02-Kanban-Board.png)
Kanban-style board for contracts, milestones, and operator-visible execution flow.

### Charts Viewer
![Charts Viewer](./media/screenshots/20260224/04-Charts-Viewer.png)
Built-in charts surface for Mermaid architecture and information flow visualization.

### IDE Control Panel
![IDE Control Panel](./media/screenshots/20260224/05-IDE-Control-Panel.png)
In-IDE command flow and server controls for running MCD from the development environment.

## Install

### From VSIX

1. Open Extensions view in your IDE.
2. Use "Install from VSIX...".
3. Select the packaged file, for example:
   - `amphion-agent-1.28.1.vsix` (current release line)

### Marketplace

Publisher: `active-twist`

## Requirements

- AI-Enabled VS Code-based IDE
- Git
- Local runtime for Command Deck server: Python 3

## Notes

- The Command Deck runs locally (`127.0.0.1`) and does not require cloud services.
- Architecture diagrams in governance docs are expected to use Mermaid.js.
