import * as vscode from 'vscode';
import { dispatchChatText } from './chatDispatch';
import { recordCommandIntentFromChatInput } from './memoryHooks';
import { RuntimeStatusResult, ServerController } from './serverController';

interface DashboardRenderOptions {
    port?: string;
    version?: string;
}

const DEFAULT_VERSION = '0.0.0';

function escapeHtml(value: string): string {
    return value
        .replace(/&/g, '&amp;')
        .replace(/</g, '&lt;')
        .replace(/>/g, '&gt;')
        .replace(/"/g, '&quot;')
        .replace(/'/g, '&#39;');
}

function fallbackRuntimeStatus(port: string): RuntimeStatusResult {
    return {
        status: 'offline',
        port,
        url: `http://127.0.0.1:${port}`,
    };
}

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
                retainContextWhenHidden: true,
            }
        );

        CommandDeckDashboard.currentPanel = new CommandDeckDashboard(panel, serverController);
    }

    private static async postServerStatus(
        webview: vscode.Webview,
        serverController: ServerController,
        root?: vscode.Uri,
    ): Promise<void> {
        let runtime = fallbackRuntimeStatus('');
        try {
            runtime = await serverController.getRuntimeStatus(root);
        } catch {
            // Keep fallback offline state.
        }
        await webview.postMessage({
            command: 'serverStatus',
            status: runtime.status,
            port: runtime.port,
            url: runtime.url,
        });
    }

    public static registerMessageHandlers(
        webview: vscode.Webview,
        disposables: vscode.Disposable[],
        serverController: ServerController,
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
                        {
                            const chatText = typeof message.text === 'string' ? message.text.trim() : '';
                            const result = await dispatchChatText(chatText);
                            if (!result.ok) {
                                void vscode.env.clipboard.writeText(chatText);
                                vscode.window.showWarningMessage(
                                    `AmphionAgent: Could not dispatch "${chatText}" to chat. Command copied to clipboard.`
                                );
                            }
                        }
                        return;

                    case 'runTerminalCommand':
                        if (root) {
                            let terminal = vscode.window.terminals.find((t) => t.name === 'Amphion Agent');
                            if (!terminal) {
                                terminal = vscode.window.createTerminal({
                                    name: 'Amphion Agent',
                                    cwd: root.fsPath,
                                });
                            }
                            terminal.show();
                            terminal.sendText(typeof message.text === 'string' ? message.text : '');
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
                            await CommandDeckDashboard.postServerStatus(webview, serverController, root);
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
                            await CommandDeckDashboard.postServerStatus(webview, serverController, root);
                        }
                        return;

                    case 'requestServerStatus':
                        await CommandDeckDashboard.postServerStatus(webview, serverController, root);
                        return;

                    case 'openInBrowser': {
                        let targetUrl = typeof message.url === 'string' ? message.url.trim() : '';
                        if (!targetUrl) {
                            const runtime = await serverController.getRuntimeStatus(root);
                            targetUrl = runtime.url;
                        }
                        try {
                            void vscode.env.openExternal(vscode.Uri.parse(targetUrl));
                        } catch {
                            vscode.window.showErrorMessage(`AmphionAgent: Invalid URL \"${targetUrl}\".`);
                        }
                        return;
                    }
                }
            },
            null,
            disposables
        );
    }

    private constructor(panel: vscode.WebviewPanel, serverController: ServerController) {
        this._panel = panel;
        void this._update(serverController);
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

    private async _update(serverController: ServerController) {
        const port = await serverController.getPort();
        this._panel.webview.html = CommandDeckDashboard.getHtmlForWebview({ port });
    }

    public static getHtmlForWebview(options: DashboardRenderOptions = {}) {
        const port = String(options.port ?? '').trim();
        const version = String(options.version ?? DEFAULT_VERSION).trim() || DEFAULT_VERSION;
        const safePort = escapeHtml(port);
        const safeVersion = escapeHtml(version);
        const initialUrl = `http://127.0.0.1:${safePort}`;

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
            --mcd-muted: #8b949e;
            --mcd-accent: #58a6ff;
        }

        body {
            font-family: -apple-system, BlinkMacSystemFont, 'Segoe UI', Roboto, Oxygen, Ubuntu, Cantarell, 'Open Sans', 'Helvetica Neue', sans-serif;
            background-color: var(--mcd-bg);
            color: var(--mcd-text);
            margin: 0;
            padding: 24px;
            display: flex;
            justify-content: flex-start;
            min-height: 100vh;
        }

        .container {
            max-width: 360px;
            width: 100%;
            display: flex;
            flex-direction: column;
            gap: 22px;
        }

        .version-label {
            font-size: 11px;
            color: var(--mcd-muted);
            letter-spacing: 0.04em;
            text-transform: uppercase;
        }

        h2 {
            font-size: 20px;
            margin-bottom: 16px;
            font-weight: 600;
            border-bottom: 1px solid var(--mcd-border);
            padding-bottom: 8px;
        }

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
            color: var(--mcd-muted);
            line-height: 1.35;
        }

        .server-status-row {
            cursor: default;
            padding: 12px 16px;
        }

        .server-status-layout {
            display: flex;
            flex-direction: column;
            align-items: flex-start;
            width: 100%;
            gap: 8px;
        }

        .open-browser-btn {
            background: transparent;
            border: 1px solid var(--mcd-border);
            color: var(--mcd-accent);
            padding: 4px 8px;
            border-radius: 4px;
            cursor: pointer;
            font-size: 13px;
            font-weight: 600;
            transition: all 0.2s;
            width: fit-content;
            white-space: nowrap;
        }

        .open-browser-btn:hover {
            background: rgba(88, 166, 255, 0.1);
        }

        .section {
            margin-top: 0;
        }
    </style>
