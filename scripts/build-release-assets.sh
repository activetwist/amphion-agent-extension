#!/usr/bin/env bash
# build-release-assets.sh
# Builds all three GitHub release assets for AmphionAgent:
#   1. amphion-agent-{version}.vsix  (VS Code extension package)
#   2. amphion-agent-claude-code.zip (Claude Code skill zip)
#   3. amphion.md                    (skill readme / install guide)
#
# Run from project root. Requires: node, npm, vsce (via npm run package), zip.
# Idempotent — safe to run multiple times.

set -euo pipefail

SCRIPT_DIR="$(cd "$(dirname "$0")" && pwd)"
PROJECT_ROOT="$(cd "$SCRIPT_DIR/.." && pwd)"

cd "$PROJECT_ROOT"

# Resolve version from package.json
VERSION=$(node -e "console.log(require('./package.json').version)")
if [ -z "$VERSION" ]; then
  echo "Error: could not read version from package.json" >&2
  exit 1
fi

echo "Building release assets for v${VERSION}..."

# --- 1. Claude Code skill zip ---
echo ""
echo "[1/3] Building amphion-agent-claude-code.zip..."
SKILL_SRC="plugin/skills/amphion/SKILL.md"
if [ ! -f "$SKILL_SRC" ]; then
  echo "Error: $SKILL_SRC not found" >&2
  exit 1
fi
cp "$SKILL_SRC" amphion.md
zip -q amphion-agent-claude-code.zip "$SKILL_SRC" amphion.md
echo "  -> amphion-agent-claude-code.zip ($(du -h amphion-agent-claude-code.zip | cut -f1))"
echo "  -> amphion.md ($(du -h amphion.md | cut -f1))"

# --- 2. VS Code extension package ---
echo ""
echo "[2/3] Building amphion-agent-${VERSION}.vsix..."
npm run package 2>&1 | tail -5
VSIX_FILE="amphion-agent-${VERSION}.vsix"
if [ ! -f "$VSIX_FILE" ]; then
  echo "Error: expected $VSIX_FILE not found after build" >&2
  exit 1
fi
echo "  -> $VSIX_FILE ($(du -h "$VSIX_FILE" | cut -f1))"

# --- Summary ---
echo ""
echo "Release assets ready for v${VERSION}:"
echo "  amphion-agent-${VERSION}.vsix"
echo "  amphion-agent-claude-code.zip"
echo "  amphion.md"
echo ""
echo "To upload to GitHub release:"
echo "  gh release upload v${VERSION} amphion-agent-${VERSION}.vsix amphion-agent-claude-code.zip amphion.md --repo activetwist/amphion-agent-extension"
