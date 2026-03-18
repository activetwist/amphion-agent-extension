#!/usr/bin/env bash
# sync-plugin-scaffolds.sh
# Pre-renders TypeScript templates into plugin/scaffolds/ using compiled output.
# Copies Command Deck runtime files for /init scaffolding.
# Idempotent — safe to run multiple times.

set -euo pipefail

SCRIPT_DIR="$(cd "$(dirname "$0")" && pwd)"
PROJECT_ROOT="$(cd "$SCRIPT_DIR/.." && pwd)"
PLUGIN_DIR="$PROJECT_ROOT/plugin"
SCAFFOLDS_DIR="$PLUGIN_DIR/scaffolds"

# Ensure compiled output exists
if [ ! -f "$PROJECT_ROOT/out/templates/commands.js" ]; then
  echo "Error: Compiled output not found. Run 'npm run compile' first."
  exit 1
fi

echo "Syncing plugin scaffolds..."

# --- 1. Render templates via Node.js ---
node -e "
const commands = require('./out/templates/commands');
const guardrails = require('./out/templates/guardrails');
const playbook = require('./out/templates/playbook');
const adapters = require('./out/templates/adapters');
const fs = require('fs');
const path = require('path');

const placeholderConfig = {
  projectName: '{{PROJECT_NAME}}',
  codename: '{{CODENAME}}',
  initialVersion: '{{INITIAL_VERSION}}',
  port: '{{PORT}}',
  serverLang: 'python',
};

const scaffolds = '$SCAFFOLDS_DIR';

// MCD command files
const mcdDir = path.join(scaffolds, 'control-plane', 'mcd');
fs.mkdirSync(mcdDir, { recursive: true });
fs.writeFileSync(path.join(mcdDir, 'EVALUATE.md'), commands.renderEvaluate(placeholderConfig));
fs.writeFileSync(path.join(mcdDir, 'CONTRACT.md'), commands.renderContract(placeholderConfig));
fs.writeFileSync(path.join(mcdDir, 'EXECUTE.md'), commands.renderExecute(placeholderConfig));
fs.writeFileSync(path.join(mcdDir, 'CLOSEOUT.md'), commands.renderCloseout(placeholderConfig));
fs.writeFileSync(path.join(mcdDir, 'REMEMBER.md'), commands.renderRemember(placeholderConfig));
fs.writeFileSync(path.join(mcdDir, 'HELP.md'), commands.renderHelp(placeholderConfig));

// Antigravity agent workflow adapters (written to .agents/ at deploy time)
const agentsAdapterDir = path.join(scaffolds, 'agents-adapters');
fs.mkdirSync(agentsAdapterDir, { recursive: true });
const agentCmds = ['evaluate', 'contract', 'execute', 'closeout', 'help', 'remember', 'docs', 'bug'];
for (const cmd of agentCmds) {
  fs.writeFileSync(path.join(agentsAdapterDir, \`\${cmd}.md\`), adapters.renderAntigravityWorkflow(cmd, placeholderConfig));
}

// Claude Code command adapters
const claudeAdapterDir = path.join(scaffolds, 'claude-commands');
fs.mkdirSync(claudeAdapterDir, { recursive: true });
for (const cmd of agentCmds) {
  fs.writeFileSync(path.join(claudeAdapterDir, \`\${cmd}.md\`), adapters.renderAntigravityWorkflow(cmd, placeholderConfig));
}

// Governance docs
const cpDir = path.join(scaffolds, 'control-plane');
fs.writeFileSync(path.join(cpDir, 'GUARDRAILS.md'), guardrails.renderGuardrails(placeholderConfig));
fs.writeFileSync(path.join(cpDir, 'MCD_PLAYBOOK.md'), playbook.getPlaybookContent());

// CLAUDE.md
fs.writeFileSync(path.join(scaffolds, 'CLAUDE.md'), adapters.renderClaudeMd(placeholderConfig));

// AGENTS.md
fs.writeFileSync(path.join(scaffolds, 'AGENTS.md'), adapters.renderAgentsMd(placeholderConfig));

console.log('Templates rendered.');
"

# --- 2. Copy Command Deck server files ---
COMMAND_DECK_SRC="$PROJECT_ROOT/.amphion/command-deck"
COMMAND_DECK_DST="$SCAFFOLDS_DIR/command-deck"

rm -rf "$COMMAND_DECK_DST"
mkdir -p "$COMMAND_DECK_DST"

# Copy server.py
cp "$COMMAND_DECK_SRC/server.py" "$COMMAND_DECK_DST/server.py"

# Copy public/ directory
if [ -d "$COMMAND_DECK_SRC/public" ]; then
  cp -r "$COMMAND_DECK_SRC/public" "$COMMAND_DECK_DST/public"
fi

# Copy scripts/ directory
if [ -d "$COMMAND_DECK_SRC/scripts" ]; then
  cp -r "$COMMAND_DECK_SRC/scripts" "$COMMAND_DECK_DST/scripts"
fi

# Create data/ directory placeholder
mkdir -p "$COMMAND_DECK_DST/data"

echo "Command Deck files copied."

# --- 3. Copy MCD Help Source ---
HELP_SOURCE="$PROJECT_ROOT/.amphion/control-plane/MCD_HELP_SOURCE.md"
if [ -f "$HELP_SOURCE" ]; then
  cp "$HELP_SOURCE" "$SCAFFOLDS_DIR/control-plane/MCD_HELP_SOURCE.md"
  echo "Help source copied."
fi

# --- 4. Write config template ---
cat > "$SCAFFOLDS_DIR/config-template.json" << 'EOF'
{
  "port": "{{PORT}}",
  "serverLang": "python",
  "codename": "{{CODENAME}}",
  "projectName": "{{PROJECT_NAME}}",
  "initialVersion": "{{INITIAL_VERSION}}",
  "mcdVersion": "{{MCD_VERSION}}",
  "commandDeckPath": ".amphion/command-deck"
}
EOF

echo "Config template written."
echo "Sync complete. Scaffolds at: $SCAFFOLDS_DIR"
