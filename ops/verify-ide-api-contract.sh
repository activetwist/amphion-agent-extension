#!/usr/bin/env bash
set -euo pipefail

ROOT="$(cd "$(dirname "${BASH_SOURCE[0]}")/.." && pwd)"
cd "$ROOT"

failures=0

require_file() {
    local file="$1"
    if [[ ! -f "$file" ]]; then
        echo "FAIL: missing file: $file"
        failures=$((failures + 1))
    fi
}

require_contains() {
    local file="$1"
    local needle="$2"
    if ! grep -Fq "$needle" "$file"; then
        echo "FAIL: missing required text in $file -> $needle"
        failures=$((failures + 1))
    fi
}

require_heading_once() {
    local file="$1"
    local heading="$2"
    local count
    count="$(rg -n "^${heading}$" "$file" | wc -l | tr -d ' ')"
    if [[ "$count" != "1" ]]; then
        echo "FAIL: expected heading '${heading}' exactly once in $file (found $count)"
        failures=$((failures + 1))
    fi
}

core_surfaces=(
    ".cursorrules"
    ".clinerules"
    "AGENTS.md"
    "CLAUDE.md"
)

for file in "${core_surfaces[@]}"; do
    require_file "$file"
done

for file in "${core_surfaces[@]}"; do
    [[ -f "$file" ]] || continue
    require_contains "$file" "ALL board writes MUST use the Command Deck API"
    require_contains "$file" ".amphion/config.json"
    require_contains "$file" "config.json does not exist"
    require_contains "$file" "http://127.0.0.1:{resolvedPort}"
    require_contains "$file" "GET /api/conventions?intent={type}"
    require_contains "$file" "GET /api/conventions"
done

require_heading_once ".cursorrules" "## Command Deck API"
require_heading_once ".clinerules" "## Command Deck API"
require_heading_once "AGENTS.md" "## Command Deck API"
require_heading_once "CLAUDE.md" "## Command Deck API"

cursor_api_surfaces=(
    ".cursor/rules/command-deck-api.mdc"
    ".cursor/commands/command-deck-api.md"
)

for file in "${cursor_api_surfaces[@]}"; do
    require_file "$file"
done

for file in "${cursor_api_surfaces[@]}"; do
    [[ -f "$file" ]] || continue
    require_contains "$file" "GET /api/conventions?intent={type}"
    require_contains "$file" ".amphion/config.json"
    require_contains "$file" "http://127.0.0.1:{resolvedPort}"
    require_contains "$file" "Never write SQLite/files directly"
done

if [[ "$failures" -gt 0 ]]; then
    echo "verify-ide-api-contract: FAILED ($failures issue(s))"
    exit 1
fi

echo "verify-ide-api-contract: OK"
