"use strict";
var __createBinding = (this && this.__createBinding) || (Object.create ? (function(o, m, k, k2) {
    if (k2 === undefined) k2 = k;
    var desc = Object.getOwnPropertyDescriptor(m, k);
    if (!desc || ("get" in desc ? !m.__esModule : desc.writable || desc.configurable)) {
      desc = { enumerable: true, get: function() { return m[k]; } };
    }
    Object.defineProperty(o, k2, desc);
}) : (function(o, m, k, k2) {
    if (k2 === undefined) k2 = k;
    o[k2] = m[k];
}));
var __setModuleDefault = (this && this.__setModuleDefault) || (Object.create ? (function(o, v) {
    Object.defineProperty(o, "default", { enumerable: true, value: v });
}) : function(o, v) {
    o["default"] = v;
});
var __importStar = (this && this.__importStar) || (function () {
    var ownKeys = function(o) {
        ownKeys = Object.getOwnPropertyNames || function (o) {
            var ar = [];
            for (var k in o) if (Object.prototype.hasOwnProperty.call(o, k)) ar[ar.length] = k;
            return ar;
        };
        return ownKeys(o);
    };
    return function (mod) {
        if (mod && mod.__esModule) return mod;
        var result = {};
        if (mod != null) for (var k = ownKeys(mod), i = 0; i < k.length; i++) if (k[i] !== "default") __createBinding(result, mod, k[i]);
        __setModuleDefault(result, mod);
        return result;
    };
})();
Object.defineProperty(exports, "__esModule", { value: true });
exports.CommandDeckDashboard = void 0;
const vscode = __importStar(require("vscode"));
class CommandDeckDashboard {
    static createOrShow(extensionUri) {
        const column = vscode.window.activeTextEditor
            ? vscode.window.activeTextEditor.viewColumn
            : undefined;
        if (CommandDeckDashboard.currentPanel) {
            CommandDeckDashboard.currentPanel._panel.reveal(column);
            return;
        }
        const panel = vscode.window.createWebviewPanel('mcdDashboard', 'Amphion Command Deck', column || vscode.ViewColumn.One, {
            enableScripts: true,
            localResourceRoots: [vscode.Uri.joinPath(extensionUri, 'assets')],
            retainContextWhenHidden: true
        });
        CommandDeckDashboard.currentPanel = new CommandDeckDashboard(panel);
    }
    constructor(panel) {
        this._disposables = [];
        this._panel = panel;
        this._update();
        this._panel.onDidDispose(() => this.dispose(), null, this._disposables);
        this._panel.webview.onDidReceiveMessage(async (message) => {
            const workspaceFolders = vscode.workspace.workspaceFolders;
            const root = workspaceFolders && workspaceFolders.length > 0 ? workspaceFolders[0].uri : undefined;
            switch (message.command) {
                case 'openChatInput':
                    vscode.commands.executeCommand('workbench.action.chat.open', { query: message.text });
                    return;
                case 'runTerminalCommand':
                    if (root) {
                        // Find or create Amphion Terminal
                        let terminal = vscode.window.terminals.find(t => t.name === 'Amphion Agent');
                        if (!terminal) {
                            terminal = vscode.window.createTerminal({
                                name: 'Amphion Agent',
                                cwd: root.fsPath
                            });
                        }
                        terminal.show();
                        terminal.sendText(message.text);
                    }
                    else {
                        vscode.window.showErrorMessage('AmphionAgent: No workspace folder open to execute command.');
                    }
                    return;
                case 'previewFile':
                    if (root) {
                        const fileUri = vscode.Uri.joinPath(root, message.path);
                        try {
                            await vscode.workspace.fs.stat(fileUri);
                            vscode.commands.executeCommand('markdown.showPreview', fileUri);
                        }
                        catch {
                            vscode.window.showWarningMessage(`AmphionAgent: File not found: ${message.path}`);
                        }
                    }
                    return;
                case 'openDynamicDoc':
                    if (root) {
                        const folder = message.folder; // e.g. '01_Strategy'
                        const suffix = message.suffix; // e.g. 'PROJECT_CHARTER.md'
                        const searchPattern = new vscode.RelativePattern(vscode.Uri.joinPath(root, 'referenceDocs', folder), `*${suffix}`);
                        const files = await vscode.workspace.findFiles(searchPattern, null, 1);
                        if (files.length > 0) {
                            vscode.commands.executeCommand('markdown.showPreview', files[0]);
                        }
                        else {
                            vscode.window.showWarningMessage(`AmphionAgent: No file ending in ${suffix} found.`);
                        }
                    }
                    return;
                case 'startServer':
                    if (root) {
                        let port = '8765';
                        let serverLang = 'node';
                        try {
                            const configUri = vscode.Uri.joinPath(root, 'ops', 'amphion.json');
                            const fileData = await vscode.workspace.fs.readFile(configUri);
                            const parsed = JSON.parse(new TextDecoder().decode(fileData));
                            if (parsed.port)
                                port = parsed.port;
                            if (parsed.serverLang)
                                serverLang = parsed.serverLang;
                        }
                        catch {
                            // Fallback if `ops/amphion.json` is missing or malformed
                        }
                        let terminal = vscode.window.terminals.find(t => t.name.startsWith('Command Deck :'));
                        if (!terminal) {
                            terminal = vscode.window.createTerminal({
                                name: `Command Deck :${port}`,
                                cwd: root.fsPath
                            });
                        }
                        terminal.show();
                        terminal.sendText(`python3 ops/launch-command-deck/server.py --port ${port}`);
                    }
                    return;
                case 'stopServer':
                    if (root) {
                        const terminal = vscode.window.terminals.find(t => t.name.startsWith('Command Deck :'));
                        if (terminal) {
                            terminal.show();
                            terminal.sendText('\x03'); // Ctrl+C
                        }
                    }
                    return;
            }
        }, null, this._disposables);
    }
    dispose() {
        CommandDeckDashboard.currentPanel = undefined;
        this._panel.dispose();
        while (this._disposables.length) {
            const x = this._disposables.pop();
            if (x) {
                x.dispose();
            }
        }
    }
    _update() {
        this._panel.webview.html = this._getHtmlForWebview();
    }
    _getHtmlForWebview() {
        return `<!DOCTYPE html>
<html lang="en">
<head>
    <meta charset="UTF-8">
    <meta name="viewport" content="width=device-width, initial-scale=1.0">
    <title>Amphion Command Deck</title>
    <style>
        :root {
            --mcd-bg: #0d1117;
            --mcd-surface: #161b22;
            --mcd-border: #30363d;
            --mcd-text: #c9d1d9;
            --mcd-accent: #58a6ff;
        }

        body {
            font-family: -apple-system, BlinkMacSystemFont, 'Segoe UI', Roboto, Oxygen, Ubuntu, Cantarell, 'Open Sans', 'Helvetica Neue', sans-serif;
            background-color: var(--mcd-bg);
            color: var(--mcd-text);
            margin: 0;
            padding: 32px;
            display: flex;
            justify-content: flex-start;
            min-height: 100vh;
        }

        .container {
            max-width: 360px;
            width: 100%;
            display: flex;
            flex-direction: column;
            gap: 32px;
        }

        h1 {
            font-size: 28px;
            margin-bottom: 8px;
            font-weight: 600;
        }

        h2 {
            font-size: 20px;
            margin-bottom: 16px;
            font-weight: 600;
            border-bottom: 1px solid var(--mcd-border);
            padding-bottom: 8px;
        }

        p.subtitle {
            color: #8b949e;
            margin-bottom: 32px;
            font-size: 14px;
        }

        /* Command Flow List */
        .command-list {
            display: flex;
            flex-direction: column;
            gap: 12px;
        }

        .command-item {
            background-color: var(--mcd-surface);
            border: 1px solid var(--mcd-border);
            border-radius: 6px;
            padding: 12px 16px;
            cursor: pointer;
            transition: all 0.2s;
            display: flex;
            align-items: center;
        }

        .command-item:hover {
            border-color: #8b949e;
            background-color: #1f2428;
        }

        .command-tag {
            background-color: rgba(88, 166, 255, 0.1);
            color: var(--mcd-accent);
            padding: 4px 8px;
            border-radius: 4px;
            font-family: monospace;
            font-size: 13px;
            margin-right: 12px;
            font-weight: 600;
        }

        .command-desc {
            font-size: 13px;
            color: #8b949e;
        }

        /* Details Section */
        .details-section {
            background-color: var(--mcd-surface);
            border: 1px solid var(--mcd-border);
            border-radius: 8px;
            padding: 20px;
            margin-bottom: 24px;
        }

        .details-list {
            list-style: none;
            padding: 0;
            margin: 0;
        }

        .details-list li {
            margin-bottom: 12px;
            font-size: 14px;
        }

        .details-list a {
            color: var(--mcd-accent);
            text-decoration: none;
            cursor: pointer;
        }

        .details-list a:hover {
            text-decoration: underline;
        }
    </style>
</head>
<body>
    <div class="container">
        <header style="text-align: center; margin-bottom: 16px;">
            <h1>Amphion Command Deck</h1>
            <p class="subtitle">AI Development Orchestrator Phase Transitions</p>
        </header>

        <div>
            <div class="details-section">
                <h2>DETAILS</h2>
                <ul class="details-list">
                    <li><a onclick="vscode.postMessage({command: 'previewFile', path: 'referenceDocs/00_Governance/MCD_PLAYBOOK.md'})">• Canonical MCD Commands</a></li>
                    <li><a onclick="vscode.postMessage({command: 'openDynamicDoc', folder: '01_Strategy', suffix: 'PROJECT_CHARTER.md'})">• Project Charter</a></li>
                    <li><a onclick="vscode.postMessage({command: 'openDynamicDoc', folder: '01_Strategy', suffix: 'HIGH_LEVEL_PRD.md'})">• High-Level PRD</a></li>
                </ul>
            </div>

            <h2>Command Flow</h2>
            <p style="font-size: 13px; color: #8b949e; margin-bottom: 16px;">AmphionAgent uses explicit phase transitions:</p>
            
            <div class="command-list">
                <div class="command-item" onclick="vscode.postMessage({command: 'openChatInput', text: '/help'})">
                    <span class="command-tag">0. /help</span>
                    <span class="command-desc">request assistance</span>
                </div>
                <div class="command-item" onclick="vscode.postMessage({command: 'openChatInput', text: '/evaluate'})">
                    <span class="command-tag">1. /evaluate</span>
                    <span class="command-desc">research & scope</span>
                </div>
                <div class="command-item" onclick="vscode.postMessage({command: 'openChatInput', text: '/board'})">
                    <span class="command-tag">2. /board</span>
                    <span class="command-desc">create board items</span>
                </div>
                <div class="command-item" onclick="vscode.postMessage({command: 'openChatInput', text: '/contract'})">
                    <span class="command-tag">3. /contract</span>
                    <span class="command-desc">define execution plan</span>
                </div>
                <div class="command-item" onclick="vscode.postMessage({command: 'openChatInput', text: '/execute'})">
                    <span class="command-tag">4. /execute</span>
                    <span class="command-desc">implement contract</span>
                </div>
                <div class="command-item" onclick="vscode.postMessage({command: 'openChatInput', text: '/closeout'})">
                    <span class="command-tag">5. /closeout</span>
                    <span class="command-desc">archive and complete</span>
                </div>
            </div>

            <h2 style="margin-top: 32px;">Server Management</h2>
            <div class="command-list">
                <div class="command-item" onclick="vscode.postMessage({command: 'startServer'})">
                    <span class="command-tag" style="background-color: rgba(35, 134, 54, 0.2); color: #2ea043;">▶ Start</span>
                    <span class="command-desc">Command Deck Server</span>
                </div>
                <div class="command-item" onclick="vscode.postMessage({command: 'stopServer'})">
                    <span class="command-tag" style="background-color: rgba(250, 69, 73, 0.2); color: #fa4549;">⏹ Stop</span>
                    <span class="command-desc">Terminate Server</span>
                </div>
            </div>
        </div>
    </div>

    <script>
        const vscode = acquireVsCodeApi();
    </script>
</body>
</html>`;
    }
}
exports.CommandDeckDashboard = CommandDeckDashboard;
//# sourceMappingURL=commandDeckDashboard.js.map