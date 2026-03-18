#!/usr/bin/env bash
# build-release-assets.sh
# Builds all three GitHub release assets for AmphionAgent and publishes to registries:
#   1. amphion-agent-{version}.vsix  (VS Code extension package)
#   2. amphion-agent-claude-code.zip (Claude Code skill zip)
#   3. amphion.md                    (skill readme / install guide)
#
# Publish targets (requires PATs in .env or environment):
#   - VS Code Marketplace: VSCE_PAT
#   - Open VSX Registry:   OVSX_PAT
#
# Run from project root. Requires: node, npm, vsce, ovsx, zip.
# Pass --skip-publish to build assets only without publishing.
# Idempotent — safe to run multiple times.

set -euo pipefail

SCRIPT_DIR="$(cd "$(dirname "$0")" && pwd)"
PROJECT_ROOT="$(cd "$SCRIPT_DIR/.." && pwd)"

cd "$PROJECT_ROOT"

# Parse flags
SKIP_PUBLISH=false
for arg in "$@"; do
  case "$arg" in
    --skip-publish) SKIP_PUBLISH=true ;;
  esac
done

# Load .env if present (won't override already-set env vars)
if [ -f ".env" ]; then
  set -a
  # shellcheck disable=SC1091
  source .env
  set +a
fi

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

# --- 3. Publish ---
if [ "$SKIP_PUBLISH" = true ]; then
  echo ""
  echo "[3/3] Skipping publish (--skip-publish)"
else
  echo ""
  echo "[3/3] Publishing..."

  # VS Code Marketplace
  if [ -z "${VSCE_PAT:-}" ]; then
    echo "  [WARN] VSCE_PAT not set — skipping VS Code Marketplace publish"
  else
    echo "  Publishing to VS Code Marketplace..."
    VSCE_PAT="$VSCE_PAT" npx vsce publish --packagePath "$VSIX_FILE" 2>&1 | tail -3
    echo "  -> VS Code Marketplace ✓"
  fi

  # Open VSX
  if [ -z "${OVSX_PAT:-}" ]; then
    echo "  [WARN] OVSX_PAT not set — skipping Open VSX publish"
  else
    echo "  Publishing to Open VSX..."
    npx ovsx publish "$VSIX_FILE" -p "$OVSX_PAT" 2>&1 | tail -3
    echo "  -> Open VSX ✓"
  fi
fi

# --- Summary ---
echo ""
echo "Release assets ready for v${VERSION}:"
echo "  amphion-agent-${VERSION}.vsix"
echo "  amphion-agent-claude-code.zip"
echo "  amphion.md"
echo ""
echo "To upload to GitHub release:"
echo "  gh release upload v${VERSION} amphion-agent-${VERSION}.vsix amphion-agent-claude-code.zip amphion.md --repo activetwist/amphion-agent-extension"
