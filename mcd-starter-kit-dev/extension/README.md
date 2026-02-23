# AmphionAgent

AmphionAgent is a VS Code extension that scaffolds a complete Micro-Contract Development (MCD) workspace and launches a local Command Deck for planning and delivery.

## What It Creates

Running `MCD: Initialize New Project` generates:

- `referenceDocs/` governance structure (`00_Governance` through `05_Records`)
- Canonical MCD command docs (`EVALUATE`, `BOARD`, `CONTRACT`, `EXECUTE`, `CLOSEOUT`)
- IDE workflow artifacts (`.agents/workflows`, `.cursor/rules`, `.cursor/commands`)
- Local Command Deck app under `ops/launch-command-deck/`

The scaffold is additive and designed to work in both empty folders and existing repositories.

## Command Flow

AmphionAgent uses explicit slash-command phases:

1. `/evaluate` - research and scope
2. `/board` - create board cards and map contracts
3. `/contract` - define the approved implementation plan
4. `/execute` - implement only approved AFP scope
5. `/closeout` - archive and finalize release records

Each phase must halt and wait for explicit operator authorization before moving to the next.

## Install

### From VSIX

1. Open Extensions view in your IDE.
2. Use "Install from VSIX...".
3. Select the packaged file, for example:
   - `amphion-agent-1.24.4.vsix` (test build)
   - `amphion-agent-1.25.0.vsix` (current release line)

### Marketplace

Publisher: `active-twist`

## Requirements

- VS Code compatible host (or compatible IDE extension runtime)
- Git
- One local runtime for Command Deck server:
  - Python 3, or
  - Node.js

## Notes

- The Command Deck runs locally (`127.0.0.1`) and does not require cloud services.
- Architecture diagrams in governance docs are expected to use Mermaid.js.
