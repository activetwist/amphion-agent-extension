import * as vscode from 'vscode';
import { ProjectConfig } from './wizard';
import { runManualPath, runSourceDocsPath } from './charterWizard';

export class OnboardingPanel {
    public static currentPanel: OnboardingPanel | undefined;
    private readonly _panel: vscode.WebviewPanel;
    private readonly _extensionUri: vscode.Uri;
    private _disposables: vscode.Disposable[] = [];

    public static createOrShow(
        extensionUri: vscode.Uri,
        root: vscode.Uri,
        config: ProjectConfig,
        terminal: vscode.Terminal
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
            `MCD Onboarding: ${config.projectName}`,
            column || vscode.ViewColumn.One,
            {
                enableScripts: true,
                localResourceRoots: [vscode.Uri.joinPath(extensionUri, 'assets')],
                retainContextWhenHidden: true
            }
        );

        OnboardingPanel.currentPanel = new OnboardingPanel(panel, extensionUri, root, config, terminal);
    }

    private constructor(
        panel: vscode.WebviewPanel,
        extensionUri: vscode.Uri,
        root: vscode.Uri,
        config: ProjectConfig,
        terminal: vscode.Terminal
    ) {
        this._panel = panel;
        this._extensionUri = extensionUri;

        this._update(config);

        this._panel.onDidDispose(() => this.dispose(), null, this._disposables);

        this._panel.webview.onDidReceiveMessage(
            async (message) => {
                switch (message.command) {
                    case 'generateManual':
                        this._panel.dispose(); // Close the UI as it bridges to the agent
                        await runManualPath(root, config, terminal, message.data);
                        return;
                    case 'importDocs':
                        this._panel.dispose();
                        await runSourceDocsPath(root, config, terminal);
                        return;
                    case 'cancel':
                        this._panel.dispose();
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

    private _update(config: ProjectConfig) {
        this._panel.webview.html = this._getHtmlForWebview(config);
    }

    private _getHtmlForWebview(config: ProjectConfig) {
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
        <h1>Project Onboarding: ${config.projectName}</h1>
        <p class="subtitle">Establish your deterministic guardrails. Define your strategy to unlock agent execution.</p>

        <div id="selection-view" class="view active">
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
                    <label>Key Features (Version ${config.initialVersion})</label>
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
    </div>

    <script>
        const vscode = acquireVsCodeApi();

        // View swapping
        const selectionView = document.getElementById('selection-view');
        const manualView = document.getElementById('manual-view');

        document.getElementById('btn-show-manual').addEventListener('click', () => {
            selectionView.classList.remove('active');
            manualView.classList.add('active');
        });

        document.getElementById('btn-back-manual').addEventListener('click', () => {
            manualView.classList.remove('active');
            selectionView.classList.add('active');
        });

        // Actions
        document.getElementById('btn-cancel').addEventListener('click', () => {
            vscode.postMessage({ command: 'cancel' });
        });

        document.getElementById('btn-action-import').addEventListener('click', () => {
            vscode.postMessage({ command: 'importDocs' });
        });

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

            vscode.postMessage({
                command: 'generateManual',
                data: data
            });
        });

        // Clear error styling on input
        document.querySelectorAll('input').forEach(input => {
            input.addEventListener('input', (e) => {
                e.target.style.borderColor = 'var(--mcd-border)';
            });
        });
    </script>
</body>
</html>`;
    }
}
