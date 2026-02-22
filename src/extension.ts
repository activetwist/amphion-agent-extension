import * as vscode from 'vscode';
import { buildScaffold } from './scaffolder';

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

    context.subscriptions.push(disposable);

    // Show init prompt for workspaces that don't already have an MCD scaffold
    const folders = vscode.workspace.workspaceFolders;
    if (folders && folders.length > 0) {
        const root = folders[0].uri;
        const refDocsUri = vscode.Uri.joinPath(root, 'referenceDocs');
        vscode.workspace.fs.stat(refDocsUri).then(
            () => {
                // referenceDocs exists — MCD scaffold already present, don't prompt
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