</head>
<body>
    <div class="container">
        <div class="version-label">AmphionAgent v${safeVersion}</div>

        <section class="section">
            <h2>Command Flow</h2>
            <div class="command-list">
                <div class="command-item" onclick="vscode.postMessage({command: 'openChatInput', text: '/evaluate'})">
                    <span class="command-tag">1. /evaluate</span>
                    <span class="command-desc">research &amp; scope</span>
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

        <section class="section">
            <h2>Server Management</h2>
            <div class="command-list">
                <div class="command-item server-status-row">
                    <div class="server-status-layout">
                        <span class="command-tag" id="server-status-indicator" style="background-color: rgba(139, 148, 158, 0.2); color: #8b949e;">⚪ Checking...</span>
                        <button id="open-browser-btn" class="open-browser-btn">127.0.0.1:${safePort}↗</button>
                    </div>
                </div>
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

        <section class="section">
            <h2>Utilities</h2>
            <div class="command-list">
                <div class="command-item" onclick="vscode.postMessage({command: 'openChatInput', text: '/docs'})">
                    <span class="command-tag">/docs</span>
                    <span class="command-desc">generate project strategy</span>
                </div>
                <div class="command-item" onclick="vscode.postMessage({command: 'openChatInput', text: '/help'})">
                    <span class="command-tag">/help</span>
                    <span class="command-desc">request assistance</span>
                </div>
                <div class="command-item" onclick="vscode.postMessage({command: 'openChatInput', text: '/remember'})">
                    <span class="command-tag">/remember</span>
                    <span class="command-desc">checkpoint memory</span>
                </div>
                <div class="command-item" onclick="vscode.postMessage({command: 'openChatInput', text: '/bug'})">
                    <span class="command-tag">/bug</span>
                    <span class="command-desc">create a bug card</span>
                </div>
            </div>
        </section>
    </div>

    <script>
        const vscode = acquireVsCodeApi();
        const statusIndicator = document.getElementById('server-status-indicator');
        const openBrowserBtn = document.getElementById('open-browser-btn');

        const state = {
            port: '${safePort}',
            url: '${initialUrl}'
        };

        function renderServerStatus(status) {
            if (!statusIndicator) {
                return;
            }

            if (status === 'online') {
                statusIndicator.textContent = '🟢 Online';
                statusIndicator.style.backgroundColor = 'rgba(46, 160, 67, 0.2)';
                statusIndicator.style.color = '#2ea043';
                return;
            }

            if (status === 'noncanonical') {
                statusIndicator.textContent = '🟡 Conflict';
                statusIndicator.style.backgroundColor = 'rgba(187, 128, 9, 0.25)';
                statusIndicator.style.color = '#d29922';
                return;
            }

            statusIndicator.textContent = '🔴 Offline';
            statusIndicator.style.backgroundColor = 'rgba(250, 69, 73, 0.2)';
            statusIndicator.style.color = '#fa4549';
        }

        function updateBrowserTarget(url, port) {
            if (typeof port === 'string' && port.trim().length > 0) {
                state.port = port.trim();
            }
            if (typeof url === 'string' && url.trim().length > 0) {
                state.url = url.trim();
            } else {
                state.url = 'http://127.0.0.1:' + state.port;
            }
            if (openBrowserBtn) {
                openBrowserBtn.textContent = '127.0.0.1:' + state.port + '↗';
            }
        }

        function requestServerStatus() {
            vscode.postMessage({ command: 'requestServerStatus' });
        }

        if (openBrowserBtn) {
            openBrowserBtn.addEventListener('click', (event) => {
                event.stopPropagation();
                vscode.postMessage({ command: 'openInBrowser', url: state.url });
            });
        }

        window.addEventListener('message', (event) => {
            const message = event.data;
            if (!message || message.command !== 'serverStatus') {
                return;
            }
            updateBrowserTarget(message.url, message.port);
            renderServerStatus(typeof message.status === 'string' ? message.status : 'offline');
        });

        requestServerStatus();
        setInterval(requestServerStatus, 5000);
    </script>
</body>
</html>`;
    }
}
