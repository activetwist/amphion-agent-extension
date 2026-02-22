import * as vscode from 'vscode';
import { ProjectConfig } from './wizard';
import { runManualPath, runSourceDocsPath } from './charterWizard';
import { buildScaffold, launchCommandDeck } from './scaffolder';

export class OnboardingPanel {
    public static currentPanel: OnboardingPanel | undefined;
    private readonly _panel: vscode.WebviewPanel;
    private readonly _extensionUri: vscode.Uri;
    private _disposables: vscode.Disposable[] = [];
    private _config?: ProjectConfig;
    private _terminal?: vscode.Terminal;

    public static createOrShow(
        extensionUri: vscode.Uri,
        root: vscode.Uri
    ) {
        const column = vscode.window.activeTextEditor
            ? vscode.window.activeTextEditor.viewColumn
            : undefined;

        if (OnboardingPanel.currentPanel) {
            OnboardingPanel.currentPanel._panel.reveal(column);
            return;
        }

        const panel = vscode.window.createWebviewPanel(
            'mcdOnboarding',
            `MCD Onboarding`,
            column || vscode.ViewColumn.One,
            {
                enableScripts: true,
                localResourceRoots: [vscode.Uri.joinPath(extensionUri, 'assets')],
                retainContextWhenHidden: true
            }
        );

        OnboardingPanel.currentPanel = new OnboardingPanel(panel, extensionUri, root);
    }

    private constructor(
        panel: vscode.WebviewPanel,
        extensionUri: vscode.Uri,
        root: vscode.Uri
    ) {
        this._panel = panel;
        this._extensionUri = extensionUri;

        this._update();

        let scaffoldComplete = false;

        this._panel.onDidDispose(() => this.dispose(), null, this._disposables);

        this._panel.webview.onDidReceiveMessage(
            async (message) => {
                switch (message.command) {
                    case 'startScaffold':
                        this._config = message.data as ProjectConfig;

                        this._terminal = vscode.window.createTerminal({
                            name: 'MCD Init',
                            cwd: root.fsPath,
                        });

                        await vscode.window.withProgress(
                            {
                                location: vscode.ProgressLocation.Notification,
                                title: `MCD: Initializing ${this._config.projectName}...`,
                                cancellable: false,
                            },
                            async (progress) => {
                                progress.report({ message: 'Writing scaffold directories...' });
                                await buildScaffold(root, this._config!, extensionUri, this._terminal!);
                                progress.report({ increment: 100, message: 'Done!' });
                            }
                        );

                        vscode.window.showInformationMessage(
                            `✅ MCD project "${this._config.projectName}" initialized! The Command Deck is starting on port ${this._config.port}.`
                        );

                        scaffoldComplete = true;
                        this._panel.webview.postMessage({ command: 'scaffoldComplete' });
                        return;

                    case 'generateManual':
                        if (!scaffoldComplete) return;
                        await runManualPath(root, this._config!, this._terminal!, message.data);
                        this._panel.webview.postMessage({ command: 'manualComplete' });
                        return;
                    case 'importDocs':
                        if (!scaffoldComplete) return;
                        const importPrompts = await runSourceDocsPath(root, this._config!, this._terminal!);
                        if (importPrompts) {
                            this._panel.webview.postMessage({ command: 'handoffReady', data: importPrompts });
                        }
                        return;
                    case 'cancel':
                        if (!scaffoldComplete) return;
                        this._panel.dispose();
                        const action = await vscode.window.showInformationMessage(
                            'MCD has initialized your project! The Command Deck kanban board will now launch in your browser. Return to VS Code when you are ready to manage your work.',
                            { modal: true },
                            'Launch Command Deck'
                        );

                        if (action === 'Launch Command Deck') {
                            await launchCommandDeck(root, this._config!);
                        }
                        return;
                    case 'copyToClipboard':
                        await vscode.env.clipboard.writeText(message.text);
                        return;
                    case 'launchCommandDeck':
                        this._panel.dispose();
                        await launchCommandDeck(root, this._config!);
                        return;
                }
            },
            null,
            this._disposables
        );
    }

