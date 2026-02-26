import * as vscode from 'vscode';
import { migrateEnvironment } from './scaffolder';
import { AgentControlsSidebarProvider } from './agentControlsSidebar';
import { ServerController } from './serverController';
import {
    detectAdapterGaps,
    detectIdeTargets,
    ensureAdaptersForTargets,
    readEnvironmentState,
    readRuntimeConfig,
    toProjectConfig,
    writeEnvironmentState,
} from './environment';

interface AmphionEnvironmentConfig {
    mcdVersion?: string;
}

const UPDATE_DEFER_HOURS = 24;

function parseVersion(version: string): number[] {
    return version
        .split('.')
        .map((segment) => {
            const parsed = parseInt(segment.replace(/[^\d]/g, ''), 10);
            return Number.isNaN(parsed) ? 0 : parsed;
        });
}

function compareVersions(a: string, b: string): number {
    const left = parseVersion(a);
    const right = parseVersion(b);
    const max = Math.max(left.length, right.length);

    for (let i = 0; i < max; i += 1) {
        const lv = left[i] ?? 0;
        const rv = right[i] ?? 0;
        if (lv > rv) return 1;
        if (lv < rv) return -1;
    }
    return 0;
}

async function readEnvironmentConfig(root: vscode.Uri): Promise<AmphionEnvironmentConfig | undefined> {
    try {
        const runtime = await readRuntimeConfig(root);
        return { mcdVersion: runtime.mcdVersion };
    } catch {
        return undefined;
    }
}

function getDeferKey(root: vscode.Uri): string {
    return `amphion.environmentUpdate.deferUntil:${root.fsPath}`;
}

async function maybePromptEnvironmentUpdate(context: vscode.ExtensionContext, root: vscode.Uri): Promise<void> {
    const extensionVersion = String(context.extension.packageJSON.version ?? '0.0.0');
    const deferKey = getDeferKey(root);
    const deferUntil = context.workspaceState.get<number>(deferKey, 0);

    if (Date.now() < deferUntil) {
        return;
    }

    const envConfig = await readEnvironmentConfig(root);
    const installedVersion = envConfig?.mcdVersion ?? '0.0.0';
    if (compareVersions(installedVersion, extensionVersion) >= 0) {
        return;
    }

    const action = await vscode.window.showInformationMessage(
        `AmphionAgent environment update available (${installedVersion} -> ${extensionVersion}). Update generator-owned governance and adapter files now?`,
        'Update Environment',
        'Later'
    );

    if (action === 'Later') {
        await context.workspaceState.update(deferKey, Date.now() + UPDATE_DEFER_HOURS * 60 * 60 * 1000);
        return;
    }

    if (action === 'Update Environment') {
        const updated = await migrateEnvironment(root, context.extensionUri, extensionVersion);
        if (updated) {
            await context.workspaceState.update(deferKey, 0);
            vscode.window.showInformationMessage(`AmphionAgent environment updated to ${extensionVersion}.`);
        } else {
            vscode.window.showInformationMessage('Environment update was canceled.');
        }
    }
}

async function maybePromptIdeAdapters(root: vscode.Uri): Promise<void> {
    const runtime = await readRuntimeConfig(root);
    const project = toProjectConfig(runtime);
    const environmentState = await readEnvironmentState(root);
    const detected = await detectIdeTargets(root);
    const gaps = await detectAdapterGaps(root, detected);
    const reminderWindowMs = UPDATE_DEFER_HOURS * 60 * 60 * 1000;
    const promptTargets = gaps.filter((target) => {
        const prior = environmentState.adapterDecisions[target];
        if (!prior) {
            return true;
        }
        if (prior.policy === 'never') {
            return false;
        }
        if (prior.policy === 'remind-later') {
            const updatedAtMs = Date.parse(prior.updatedAt);
            if (Number.isFinite(updatedAtMs) && Date.now() - updatedAtMs < reminderWindowMs) {
                return false;
            }
        }
        return true;
    });

    environmentState.detectedIdeTargets = detected;
    if (promptTargets.length === 0) {
        await writeEnvironmentState(root, environmentState);
        return;
    }

    const list = promptTargets.map((target) => target.toUpperCase()).join(', ');
    const action = await vscode.window.showInformationMessage(
        `Detected IDE adapter gap (${list}). Generate required rules/workflows now?`,
        'Generate now',
        'Remind later',
        'Never for this IDE'
    );

    if (action === 'Generate now') {
        await ensureAdaptersForTargets(root, project, promptTargets);
        const ts = new Date().toISOString();
        for (const target of promptTargets) {
            environmentState.adapterDecisions[target] = {
                policy: 'accepted',
                updatedAt: ts,
            };
        }
        environmentState.lastPromptAt = ts;
        await writeEnvironmentState(root, environmentState);
        vscode.window.showInformationMessage(`Generated adapters for ${list}.`);
        return;
    }

    const policy = action === 'Never for this IDE' ? 'never' : 'remind-later';
    const ts = new Date().toISOString();
    for (const target of promptTargets) {
        environmentState.adapterDecisions[target] = {
            policy,
            updatedAt: ts,
        };
    }
    environmentState.lastPromptAt = ts;
    await writeEnvironmentState(root, environmentState);
}

