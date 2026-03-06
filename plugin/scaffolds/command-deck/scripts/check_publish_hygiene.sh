#!/usr/bin/env zsh
set -euo pipefail

ROOT="${1:-$(pwd)}"

cd "$ROOT"

echo "== Branch/Status =="
git rev-parse --abbrev-ref HEAD
git status --short

echo
echo "== Forbidden staged path scan =="
forbidden_regex='(^|/)(\.DS_Store|__pycache__/|.*\.pyc$|.*\.vsix$|ops/launch-command-deck/data/|mcd-starter-kit-dev/extension/assets/launch-command-deck/data/|\.amphion/archives/|\.amphion/migrations/|\.amphion/command-deck/data/|\.amphion/memory/agent-memory\.json)'

staged="$(git diff --cached --name-status || true)"
if [[ -z "$staged" ]]; then
  echo "No staged files."
  exit 0
fi

# Only enforce on staged paths that are added/modified/renamed/copied.
# Pure deletions are allowed because they reduce repository noise.
candidates="$(print -r -- "$staged" | awk '$1 != "D" {print $NF}')"
violations="$(print -r -- "$candidates" | rg -n "$forbidden_regex" || true)"
if [[ -n "$violations" ]]; then
  echo "Forbidden staged files detected:"
  echo "$violations"
  exit 2
fi

echo "Publish hygiene check passed."
