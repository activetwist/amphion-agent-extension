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
                    case 'startGuided':
                        if (!scaffoldComplete) return;
                        this._panel.dispose();
                        try {
                            const { runGuidedWizard } = await import('./onboarding/guidedWizard');
                            const { writeFoundationJson } = await import('./foundation/foundationWriter');
                            const { renderCharterFromFoundation } = await import('./templates/charterFromFoundation');
                            const { renderPrdFromFoundation } = await import('./templates/prdFromFoundation');
                            const { promptPostInitReview } = await import('./postInit/postInitPrompt');

                            const foundationState = await runGuidedWizard(this._config!);
                            if (foundationState) {
                                await writeFoundationJson(root, foundationState);

                                const timestamp = new Date().toISOString().replace(/[-:T]/g, '').slice(0, 12);
                                const encoder = new TextEncoder();

                                await vscode.workspace.fs.writeFile(
                                    vscode.Uri.joinPath(root, `referenceDocs/01_Strategy/${timestamp}-PROJECT_CHARTER.md`),
                                    encoder.encode(renderCharterFromFoundation(foundationState, timestamp))
                                );

                                await vscode.workspace.fs.writeFile(
                                    vscode.Uri.joinPath(root, `referenceDocs/01_Strategy/${timestamp}-HIGH_LEVEL_PRD.md`),
                                    encoder.encode(renderPrdFromFoundation(foundationState, timestamp))
                                );

                                this._terminal!.sendText('git add referenceDocs/');
                                this._terminal!.sendText(`git commit -m "docs(${this._config!.initialVersion}): generate SIP-1 foundation + artifacts"`);

                                await promptPostInitReview(root, this._config!);
                            } else {
                                vscode.window.showInformationMessage('Guided Init aborted.');
                            }
                        } catch (e) {
                            console.error('Guided Init error', e);
                            vscode.window.showErrorMessage('Failed to complete Guided Init.');
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
        <h1 id="main-title">Project Onboarding: ${projectName}</h1>
        <p class="subtitle">We'll set up your project with initial guardrails and build your strategy documents.</p>

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
                
                <h3 style="margin-top: 32px;">Command Deck Setup</h3>
                <p style="color: #8b949e; font-size: 14px; margin-bottom: 24px;">We are setting up your Command Deck — with a Kanban, Dashboard, and Mermaid charts viewer, as well as an overview of Micro-Contract Development.</p>

                <div style="display: flex; gap: 16px;">
                    <div class="form-group" style="flex: 1;">
                        <label>Port</label>
                        <input type="text" id="initPort" value="8765">
                        <span class="hint">Command Deck port.</span>
                    </div>
                    <div class="form-group" style="flex: 1;">
                        <label>Initial Version</label>
                        <input type="text" id="initVersion" value="0.1.0">
                    </div>
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
                
                <div class="button-group" style="display: grid; grid-template-columns: repeat(3, 1fr); gap: 16px;">
                    <button id="btn-show-manual" style="display: flex; flex-direction: column; align-items: center; justify-content: center; gap: 8px; padding: 24px 12px; height: 100%;">
                        <span style="font-size: 24px;">⚡</span>
                        <span>Fast Onboarding</span>
                        <span style="font-size: 12px; font-weight: 400; color: #8b949e; text-align: center;">I understand Product Management language very well, and I already know how to define and measure my project success.</span>
                    </button>
                    <button id="btn-show-guided" style="display: flex; flex-direction: column; align-items: center; justify-content: center; gap: 8px; padding: 24px 12px; height: 100%;">
                        <span style="font-size: 24px;">🧭</span>
                        <span>Guided Onboarding</span>
                        <span style="font-size: 12px; font-weight: 400; color: #8b949e; text-align: center;">Answer a series of guided questions with easy descriptions to help you build the strategic documents for your project.</span>
                    </button>
                    <button id="btn-action-import" style="display: flex; flex-direction: column; align-items: center; justify-content: center; gap: 8px; padding: 24px 12px; height: 100%;">
                        <span style="font-size: 24px;">📂</span>
                        <span>Import Docs</span>
                        <span style="font-size: 12px; font-weight: 400; color: #8b949e; text-align: center;">I have a project charter and product requirements document already, and I would like to import them to initialize the project.</span>
                    </button>
                </div>
            </div>
            
            <div style="text-align: right;">
                <button id="btn-cancel" style="background: none; border: none; color: #8b949e; padding: 0;">Skip for now</button>
            </div>
        </div>

        <div id="manual-view" class="view">
            <div class="card">
                <h3>Project Blueprint</h3>
                
                <div class="form-group">
                    <label title="Who are you building this project for?">Who is this for?</label>
                    <input type="text" id="targetUsers" placeholder="e.g. Freelance designers using AI for layout ideas">
                </div>
                
                <div class="form-group">
                    <label title="What is the core pain point or challenge your target users face?">What are you solving?</label>
                    <input type="text" id="problemStatement" placeholder="e.g. It takes too long to format resumes manually">
                </div>
                
                <div class="form-group">
                    <label title="Describe the one main benefit your project provides.">The Big Idea</label>
                    <input type="text" id="coreValue" placeholder="e.g. A one-click tool that turns LinkedIn profiles into PDFs">
                </div>
                
                <div class="form-group">
                    <label title="What features or capabilities are explicitly NOT included in this release?">Out of Scope</label>
                    <input type="text" id="nonGoals" placeholder="e.g. No mobile app; No custom fonts in v1">
                </div>
                
                <hr style="border: none; border-top: 1px solid var(--mcd-border); margin: 32px 0;">
                
                <div class="form-group">
                    <label>Key Features (Version ${initialVersion})</label>
                    <input type="text" id="keyFeatures" placeholder="e.g. Scaffold generator, Kanban board, Contract management">
                </div>
                
                <div class="form-group">
                    <label title="What is the primary indicator that this project has achieved its goal?">Definition of "Done"</label>
                    <input type="text" id="successMetric" placeholder="e.g. A user can export a finished resume in 60 seconds">
                </div>
            </div>

            <div class="footer-buttons">
                <button id="btn-back-manual" style="flex: 0 1 auto;">← Back</button>
                <button id="btn-submit-manual" class="primary" style="flex: 0 1 auto; padding-left: 40px; padding-right: 40px;">Generate Strategy Artifacts</button>
            </div>
        </div>

        <div id="agent-handoff-view" class="view">
            <div class="card">
                <h3>Universal Onboarding Rails</h3>
                <p style="color: #8b949e; font-size: 14px; margin-bottom: 24px;">Your project has been started, and custom commands for your IDE have been added.</p>
                
                <div id="step-docs" class="step-card" style="background: rgba(240, 246, 252, 0.02); border: 1px solid var(--mcd-border); padding: 24px; border-radius: 12px; margin-bottom: 16px; text-align: center;">
                    <div style="font-weight: 600; font-size: 18px; margin-bottom: 16px;">Build Strategy Documents</div>
                    <div style="background: var(--mcd-bg); padding: 12px; border-radius: 6px; border: 1px solid var(--mcd-border); font-family: monospace; font-size: 16px; color: var(--mcd-accent); margin-bottom: 16px;">
                        /docs
                    </div>
                    <p style="font-size: 13px; color: #8b949e; margin-bottom: 20px;">Type '/docs' in your Agent Chat to create your Charter and PRD from the materials you provided.</p>
                    <button id="btn-docs-done" class="primary" style="width: 100%;">Agent Confirmed Documents.</button>
                </div>

                <div id="handoff-complete" style="display: none; text-align: center; margin-top: 32px; padding-top: 24px; border-top: 1px solid var(--mcd-border);">
                    <h3 style="color: #2ea043; margin-bottom: 12px;">Strategy Architecture Complete</h3>
                    <p style="color: #8b949e; font-size: 14px; margin-bottom: 24px;">Your Project Strategy is now fully documented. You are ready to launch the Command Deck.</p>
                    <button id="btn-launch-cd" class="primary" style="width: 100%; font-size: 16px;">Open Command Deck</button>
                </div>
            </div>
        </div>

        <div id="manual-success-view" class="view">
            <div class="card" style="text-align: center;">
                <h3 style="color: #2ea043; margin-bottom: 8px;">✅ System Architecture Locked!</h3>
                <p style="color: #8b949e; font-size: 14px; margin-bottom: 24px;">Your Project Charter and High-Level PRD have been generated and committed to the repository. The project is ready for Micro-Contracting.</p>
                <div style="padding: 24px; background: rgba(240, 246, 252, 0.02); border: 1px solid var(--mcd-border); border-radius: 6px; margin-bottom: 24px;">
                    <p style="margin: 0;">Open the Command Deck to partition your work into Micro-Contracts and begin execution.</p>
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

        const stepDocs = document.getElementById('step-docs');
        const btnDocsDone = document.getElementById('btn-docs-done');
        const handoffComplete = document.getElementById('handoff-complete');
        const btnLaunchCd = document.getElementById('btn-launch-cd');
        const btnLaunchCdManual = document.getElementById('btn-launch-cd-manual');

        if (document.getElementById('btn-submit-init')) {
            document.getElementById('btn-submit-init').addEventListener('click', () => {
                const data = {
                    projectName: document.getElementById('initProjectName').value,
                    codename: document.getElementById('initCodename').value,
                    port: parseInt(document.getElementById('initPort').value) || 4000,
                    initialVersion: document.getElementById('initVersion').value,
                    serverLang: 'python'
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

                document.getElementById('main-title').innerText = 'Project Onboarding: ' + data.projectName;

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

        if (document.getElementById('btn-show-guided')) {
            document.getElementById('btn-show-guided').addEventListener('click', () => {
                const btn = document.getElementById('btn-show-guided');
                btn.innerText = 'Starting...';
                btn.disabled = true;
                btn.style.opacity = '0.7';
                vscode.postMessage({ command: 'startGuided' });
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
                
                for (const key in data) {
                    if (!data[key].trim()) {
                        document.getElementById(key).style.borderColor = '#fa4549';
                        return;
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

        document.querySelectorAll('input').forEach(input => {
            input.addEventListener('input', (e) => {
                e.target.style.borderColor = 'var(--mcd-border)';
            });
        });

        if (btnDocsDone) {
            btnDocsDone.addEventListener('click', () => {
                stepDocs.style.display = 'none';
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

        window.addEventListener('message', event => {
            const message = event.data;
            switch (message.command) {
                case 'scaffoldComplete':
                    if (initView && selectionView) {
                        initView.classList.remove('active');
                        setTimeout(() => {
                            selectionView.classList.add('active');
                        }, 150);
                    }
                    break;
                case 'handoffReady':
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
