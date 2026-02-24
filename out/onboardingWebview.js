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
exports.OnboardingPanel = void 0;
const vscode = __importStar(require("vscode"));
const charterWizard_1 = require("./charterWizard");
const scaffolder_1 = require("./scaffolder");
const initMode_1 = require("./onboarding/initMode");
class OnboardingPanel {
    static createOrShow(extensionUri, root) {
        const column = vscode.window.activeTextEditor
            ? vscode.window.activeTextEditor.viewColumn
            : undefined;
        if (OnboardingPanel.currentPanel) {
            OnboardingPanel.currentPanel._panel.reveal(column);
            return;
        }
        const panel = vscode.window.createWebviewPanel('mcdOnboarding', `MCD Onboarding`, column || vscode.ViewColumn.One, {
            enableScripts: true,
            localResourceRoots: [vscode.Uri.joinPath(extensionUri, 'assets')],
            retainContextWhenHidden: true
        });
        OnboardingPanel.currentPanel = new OnboardingPanel(panel, extensionUri, root);
    }
    constructor(panel, extensionUri, root) {
        this._disposables = [];
        this._panel = panel;
        this._extensionUri = extensionUri;
        this._update();
        let scaffoldComplete = false;
        this._panel.onDidDispose(() => this.dispose(), null, this._disposables);
        this._panel.webview.onDidReceiveMessage(async (message) => {
            switch (message.command) {
                case 'startScaffold':
                    this._config = message.data;
                    this._terminal = vscode.window.createTerminal({
                        name: 'MCD Init',
                        cwd: root.fsPath,
                    });
                    await vscode.window.withProgress({
                        location: vscode.ProgressLocation.Notification,
                        title: `MCD: Initializing ${this._config.projectName}...`,
                        cancellable: false,
                    }, async (progress) => {
                        progress.report({ message: 'Writing scaffold directories...' });
                        await (0, scaffolder_1.buildScaffold)(root, this._config, extensionUri, this._terminal);
                        progress.report({ increment: 100, message: 'Done!' });
                    });
                    vscode.window.showInformationMessage(`✅ MCD project "${this._config.projectName}" initialized! The Command Deck is starting on port ${this._config.port}.`);
                    scaffoldComplete = true;
                    this._panel.webview.postMessage({ command: 'scaffoldComplete' });
                    return;
                case 'generateManual':
                    if (!scaffoldComplete)
                        return;
                    await (0, charterWizard_1.runManualPath)(root, this._config, this._terminal, message.data);
                    this._panel.webview.postMessage({ command: 'manualComplete' });
                    return;
                case 'importDocs':
                    if (!scaffoldComplete)
                        return;
                    const importPrompts = await (0, charterWizard_1.runSourceDocsPath)(root, this._config, this._terminal);
                    if (importPrompts) {
                        this._panel.webview.postMessage({ command: 'handoffReady', data: importPrompts });
                    }
                    return;
                case 'submitGuided':
                    if (!scaffoldComplete || !this._config || !this._terminal)
                        return;
                    try {
                        const { writeFoundationJson } = await Promise.resolve().then(() => __importStar(require('./foundation/foundationWriter')));
                        const { renderCharterFromFoundation } = await Promise.resolve().then(() => __importStar(require('./templates/charterFromFoundation')));
                        const { renderPrdFromFoundation } = await Promise.resolve().then(() => __importStar(require('./templates/prdFromFoundation')));
                        const guidedSubmission = this._asGuidedSubmissionData(message.data);
                        if (!guidedSubmission) {
                            vscode.window.showErrorMessage('Guided onboarding payload was invalid.');
                            return;
                        }
                        const foundationState = this._buildGuidedFoundationState(guidedSubmission);
                        const wrote = await writeFoundationJson(root, foundationState);
                        if (!wrote) {
                            vscode.window.showInformationMessage('Guided Init aborted.');
                            return;
                        }
                        const timestamp = new Date().toISOString().replace(/[-:T]/g, '').slice(0, 12);
                        const encoder = new TextEncoder();
                        await vscode.workspace.fs.writeFile(vscode.Uri.joinPath(root, `referenceDocs/01_Strategy/${timestamp}-PROJECT_CHARTER.md`), encoder.encode(renderCharterFromFoundation(foundationState, timestamp)));
                        await vscode.workspace.fs.writeFile(vscode.Uri.joinPath(root, `referenceDocs/01_Strategy/${timestamp}-HIGH_LEVEL_PRD.md`), encoder.encode(renderPrdFromFoundation(foundationState, timestamp)));
                        this._terminal.sendText('git add referenceDocs/');
                        this._terminal.sendText(`git commit -m "docs(${this._config.initialVersion}): generate SIP-1 foundation + artifacts"`);
                        this._panel.webview.postMessage({ command: 'manualComplete' });
                    }
                    catch (e) {
                        console.error('Guided Init error', e);
                        vscode.window.showErrorMessage('Failed to complete Guided Init.');
                    }
                    return;
                case 'cancel':
                    if (!scaffoldComplete)
                        return;
                    this._panel.dispose();
                    const action = await vscode.window.showInformationMessage('MCD has initialized your project! The Command Deck kanban board will now launch in your browser. Return to VS Code when you are ready to manage your work.', { modal: true }, 'Launch Command Deck');
                    if (action === 'Launch Command Deck') {
                        await (0, scaffolder_1.launchCommandDeck)(root, this._config);
                    }
                    return;
                case 'copyToClipboard':
                    await vscode.env.clipboard.writeText(message.text);
                    return;
                case 'launchCommandDeck':
                    this._panel.dispose();
                    await (0, scaffolder_1.launchCommandDeck)(root, this._config);
                    return;
            }
        }, null, this._disposables);
    }
    dispose() {
        OnboardingPanel.currentPanel = undefined;
        this._panel.dispose();
        while (this._disposables.length) {
            const x = this._disposables.pop();
            if (x) {
                x.dispose();
            }
        }
    }
    _asGuidedSubmissionData(value) {
        if (!value || typeof value !== 'object') {
            return undefined;
        }
        const data = value;
        const toString = (input) => typeof input === 'string' ? input : '';
        const toStringArray = (input) => Array.isArray(input) ? input.filter((item) => typeof item === 'string') : [];
        return {
            targetUsers: toStringArray(data.targetUsers),
            targetUsersOther: toString(data.targetUsersOther),
            targetSuccess: toString(data.targetSuccess),
            problemTypes: toStringArray(data.problemTypes),
            painfulStep: toString(data.painfulStep),
            reduces: toStringArray(data.reduces),
            increases: toStringArray(data.increases),
            coreValue: toString(data.coreValue),
            doNotInclude: toStringArray(data.doNotInclude),
            explicitNonGoal: toString(data.explicitNonGoal),
            targetVersion: toString(data.targetVersion),
            rawFeatures: toString(data.rawFeatures),
            metricType: toString(data.metricType),
            metricTarget: toString(data.metricTarget),
            metricHorizon: toString(data.metricHorizon),
            deploy: toString(data.deploy),
            dataStore: toString(data.dataStore),
            security: toStringArray(data.security),
            openQs: toString(data.openQs),
        };
    }
    _buildGuidedFoundationState(data) {
        const cleanArray = (items) => items.map((item) => item.trim()).filter((item) => item.length > 0);
        const cleanedTargetUsers = cleanArray(data.targetUsers);
        const targetUsersOther = data.targetUsersOther.trim();
        const targetUsers = cleanedTargetUsers.includes('Other')
            ? cleanedTargetUsers.filter((user) => user !== 'Other').concat(targetUsersOther ? [targetUsersOther] : [])
            : cleanedTargetUsers;
        const features = data.rawFeatures
            .split(',')
            .map((feature) => feature.trim())
            .filter((feature) => feature.length > 0)
            .slice(0, 5);
        const openQuestions = data.openQs.trim().length > 0
            ? data.openQs.split(',').map((q) => q.trim()).filter((q) => q.length > 0)
            : [];
        const now = new Date().toISOString();
        return {
            schemaVersion: 'sip-1',
            createdAt: now,
            updatedAt: now,
            initMode: initMode_1.InitMode.Guided,
            project: {
                name: this._config?.projectName ?? 'Unknown Project',
                codename: this._config?.codename ?? 'UNKNOWN',
                version: data.targetVersion.trim(),
                repoType: 'new'
            },
            actors: {
                primaryBuilder: 'solo',
                roles: ['developer']
            },
            product: {
                targetUsers: targetUsers.concat(`Success Profile: ${data.targetSuccess.trim()}`),
                problemStatement: `Pain points: ${cleanArray(data.problemTypes).join(', ')}. Most painful step: ${data.painfulStep.trim()}`,
                coreValueProposition: `Reduces: ${cleanArray(data.reduces).join(', ')}. Increases: ${cleanArray(data.increases).join(', ')}. Core: ${data.coreValue.trim()}`,
                hardNonGoals: cleanArray(data.doNotInclude).concat(`Explicitly excluded: ${data.explicitNonGoal.trim()}`),
                keyFeatures: features,
                successMetric: {
                    type: data.metricType.trim(),
                    definition: data.metricType.trim(),
                    target: data.metricTarget.trim(),
                    timeHorizon: data.metricHorizon.trim()
                }
            },
            constraints: {
                deployment: data.deploy.trim(),
                data: data.dataStore.trim(),
                security: cleanArray(data.security),
                performance: [],
                outOfScope: [],
                ai: {
                    usesAI: false,
                    providers: [],
                    multiModel: false,
                    safetyNotes: []
                }
            },
            notes: {
                openQuestions,
                assumptions: [],
                risks: []
            }
        };
    }
    _update() {
        this._panel.title = this._config ? `MCD Onboarding: ${this._config.projectName}` : 'MCD Onboarding';
        this._panel.webview.html = this._getHtmlForWebview();
    }
    _getHtmlForWebview() {
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

        .option-row {
            display: flex;
            align-items: center;
            justify-content: space-between;
            gap: 24px;
            padding: 24px 0;
            border-bottom: 1px solid var(--mcd-border);
        }

        .option-row:last-child {
            border-bottom: none;
        }

        .option-row-content {
            flex: 1;
            text-align: left;
        }

        .option-row-content h4 {
            margin: 0 0 4px 0;
            font-size: 16px;
        }

        .option-row button {
            flex: 0 0 auto;
            width: 260px;
            padding: 12px 24px;
            display: flex;
            align-items: center;
            justify-content: center;
            gap: 8px;
            font-size: 14px;
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
                
                <div class="option-list">
                    <div class="option-row">
                        <div class="option-row-content">
                            <h4>1. Fast Onboard</h4>
                            <p class="hint">I understand Product Management language very well, and I already know how to define and measure my project success.</p>
                        </div>
                        <button id="btn-show-manual">⚡ Start Fast Onboarding</button>
                    </div>

                    <div class="option-row">
                        <div class="option-row-content">
                            <h4>2. Guided Onboarding (Recommended)</h4>
                            <p class="hint">Answer a series of guided questions with easy descriptions to help you build the strategic documents for your project.</p>
                        </div>
                        <button id="btn-show-guided">🧭 Start Guided Walkthrough</button>
                    </div>

                    <div class="option-row">
                        <div class="option-row-content">
                            <h4>Import My Own Documents</h4>
                            <p class="hint">I have a project charter and product requirements document already, and I would like to import them to initialize the project.</p>
                        </div>
                        <button id="btn-action-import">📂 Import my Documents</button>
                    </div>
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

        <div id="guided-view" class="view">
            <div class="card">
                <div style="display: flex; align-items: center; gap: 8px; margin-bottom: 24px;">
                    <span style="font-size: 24px;">🧭</span>
                    <h3 style="margin: 0;">Guided Onboarding (SIP-1)</h3>
                </div>

                <!-- A. Target Users -->
                <h4 style="margin: 24px 0 12px 0; padding-bottom: 8px; border-bottom: 1px solid var(--mcd-border);">A. Target Users</h4>
                <div class="form-group">
                    <label>1. Who uses this?</label>
                    <select id="guidedTargetUsers" multiple style="width: 100%; padding: 8px; background: var(--mcd-bg); border: 1px solid var(--mcd-border); color: var(--mcd-text); border-radius: 6px; height: 120px;">
                        <option value="Individual consumer">Individual consumer</option>
                        <option value="Small team (2–10)">Small team (2–10)</option>
                        <option value="Org team (10–100)">Org team (10–100)</option>
                        <option value="Enterprise">Enterprise</option>
                        <option value="Public/no login">Public/no login</option>
                        <option value="Other">Other</option>
                    </select>
                    <span class="hint">Hold Cmd/Ctrl to select multiple.</span>
                </div>
                <div class="form-group" id="guidedTargetUsersOtherGroup" style="display: none;">
                    <label>Please specify "Other" target users:</label>
                    <input type="text" id="guidedTargetUsersOther" placeholder="e.g. Freelance Accountants">
                </div>
                <div class="form-group">
                    <label>2. What does a successful user look like?</label>
                    <input type="text" id="guidedTargetSuccess" placeholder="e.g. An independent contractor who invoices clients in under 5 minutes.">
                </div>

                <!-- B. Problem Statement -->
                <h4 style="margin: 32px 0 12px 0; padding-bottom: 8px; border-bottom: 1px solid var(--mcd-border);">B. Problem Statement</h4>
                <div class="form-group">
                    <label>3. What happens today without this?</label>
                    <select id="guidedProblemTypes" multiple style="width: 100%; padding: 8px; background: var(--mcd-bg); border: 1px solid var(--mcd-border); color: var(--mcd-text); border-radius: 6px; height: 120px;">
                        <option value="manual work">manual work</option>
                        <option value="spreadsheets">spreadsheets</option>
                        <option value="tool switching">tool switching</option>
                        <option value="copying/pasting">copying/pasting</option>
                        <option value="slow approvals">slow approvals</option>
                        <option value="errors/rework">errors/rework</option>
                        <option value="other">other</option>
                    </select>
                    <span class="hint">Hold Cmd/Ctrl to select multiple.</span>
                </div>
                <div class="form-group">
                    <label>4. What is the most painful step?</label>
                    <input type="text" id="guidedPainfulStep" placeholder="e.g. Re-entering invoice data from PDF into accounting software.">
                </div>

                <!-- C. Core Value Proposition -->
                <h4 style="margin: 32px 0 12px 0; padding-bottom: 8px; border-bottom: 1px solid var(--mcd-border);">C. Core Value Proposition</h4>
                <div style="display: flex; gap: 16px;">
                    <div class="form-group" style="flex: 1;">
                        <label>5. This reduces...</label>
                        <select id="guidedReduces" multiple style="width: 100%; height: 120px; padding: 8px; background: var(--mcd-bg); border: 1px solid var(--mcd-border); color: var(--mcd-text); border-radius: 6px;">
                            <option value="time">time</option>
                            <option value="errors">errors</option>
                            <option value="cost">cost</option>
                            <option value="cognitive load">cognitive load</option>
                            <option value="tool switching">tool switching</option>
                            <option value="other">other</option>
                        </select>
                    </div>
                    <div class="form-group" style="flex: 1;">
                        <label>6. This increases...</label>
                        <select id="guidedIncreases" multiple style="width: 100%; height: 120px; padding: 8px; background: var(--mcd-bg); border: 1px solid var(--mcd-border); color: var(--mcd-text); border-radius: 6px;">
                            <option value="speed">speed</option>
                            <option value="visibility">visibility</option>
                            <option value="accuracy">accuracy</option>
                            <option value="automation">automation</option>
                            <option value="revenue">revenue</option>
                            <option value="other">other</option>
                        </select>
                    </div>
                </div>
                <div class="form-group">
                    <label>7. One-sentence value statement</label>
                    <input type="text" id="guidedCoreValue" placeholder="e.g. A one-click tool that turns profiles into PDFs">
                </div>

                <!-- D. Hard Non-Goals -->
                <h4 style="margin: 32px 0 12px 0; padding-bottom: 8px; border-bottom: 1px solid var(--mcd-border);">D. Hard Non-Goals</h4>
                <div class="form-group">
                    <label>8. Do not include in v1</label>
                    <select id="guidedDoNotInclude" multiple style="width: 100%; padding: 8px; background: var(--mcd-bg); border: 1px solid var(--mcd-border); color: var(--mcd-text); border-radius: 6px; height: 140px;">
                        <option value="payments">payments</option>
                        <option value="auth/login">auth/login</option>
                        <option value="multi-user collaboration">multi-user collaboration</option>
                        <option value="mobile app">mobile app</option>
                        <option value="analytics/telemetry">analytics/telemetry</option>
                        <option value="marketplace/plugins">marketplace/plugins</option>
                        <option value="AI features">AI features</option>
                        <option value="other">other</option>
                    </select>
                </div>
                <div class="form-group">
                    <label>9. What is explicitly NOT a goal?</label>
                    <input type="text" id="guidedExplicitNonGoal" placeholder="e.g. We are not building a marketplace.">
                </div>

                <!-- E. Key Features -->
                <h4 style="margin: 32px 0 12px 0; padding-bottom: 8px; border-bottom: 1px solid var(--mcd-border);">E. Key Features</h4>
                <div class="form-group">
                    <label>10. Current Target Version</label>
                    <input type="text" id="guidedTargetVersion" value="${initialVersion}">
                </div>
                <div class="form-group">
                    <label>11. List up to 5 must-have features</label>
                    <input type="text" id="guidedRawFeatures" placeholder="e.g. PDF generation, Stripe integration, Email notifications">
                    <span class="hint">Comma separated.</span>
                </div>

                <!-- F. Success Metric -->
                <h4 style="margin: 32px 0 12px 0; padding-bottom: 8px; border-bottom: 1px solid var(--mcd-border);">F. Success Metric</h4>
                <div class="form-group">
                    <label>12. What event proves this worked?</label>
                    <select id="guidedMetricType" style="width: 100%; padding: 8px; background: var(--mcd-bg); border: 1px solid var(--mcd-border); color: var(--mcd-text); border-radius: 6px;">
                        <option value="shipped to production">shipped to production</option>
                        <option value="first real user">first real user</option>
                        <option value="first paying user">first paying user</option>
                        <option value="replaces an existing tool">replaces an existing tool</option>
                        <option value="saves time">saves time</option>
                        <option value="other">other</option>
                    </select>
                </div>
                <div class="form-group">
                    <label>13. Define the metric target</label>
                    <input type="text" id="guidedMetricTarget" placeholder="e.g. $100 MRR, 10 signups, 50% faster completion">
                </div>
                <div class="form-group">
                    <label>14. Time horizon</label>
                    <select id="guidedMetricHorizon" style="width: 100%; padding: 8px; background: var(--mcd-bg); border: 1px solid var(--mcd-border); color: var(--mcd-text); border-radius: 6px;">
                        <option value="7 days">7 days</option>
                        <option value="30 days">30 days</option>
                        <option value="90 days">90 days</option>
                        <option value="6 months">6 months</option>
                        <option value="12 months">12 months</option>
                    </select>
                </div>

                <!-- G. Constraints -->
                <h4 style="margin: 32px 0 12px 0; padding-bottom: 8px; border-bottom: 1px solid var(--mcd-border);">G. Constraints</h4>
                <div class="form-group">
                    <label>15. Deployment target</label>
                    <select id="guidedDeploy" style="width: 100%; padding: 8px; background: var(--mcd-bg); border: 1px solid var(--mcd-border); color: var(--mcd-text); border-radius: 6px;">
                        <option value="local-only">local-only</option>
                        <option value="shared hosting">shared hosting</option>
                        <option value="VPS">VPS</option>
                        <option value="cloud">cloud</option>
                        <option value="other">other</option>
                    </select>
                </div>
                <div class="form-group">
                    <label>16. Data storage</label>
                    <select id="guidedDataStore" style="width: 100%; padding: 8px; background: var(--mcd-bg); border: 1px solid var(--mcd-border); color: var(--mcd-text); border-radius: 6px;">
                        <option value="file-based">file-based</option>
                        <option value="SQLite">SQLite</option>
                        <option value="MySQL">MySQL</option>
                        <option value="Postgres">Postgres</option>
                        <option value="other">other</option>
                    </select>
                </div>
                <div class="form-group">
                    <label>17. Security stance</label>
                    <select id="guidedSecurity" multiple style="width: 100%; padding: 8px; background: var(--mcd-bg); border: 1px solid var(--mcd-border); color: var(--mcd-text); border-radius: 6px; height: 100px;">
                        <option value="no telemetry">no telemetry</option>
                        <option value="encrypted secrets">encrypted secrets</option>
                        <option value="audit logs">audit logs</option>
                        <option value="role-based permissions">role-based permissions</option>
                        <option value="other">other</option>
                    </select>
                </div>

                <!-- H. Wrap up -->
                <h4 style="margin: 32px 0 12px 0; padding-bottom: 8px; border-bottom: 1px solid var(--mcd-border);">H. Notes</h4>
                <div class="form-group">
                    <label>18. Open questions (optional)</label>
                    <input type="text" id="guidedOpenQs" placeholder="e.g. Which VPS provider? Stripe vs LemonSqueezy?">
                    <span class="hint">Comma separated.</span>
                </div>
            </div>

            <div class="footer-buttons">
                <button id="btn-back-guided" style="flex: 0 1 auto;">← Back</button>
                <button id="btn-submit-guided" class="primary" style="flex: 0 1 auto; padding-left: 40px; padding-right: 40px;">Generate Strategy Artifacts</button>
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
        const guidedView = document.getElementById('guided-view');
        const handoffView = document.getElementById('agent-handoff-view');
        const manualSuccessView = document.getElementById('manual-success-view');

        const stepDocs = document.getElementById('step-docs');
        const btnDocsDone = document.getElementById('btn-docs-done');
        const handoffComplete = document.getElementById('handoff-complete');
        const btnLaunchCd = document.getElementById('btn-launch-cd');
        const btnLaunchCdManual = document.getElementById('btn-launch-cd-manual');

        const getInputValue = (id) => {
            const element = document.getElementById(id);
            return element ? element.value.trim() : '';
        };

        const getSelectedValues = (id) => {
            const element = document.getElementById(id);
            if (!element) return [];
            return Array.from(element.selectedOptions).map((option) => option.value);
        };

        const markInvalid = (id) => {
            const element = document.getElementById(id);
            if (element) {
                element.style.borderColor = '#fa4549';
            }
        };

        const clearInvalid = (id) => {
            const element = document.getElementById(id);
            if (element) {
                element.style.borderColor = 'var(--mcd-border)';
            }
        };

        if (document.getElementById('guidedTargetUsers')) {
            document.getElementById('guidedTargetUsers').addEventListener('change', (e) => {
                const options = Array.from(e.target.selectedOptions).map((opt) => opt.value);
                const otherGroup = document.getElementById('guidedTargetUsersOtherGroup');
                if (options.includes('Other')) {
                    otherGroup.style.display = 'block';
                } else {
                    otherGroup.style.display = 'none';
                    clearInvalid('guidedTargetUsersOther');
                }
                clearInvalid('guidedTargetUsers');
            });
        }

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
                selectionView.classList.remove('active');
                guidedView.classList.add('active');
            });
        }

        if (document.getElementById('btn-back-manual')) {
            document.getElementById('btn-back-manual').addEventListener('click', () => {
                manualView.classList.remove('active');
                selectionView.classList.add('active');
            });
        }

        if (document.getElementById('btn-back-guided')) {
            document.getElementById('btn-back-guided').addEventListener('click', () => {
                guidedView.classList.remove('active');
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

        if (document.getElementById('btn-submit-guided')) {
            document.getElementById('btn-submit-guided').addEventListener('click', () => {
                const targetUsers = getSelectedValues('guidedTargetUsers');
                const problemTypes = getSelectedValues('guidedProblemTypes');
                const reduces = getSelectedValues('guidedReduces');
                const increases = getSelectedValues('guidedIncreases');
                const doNotInclude = getSelectedValues('guidedDoNotInclude');
                const security = getSelectedValues('guidedSecurity');
                const targetUsersOther = getInputValue('guidedTargetUsersOther');

                const data = {
                    targetUsers,
                    targetUsersOther,
                    targetSuccess: getInputValue('guidedTargetSuccess'),
                    problemTypes,
                    painfulStep: getInputValue('guidedPainfulStep'),
                    reduces,
                    increases,
                    coreValue: getInputValue('guidedCoreValue'),
                    doNotInclude,
                    explicitNonGoal: getInputValue('guidedExplicitNonGoal'),
                    targetVersion: getInputValue('guidedTargetVersion'),
                    rawFeatures: getInputValue('guidedRawFeatures'),
                    metricType: document.getElementById('guidedMetricType').value,
                    metricTarget: getInputValue('guidedMetricTarget'),
                    metricHorizon: document.getElementById('guidedMetricHorizon').value,
                    deploy: document.getElementById('guidedDeploy').value,
                    dataStore: document.getElementById('guidedDataStore').value,
                    security,
                    openQs: getInputValue('guidedOpenQs')
                };

                let invalid = false;
                const requiredMultiSelects = [
                    { id: 'guidedTargetUsers', value: targetUsers },
                    { id: 'guidedProblemTypes', value: problemTypes },
                    { id: 'guidedReduces', value: reduces },
                    { id: 'guidedIncreases', value: increases },
                    { id: 'guidedDoNotInclude', value: doNotInclude },
                    { id: 'guidedSecurity', value: security }
                ];

                requiredMultiSelects.forEach((entry) => {
                    if (!entry.value.length) {
                        markInvalid(entry.id);
                        invalid = true;
                    } else {
                        clearInvalid(entry.id);
                    }
                });

                const requiredInputs = [
                    'guidedTargetSuccess',
                    'guidedPainfulStep',
                    'guidedCoreValue',
                    'guidedExplicitNonGoal',
                    'guidedTargetVersion',
                    'guidedRawFeatures',
                    'guidedMetricTarget'
                ];

                requiredInputs.forEach((id) => {
                    if (!getInputValue(id)) {
                        markInvalid(id);
                        invalid = true;
                    } else {
                        clearInvalid(id);
                    }
                });

                if (targetUsers.includes('Other') && !targetUsersOther) {
                    markInvalid('guidedTargetUsersOther');
                    invalid = true;
                }

                if (invalid) {
                    return;
                }

                const btn = document.getElementById('btn-submit-guided');
                btn.innerText = 'Generating...';
                btn.disabled = true;
                btn.style.opacity = '0.7';
                btn.style.cursor = 'not-allowed';

                vscode.postMessage({
                    command: 'submitGuided',
                    data: data
                });
            });
        }

        document.querySelectorAll('input').forEach(input => {
            input.addEventListener('input', (e) => {
                e.target.style.borderColor = 'var(--mcd-border)';
            });
        });

        document.querySelectorAll('select').forEach(select => {
            select.addEventListener('change', (e) => {
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
                    if (guidedView) guidedView.classList.remove('active');
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
exports.OnboardingPanel = OnboardingPanel;
//# sourceMappingURL=onboardingWebview.js.map