    public dispose() {
        OnboardingPanel.currentPanel = undefined;
        this._panel.dispose();
        while (this._disposables.length) {
            const x = this._disposables.pop();
            if (x) {
                x.dispose();
            }
        }
    }

    private _update() {
        this._panel.title = this._config ? `MCD Onboarding: ${this._config.projectName}` : 'MCD Onboarding';
        this._panel.webview.html = this._getHtmlForWebview();
    }

    private _getHtmlForWebview() {
        const isScaffolded = !!this._config;
        const projectName = this._config ? this._config.projectName : 'New Project';
        const initialVersion = this._config ? this._config.initialVersion : '0.1.0';
        return `<!DOCTYPE html>
<html lang="en">
<head>
    <meta charset="UTF-8">
    <meta name="viewport" content="width=device-width, initial-scale=1.0">
    <title>MCD Onboarding</title>
    <style>
        :root {
            --mcd-bg: #0d1117;
            --mcd-surface: #161b22;
            --mcd-border: #30363d;
            --mcd-text: #c9d1d9;
            --mcd-accent: #58a6ff;
            --mcd-accent-hover: #1f6feb;
            --font-family: -apple-system, BlinkMacSystemFont, 'Segoe UI', Roboto, Helvetica, Arial, sans-serif;
        }

        body {
            background-color: var(--mcd-bg);
            color: var(--mcd-text);
            font-family: var(--font-family);
            padding: 40px;
            margin: 0;
            display: flex;
            justify-content: center;
        }

        .container {
            max-width: 800px;
            width: 100%;
        }

        h1 {
            font-size: 24px;
            margin-bottom: 8px;
            font-weight: 600;
        }

        p.subtitle {
            color: #8b949e;
            margin-bottom: 32px;
            font-size: 14px;
        }

        .card {
            background-color: var(--mcd-surface);
            border: 1px solid var(--mcd-border);
            border-radius: 6px;
            padding: 24px;
            margin-bottom: 24px;
        }

        .button-group {
            display: flex;
            gap: 16px;
            margin-bottom: 32px;
        }

        button {
            background-color: var(--mcd-surface);
            color: var(--mcd-text);
            border: 1px solid var(--mcd-border);
            padding: 12px 24px;
            border-radius: 6px;
            font-size: 14px;
            font-weight: 600;
            cursor: pointer;
            transition: all 0.2s;
            flex: 1;
        }

        button:hover {
            border-color: #8b949e;
            background-color: #1f2428;
        }

        button.primary {
            background-color: #238636;
            color: #ffffff;
            border-color: rgba(240, 246, 252, 0.1);
        }

        button.primary:hover {
            background-color: #2ea043;
            border-color: rgba(240, 246, 252, 0.1);
        }

        .view {
            display: none;
        }

        .view.active {
            display: block;
        }

        .form-group {
            margin-bottom: 20px;
        }

        label {
            display: block;
            margin-bottom: 8px;
            font-weight: 600;
            font-size: 14px;
        }

        input[type="text"] {
            width: 100%;
            padding: 8px 12px;
            background-color: var(--mcd-bg);
            border: 1px solid var(--mcd-border);
            border-radius: 6px;
            color: var(--mcd-text);
            font-size: 14px;
            box-sizing: border-box;
        }

        input[type="text"]:focus {
            outline: none;
            border-color: var(--mcd-accent);
            box-shadow: 0 0 0 3px rgba(88, 166, 255, 0.3);
        }

        .hint {
            display: block;
            font-size: 12px;
            color: #8b949e;
            margin-top: 4px;
        }
        
        .footer-buttons {
            display: flex;
            justify-content: space-between;
            margin-top: 32px;
            border-top: 1px solid var(--mcd-border);
            padding-top: 24px;
        }
    </style>
</head>
<body>
    <div class="container">
        <h1>Project Onboarding: ${projectName}</h1>
        <p class="subtitle">Establish your deterministic guardrails. Define your strategy to unlock agent execution.</p>

        <div id="init-view" class="view ${!isScaffolded ? 'active' : ''}">
            <div class="card">
                <h3>Project Initialization</h3>
                <p style="color: #8b949e; font-size: 14px; margin-bottom: 24px;">Define the core identity of this MCD project.</p>
                
                <div class="form-group">
                    <label>Project Name</label>
                    <input type="text" id="initProjectName" placeholder="e.g. Acme Web App">
                </div>
                
                <div class="form-group">
                    <label>Codename</label>
                    <input type="text" id="initCodename" placeholder="e.g. Phoenix" style="text-transform: uppercase;">
                    <span class="hint">One word, uppercase. Used for branching and prefixing.</span>
                </div>
                
                <div style="display: flex; gap: 16px;">
                    <div class="form-group" style="flex: 1;">
                        <label>Port</label>
                        <input type="text" id="initPort" value="4000">
                        <span class="hint">Command Deck port.</span>
                    </div>
                    <div class="form-group" style="flex: 1;">
                        <label>Initial Version</label>
                        <input type="text" id="initVersion" value="0.1.0">
                    </div>
                </div>

                <div class="form-group">
                    <label>Command Deck Language</label>
                    <select id="initLang" style="width: 100%; padding: 8px 12px; background-color: var(--mcd-bg); border: 1px solid var(--mcd-border); border-radius: 6px; color: var(--mcd-text); font-size: 14px;">
                        <option value="node">Node.js</option>
                        <option value="python">Python</option>
                    </select>
                </div>
            </div>
            
            <div class="footer-buttons" style="justify-content: flex-end;">
                <button id="btn-submit-init" class="primary" style="flex: 0 1 auto; padding-left: 40px; padding-right: 40px;">Initialize Project</button>
            </div>
        </div>

        <div id="selection-view" class="view ${isScaffolded ? 'active' : ''}">
            <div class="card">
                <h3>How would you like to build your Strategy?</h3>
                <p style="color: #8b949e; font-size: 14px; margin-bottom: 24px;">Choose an approach to generate your Project Charter and High-Level PRD.</p>
                
                <div class="button-group">
                    <button id="btn-show-manual" style="display: flex; flex-direction: column; align-items: center; gap: 8px;">
                        <span style="font-size: 24px;">✍️</span>
                        <span>Start from Scratch</span>
                        <span style="font-size: 12px; font-weight: 400; color: #8b949e;">Fill out 6 quick fields</span>
                    </button>
                    <button id="btn-action-import" class="primary" style="display: flex; flex-direction: column; align-items: center; gap: 8px;">
                        <span style="font-size: 24px;">📂</span>
                        <span>Import Source Docs</span>
                        <span style="font-size: 12px; font-weight: 400; color: rgba(255,255,255,0.7);">Agent derivation flow</span>
                    </button>
                </div>
            </div>
            
            <div style="text-align: right;">
                <button id="btn-cancel" style="background: none; border: none; color: #8b949e; padding: 0;">Skip for now</button>
            </div>
        </div>

        <div id="manual-view" class="view">
            <div class="card">
                <h3>Manual Strategy Definition</h3>
                
                <div class="form-group">
                    <label>Target Users</label>
                    <input type="text" id="targetUsers" placeholder="e.g. Solo developers building with AI coding agents">
                </div>
                
                <div class="form-group">
                    <label>Problem Statement</label>
                    <input type="text" id="problemStatement" placeholder="e.g. AI agents lack deterministic guardrails, causing scope creep">
                </div>
                
                <div class="form-group">
                    <label>Core Value Proposition</label>
                    <input type="text" id="coreValue" placeholder="e.g. A contract-governed workflow that enforces deterministic engineering">
                </div>
                
                <div class="form-group">
                    <label>Hard Non-Goals</label>
                    <input type="text" id="nonGoals" placeholder="e.g. No multi-user support; No cloud hosting">
                </div>
                
                <hr style="border: none; border-top: 1px solid var(--mcd-border); margin: 32px 0;">
                
                <div class="form-group">
                    <label>Key Features (Version ${initialVersion})</label>
                    <input type="text" id="keyFeatures" placeholder="e.g. Scaffold generator, Kanban board, Contract management">
                </div>
                
                <div class="form-group">
                    <label>Success Metric</label>
                    <input type="text" id="successMetric" placeholder="e.g. A new project can be initialized and tracked end-to-end in under 5 minutes">
                </div>
            </div>

            <div class="footer-buttons">
                <button id="btn-back-manual" style="flex: 0 1 auto;">← Back</button>
                <button id="btn-submit-manual" class="primary" style="flex: 0 1 auto; padding-left: 40px; padding-right: 40px;">Generate Strategy Artifacts</button>
            </div>
        </div>

        <div id="agent-handoff-view" class="view">
            <div class="card">
                <h3>Agent Strategy Handoff</h3>
                <p style="color: #8b949e; font-size: 14px; margin-bottom: 24px;">Your project files are ready. Follow these steps to generate your Project Charter and PRD with your AI Agent.</p>
                
                <div class="step-card" style="background: rgba(240, 246, 252, 0.02); border: 1px solid var(--mcd-border); padding: 16px; border-radius: 6px; margin-bottom: 16px;">
                    <div style="font-weight: 600; margin-bottom: 8px;">Step 1: Project Charter</div>
                    <details style="margin-bottom: 12px;">
                        <summary style="cursor: pointer; color: var(--vscode-textLink-foreground); font-size: 13px; margin-bottom: 8px;">View Prompt Payload</summary>
                        <code id="charter-prompt-display" style="display: block; background: var(--mcd-bg); padding: 12px; border-radius: 4px; border: 1px solid var(--mcd-border); font-family: monospace; font-size: 12px; color: var(--mcd-text); white-space: pre-wrap; word-break: break-word; max-height: 180px; overflow-y: auto;"></code>
                    </details>
                    <button id="btn-copy-charter" class="primary" style="width: 100%;">Copy Charter Prompt</button>
                </div>

                <div class="step-card" style="background: rgba(240, 246, 252, 0.02); border: 1px solid var(--mcd-border); padding: 16px; border-radius: 6px; margin-bottom: 16px;">
                    <div style="font-weight: 600; margin-bottom: 8px;">Step 2: High-Level PRD</div>
                    <p style="font-size: 13px; color: #8b949e; margin-top: 0; margin-bottom: 8px;">Wait for the agent to finish writing the Charter before copying this prompt.</p>
                    <details style="margin-bottom: 12px;">
                        <summary style="cursor: pointer; color: var(--vscode-textLink-foreground); font-size: 13px; margin-bottom: 8px;">View Prompt Payload</summary>
                        <code id="prd-prompt-display" style="display: block; background: var(--mcd-bg); padding: 12px; border-radius: 4px; border: 1px solid var(--mcd-border); font-family: monospace; font-size: 12px; color: var(--mcd-text); white-space: pre-wrap; word-break: break-word; max-height: 180px; overflow-y: auto;"></code>
                    </details>
                    <button id="btn-copy-prd" style="width: 100%;" disabled>Copy PRD Prompt</button>
                </div>

                <div id="handoff-complete" style="display: none; text-align: center; margin-top: 32px; padding-top: 24px; border-top: 1px solid var(--mcd-border);">
                    <h3 style="color: #2ea043; margin-bottom: 8px;">✅ Strategy Documents Started!</h3>
                    <p style="color: #8b949e; font-size: 14px; margin-bottom: 24px;">Review your documents with the agent. When you're ready, launch the Command Deck to track your work.</p>
                    <button id="btn-launch-cd" class="primary" style="width: 100%;">Complete & Launch Command Deck</button>
                </div>
            </div>
        </div>

        <div id="manual-success-view" class="view">
            <div class="card" style="text-align: center;">
                <h3 style="color: #2ea043; margin-bottom: 8px;">✅ Strategy Documents Completed!</h3>
                <p style="color: #8b949e; font-size: 14px; margin-bottom: 24px;">Your Project Charter and High-Level PRD have been generated and committed to the repository. The project is ready for execution.</p>
                <div style="padding: 24px; background: rgba(240, 246, 252, 0.02); border: 1px solid var(--mcd-border); border-radius: 6px; margin-bottom: 24px;">
                    <p style="margin: 0;">Launch the Command Deck to view your Kanban board and govern your Micro-Contracts.</p>
                </div>
                <button id="btn-launch-cd-manual" class="primary" style="width: 100%; font-size: 16px; padding: 12px;">Launch Command Deck</button>
            </div>
        </div>

        <div id="manual-success-view" class="view">
            <div class="card" style="text-align: center;">
                <h3 style="color: #2ea043; margin-bottom: 8px;">✅ Strategy Documents Completed!</h3>
                <p style="color: #8b949e; font-size: 14px; margin-bottom: 24px;">Your Project Charter and High-Level PRD have been generated and committed to the repository. The project is ready for execution.</p>
                <div style="padding: 24px; background: rgba(240, 246, 252, 0.02); border: 1px solid var(--mcd-border); border-radius: 6px; margin-bottom: 24px;">
                    <p style="margin: 0;">Launch the Command Deck to view your Kanban board and govern your Micro-Contracts.</p>
                </div>
                <button id="btn-launch-cd-manual" class="primary" style="width: 100%; font-size: 16px; padding: 12px;">Launch Command Deck</button>
            </div>
        </div>
    </div>

    <script>
        const vscode = acquireVsCodeApi();

        // View swapping
        const initView = document.getElementById('init-view');
        const selectionView = document.getElementById('selection-view');
        const manualView = document.getElementById('manual-view');
        const handoffView = document.getElementById('agent-handoff-view');
        const manualSuccessView = document.getElementById('manual-success-view');

        const charterPromptDisplay = document.getElementById('charter-prompt-display');
        const prdPromptDisplay = document.getElementById('prd-prompt-display');
        const btnCopyCharter = document.getElementById('btn-copy-charter');
        const btnCopyPrd = document.getElementById('btn-copy-prd');
        const handoffComplete = document.getElementById('handoff-complete');
        const btnLaunchCd = document.getElementById('btn-launch-cd');
        const btnLaunchCdManual = document.getElementById('btn-launch-cd-manual');

        let charterPromptText = '';
        let prdPromptText = '';

        // Note: The visibility of init vs selection is driven by the state injected during HTML generation

        if (document.getElementById('btn-submit-init')) {
            document.getElementById('btn-submit-init').addEventListener('click', () => {
                const data = {
                    projectName: document.getElementById('initProjectName').value,
                    codename: document.getElementById('initCodename').value,
                    port: parseInt(document.getElementById('initPort').value) || 4000,
                    initialVersion: document.getElementById('initVersion').value,
                    serverLang: document.getElementById('initLang').value
                };

                for (const key in data) {
                    if (key !== 'port' && key !== 'serverLang' && !data[key]) {
                        const id = key === 'initialVersion' ? 'initVersion' : 'init' + key.charAt(0).toUpperCase() + key.slice(1);
                        document.getElementById(id).style.borderColor = '#fa4549';
                        return;
                    }
                }

                const btn = document.getElementById('btn-submit-init');
                btn.disabled = true;
                btn.innerText = 'Initializing...';
                btn.style.opacity = '0.7';
                btn.style.cursor = 'not-allowed';

                vscode.postMessage({
                    command: 'startScaffold',
                    data: data
                });
            });
        }

        if (document.getElementById('btn-show-manual')) {
            document.getElementById('btn-show-manual').addEventListener('click', () => {
                selectionView.classList.remove('active');
                manualView.classList.add('active');
            });
        }

        if (document.getElementById('btn-back-manual')) {
            document.getElementById('btn-back-manual').addEventListener('click', () => {
                manualView.classList.remove('active');
                selectionView.classList.add('active');
            });
        }

        if (document.getElementById('btn-cancel')) {
            document.getElementById('btn-cancel').addEventListener('click', () => {
                vscode.postMessage({ command: 'cancel' });
            });
        }

        if (document.getElementById('btn-action-import')) {
            document.getElementById('btn-action-import').addEventListener('click', () => {
                const btn = document.getElementById('btn-action-import');
                btn.innerText = 'Importing...';
                btn.disabled = true;
                btn.style.opacity = '0.7';
                vscode.postMessage({ command: 'importDocs' });
            });
        }

        if (document.getElementById('btn-submit-manual')) {
            document.getElementById('btn-submit-manual').addEventListener('click', () => {
            const data = {
                targetUsers: document.getElementById('targetUsers').value,
                problemStatement: document.getElementById('problemStatement').value,
                coreValue: document.getElementById('coreValue').value,
                nonGoals: document.getElementById('nonGoals').value,
                keyFeatures: document.getElementById('keyFeatures').value,
                successMetric: document.getElementById('successMetric').value
            };
            
            // Basic validation
            for (const key in data) {
                if (!data[key].trim()) {
                    // Quick and dirty visual validation
                    document.getElementById(key).style.borderColor = '#fa4549';
                    return; // Stop submission
                } else {
                    document.getElementById(key).style.borderColor = 'var(--mcd-border)';
                }
            }

            const btn = document.getElementById('btn-submit-manual');
            btn.innerText = 'Generating...';
            btn.disabled = true;
            btn.style.opacity = '0.7';

            vscode.postMessage({
                command: 'generateManual',
                data: data
            });
        });
        }

        // Clear error styling on input
        document.querySelectorAll('input').forEach(input => {
            input.addEventListener('input', (e) => {
                e.target.style.borderColor = 'var(--mcd-border)';
            });
        });

        if (btnCopyCharter) {
            btnCopyCharter.addEventListener('click', () => {
                vscode.postMessage({ command: 'copyToClipboard', text: charterPromptText });
                btnCopyCharter.innerText = '✅ Charter Prompt Copied!';
                btnCopyCharter.style.backgroundColor = '#238636';
                btnCopyCharter.disabled = true;
                
                btnCopyPrd.disabled = false;
                btnCopyPrd.classList.add('primary');
            });
        }

        if (btnCopyPrd) {
            btnCopyPrd.addEventListener('click', () => {
                vscode.postMessage({ command: 'copyToClipboard', text: prdPromptText });
                btnCopyPrd.innerText = '✅ PRD Prompt Copied!';
                btnCopyPrd.style.backgroundColor = '#238636';
                btnCopyPrd.disabled = true;

                handoffComplete.style.display = 'block';
            });
        }

        if (btnLaunchCd) {
            btnLaunchCd.addEventListener('click', () => {
                vscode.postMessage({ command: 'launchCommandDeck' });
            });
        }

        if (btnLaunchCdManual) {
            btnLaunchCdManual.addEventListener('click', () => {
                vscode.postMessage({ command: 'launchCommandDeck' });
            });
        }

        // Listen for messages from the extension
        window.addEventListener('message', event => {
            const message = event.data;
            switch (message.command) {
                case 'scaffoldComplete':
                    if (initView && selectionView) {
                        initView.classList.remove('active');
                        // Small delay for smooth transition feel
                        setTimeout(() => {
                            selectionView.classList.add('active');
                        }, 150);
                    }
                    break;
                case 'handoffReady':
                    charterPromptText = message.data.charterPrompt;
                    prdPromptText = message.data.prdPrompt;
                    
                    charterPromptDisplay.innerText = charterPromptText;
                    prdPromptDisplay.innerText = prdPromptText;

                    if (manualView) manualView.classList.remove('active');
                    if (selectionView) selectionView.classList.remove('active');
                    handoffView.classList.add('active');
                    break;
                case 'manualComplete':
                    if (manualView) manualView.classList.remove('active');
                    if (selectionView) selectionView.classList.remove('active');
                    manualSuccessView.classList.add('active');
                    break;
            }
        });

    </script>
</body>
</html>`;
    }
}
