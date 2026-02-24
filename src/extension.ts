import * as vscode from 'vscode';
import { migrateEnvironment } from './scaffolder';
import { CommandDeckDashboard } from './commandDeckDashboard';

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
        const bytes = await vscode.workspace.fs.readFile(vscode.Uri.joinPath(root, 'ops', 'amphion.json'));
        return JSON.parse(new TextDecoder().decode(bytes)) as AmphionEnvironmentConfig;
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

export function activate(context: vscode.ExtensionContext) {
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

    const dashboardDisposable = vscode.commands.registerCommand('mcd.openDashboard', () => {
        CommandDeckDashboard.createOrShow(context.extensionUri);
    });

    context.subscriptions.push(disposable, dashboardDisposable);

    // Show init prompt for workspaces that don't already have an MCD scaffold
    const folders = vscode.workspace.workspaceFolders;
    if (folders && folders.length > 0) {
        const root = folders[0].uri;
        const refDocsUri = vscode.Uri.joinPath(root, 'referenceDocs');
        vscode.workspace.fs.stat(refDocsUri).then(
            () => {
                // referenceDocs exists — MCD scaffold already present, auto-open dashboard
                vscode.commands.executeCommand('mcd.openDashboard');
                void maybePromptEnvironmentUpdate(context, root);
            },
            () => {
                // referenceDocs does not exist — offer initialization
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
            }
        );
    }
}

export function deactivate() { }