export function activate(context: vscode.ExtensionContext) {
    const serverController = new ServerController(context);
    const sidebarProvider = new AgentControlsSidebarProvider(context.extensionUri, serverController);
    const sidebarProviderDisposable = vscode.window.registerWebviewViewProvider(
        AgentControlsSidebarProvider.viewType,
        sidebarProvider,
        {
            webviewOptions: { retainContextWhenHidden: true },
        }
    );

    const disposable = vscode.commands.registerCommand('mcd.init', async () => {
        // Determine target workspace folder
        const workspaceFolders = vscode.workspace.workspaceFolders;
        if (!workspaceFolders || workspaceFolders.length === 0) {
            vscode.window.showErrorMessage(
                'AmphionAgent: Please open a folder in VS Code before initializing a project.'
            );
            return;
        }

        const root = workspaceFolders[0].uri;

        // Trigger the unified Webview flow
        const { OnboardingPanel } = await import('./onboardingWebview');
        OnboardingPanel.createOrShow(context.extensionUri, root);
    });

    const dashboardDisposable = vscode.commands.registerCommand('mcd.openDashboard', async () => {
        await sidebarProvider.reveal();
    });

    const startServerDisposable = vscode.commands.registerCommand('mcd.startServer', async (rootArg?: vscode.Uri) => {
        const root = rootArg ?? (vscode.workspace.workspaceFolders && vscode.workspace.workspaceFolders[0]?.uri);
        return serverController.start(root);
    });

    const stopServerDisposable = vscode.commands.registerCommand('mcd.stopServer', async (rootArg?: vscode.Uri) => {
        const root = rootArg ?? (vscode.workspace.workspaceFolders && vscode.workspace.workspaceFolders[0]?.uri);
        return serverController.stop(root);
    });

    const generateAdaptersDisposable = vscode.commands.registerCommand('mcd.generateAdaptersForDetectedIde', async () => {
        const folders = vscode.workspace.workspaceFolders;
        if (!folders || folders.length === 0) {
            vscode.window.showErrorMessage('AmphionAgent: No workspace folder open.');
            return;
        }
        const root = folders[0].uri;
        const runtime = await readRuntimeConfig(root);
        const project = toProjectConfig(runtime);
        const targets = await detectIdeTargets(root);
        await ensureAdaptersForTargets(root, project, targets);
        vscode.window.showInformationMessage(`Generated adapters for: ${targets.join(', ')}.`);
    });

    context.subscriptions.push(
        disposable,
        dashboardDisposable,
        startServerDisposable,
        stopServerDisposable,
        generateAdaptersDisposable,
        sidebarProviderDisposable
    );

    // Show init prompt for workspaces that don't already have an MCD scaffold
    const folders = vscode.workspace.workspaceFolders;
    if (folders && folders.length > 0) {
        const root = folders[0].uri;
        const controlPlaneUri = vscode.Uri.joinPath(root, '.amphion');
        const refDocsUri = vscode.Uri.joinPath(root, 'referenceDocs');
        Promise.allSettled([
            vscode.workspace.fs.stat(controlPlaneUri),
            vscode.workspace.fs.stat(refDocsUri),
        ]).then((results) => {
            const hasControlPlane = results[0].status === 'fulfilled';
            const hasLegacyScaffold = results[1].status === 'fulfilled';
            if (hasControlPlane || hasLegacyScaffold) {
                void vscode.commands.executeCommand('mcd.openDashboard');
                void maybePromptEnvironmentUpdate(context, root);
                void maybePromptIdeAdapters(root);
                return;
            }

            vscode.window
                .showInformationMessage(
                    'Initialize an AmphionAgent project in this workspace?',
                    'Initialize'
                )
                .then((selection) => {
                    if (selection === 'Initialize') {
                        vscode.commands.executeCommand('mcd.init');
                    }
                });
        });
    }
}

export function deactivate() { }
