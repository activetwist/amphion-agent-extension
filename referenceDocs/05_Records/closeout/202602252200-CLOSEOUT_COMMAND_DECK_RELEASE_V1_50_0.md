# CLOSEOUT: Amphion Command Deck Release v1.50.0

**Date:** 2026-02-25  
**Version:** `1.50.0`  
**Codename:** `BLACKCLAW`  
**Phase:** Closeout (Archiving & Release)

## Scope Closed
- Version finalization for **1.50.0**.
- Continuity file updated to reflect current release and package path.
- DB-backed memory checkpoint recorded for closeout and package.

## Memory Checkpoint (DB-backed)
Recorded closeout events via `POST /api/memory/events` (sourceType: verified-system):
- `phase.intent.closeout` — closeout phase intent for 1.50.0.
- `release.closeout.v1_50_0` — version closed, artifact amphion-agent-1.50.0.vsix.
- `release.package.v1_50_0` — package built, status recorded.

Verification:
- `/api/memory/query?q=v1_50_0`
- `/api/memory/query?q=release.package.v1_50_0`

Compatibility export (optional): `referenceDocs/06_AgentMemory/agent-memory.json` — update via `POST /api/memory/export` when needed.

## Artifacts Updated
- `CONTINUITY_V2.md` — current release set to 1.50.0; package path `mcd-starter-kit-dev/extension/amphion-agent-1.50.0.vsix` documented.
- `ops/amphion.json` — `mcdVersion`: `1.50.0` (already set).
- `mcd-starter-kit-dev/extension/package.json` — `version`: `1.50.0` (already set).

## Release Artifact
- Package: `mcd-starter-kit-dev/extension/amphion-agent-1.50.0.vsix` (local; `*.vsix` gitignored).

## Validation
- Closeout hygiene: run `ops/launch-command-deck/scripts/check_publish_hygiene.sh` before commit (forbidden staged path scan).

## Git
Release commit: `closeout: 1.50.0 {brief description}`
