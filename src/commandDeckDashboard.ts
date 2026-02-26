import * as vscode from 'vscode';
import { recordCommandIntentFromChatInput } from './memoryHooks';
import { ServerController } from './serverController';

export class CommandDeckDashboard {
    public static currentPanel: CommandDeckDashboard | undefined;
    private readonly _panel: vscode.WebviewPanel;
    private _disposables: vscode.Disposable[] = [];

    public static createOrShow(extensionUri: vscode.Uri, serverController: ServerController) {
        const column = vscode.window.activeTextEditor
            ? vscode.window.activeTextEditor.viewColumn
            : undefined;

        if (CommandDeckDashboard.currentPanel) {
            CommandDeckDashboard.currentPanel._panel.reveal(column);
            return;
        }

        const panel = vscode.window.createWebviewPanel(
            'mcdDashboard',
            'Amphion Agent Controls',
            column || vscode.ViewColumn.One,
            {
                enableScripts: true,
                localResourceRoots: [vscode.Uri.joinPath(extensionUri, 'assets')],
                retainContextWhenHidden: true
            }
        );

        CommandDeckDashboard.currentPanel = new CommandDeckDashboard(panel, serverController);
    }

    public static registerMessageHandlers(
        webview: vscode.Webview,
        disposables: vscode.Disposable[],
        serverController: ServerController
    ) {
        webview.onDidReceiveMessage(
            async (message) => {
                const workspaceFolders = vscode.workspace.workspaceFolders;
                const root = workspaceFolders && workspaceFolders.length > 0 ? workspaceFolders[0].uri : undefined;

                switch (message.command) {
                    case 'openChatInput':
                        if (root) {
                            const chatText = typeof message.text === 'string' ? message.text : '';
                            void recordCommandIntentFromChatInput(root.fsPath, chatText).then((result) => {
                                if (result.attempted && !result.recorded) {
                                    console.warn(`[AmphionAgent] Memory hook skipped: ${result.reason ?? 'unknown'}`);
                                }
                            });
                        }
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
                        } else {
                            vscode.window.showErrorMessage('AmphionAgent: No workspace folder open to execute command.');
                        }
                        return;

                    case 'startServer':
                        if (!root) {
                            vscode.window.showErrorMessage('AmphionAgent: No workspace folder open to start server.');
                            return;
                        }
                        {
                            const result = await serverController.start(root);
                            if (result.ok) {
                                vscode.window.showInformationMessage(result.message);
                            } else {
                                vscode.window.showWarningMessage(result.message);
                            }
                        }
                        return;

                    case 'stopServer':
                        if (!root) {
                            vscode.window.showErrorMessage('AmphionAgent: No workspace folder open to stop server.');
                            return;
                        }
                        {
                            const result = await serverController.stop(root);
                            if (result.ok) {
                                vscode.window.showInformationMessage(result.message);
                            } else {
                                vscode.window.showWarningMessage(result.message);
                            }
                        }
                        return;
                }
            },
            null,
            disposables
        );
    }

    private constructor(panel: vscode.WebviewPanel, serverController: ServerController) {
        this._panel = panel;
        this._update();
        this._panel.onDidDispose(() => this.dispose(), null, this._disposables);
        CommandDeckDashboard.registerMessageHandlers(this._panel.webview, this._disposables, serverController);
    }

    public dispose() {
        CommandDeckDashboard.currentPanel = undefined;
        this._panel.dispose();
        while (this._disposables.length) {
            const x = this._disposables.pop();
            if (x) {
                x.dispose();
            }
        }
    }

    private _update() {
        this._panel.webview.html = CommandDeckDashboard.getHtmlForWebview();
    }

    public static getHtmlForWebview() {
        return `<!DOCTYPE html>
<html lang="en">
<head>
    <meta charset="UTF-8">
    <meta name="viewport" content="width=device-width, initial-scale=1.0">
    <title>Amphion Agent Controls</title>
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
            gap: 24px;
        }

        h1 {
            font-size: 28px;
            margin: 0;
            font-weight: 600;
        }

        h2 {
            font-size: 20px;
            margin-bottom: 16px;
            font-weight: 600;
            border-bottom: 1px solid var(--mcd-border);
            padding-bottom: 8px;
        }

        .command-flow-section {
            margin-top: 32px;
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
            flex-direction: column;
            align-items: flex-start;
            gap: 6px;
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
            font-weight: 600;
        }

        .command-desc {
            font-size: 13px;
            color: #8b949e;
            line-height: 1.35;
        }

        .server-section {
            margin-top: 28px;
        }
    </style>
</head>
<body>
    <div class="container">
        <header style="text-align: left;">
            <h1>Amphion Agent Controls</h1>
        </header>

        <section class="command-flow-section">
            <h2>Command Flow</h2>
            <p style="font-size: 13px; color: #8b949e; margin-bottom: 16px;">AmphionAgent uses explicit phase transitions:</p>
            
            <div class="command-list">
                <div class="command-item" onclick="vscode.postMessage({command: 'openChatInput', text: '/help'})">
                    <span class="command-tag">0. /help</span>
                    <span class="command-desc">request assistance</span>
                </div>
                <div class="command-item" onclick="vscode.postMessage({command: 'openChatInput', text: '/remember'})">
                    <span class="command-tag">0.5 /remember</span>
                    <span class="command-desc">checkpoint memory</span>
                </div>
                <div class="command-item" onclick="vscode.postMessage({command: 'openChatInput', text: '/evaluate'})">
                    <span class="command-tag">1. /evaluate</span>
                    <span class="command-desc">research & scope</span>
                </div>
                <div class="command-item" onclick="vscode.postMessage({command: 'openChatInput', text: '/contract'})">
                    <span class="command-tag">2. /contract</span>
                    <span class="command-desc">define execution plan</span>
                </div>
                <div class="command-item" onclick="vscode.postMessage({command: 'openChatInput', text: '/execute'})">
                    <span class="command-tag">3. /execute</span>
                    <span class="command-desc">implement contract</span>
                </div>
                <div class="command-item" onclick="vscode.postMessage({command: 'openChatInput', text: '/closeout'})">
                    <span class="command-tag">4. /closeout</span>
                    <span class="command-desc">archive and complete</span>
                </div>
            </div>
        </section>

        <section class="server-section">
            <h2>Server Management</h2>
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
        </section>
    </div>

    <script>
        const vscode = acquireVsCodeApi();
    </script>
</body>
</html>`;
    }
}
