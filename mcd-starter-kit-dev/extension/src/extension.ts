import * as vscode from 'vscode';
import { runWizard } from './wizard';
import { buildScaffold } from './scaffolder';

export function activate(context: vscode.ExtensionContext) {
    const disposable = vscode.commands.registerCommand('mcd.init', async () => {
        // Determine target workspace folder
        const workspaceFolders = vscode.workspace.workspaceFolders;
        if (!workspaceFolders || workspaceFolders.length === 0) {
            vscode.window.showErrorMessage(
                'MCD Starter Kit: Please open a folder in VS Code before initializing a project.'
            );
            return;
        }

        const root = workspaceFolders[0].uri;

        // Step 1: Run the onboarding wizard to collect project config
        const config = await runWizard();
        if (!config) {
            // User cancelled at some point
            return;
        }

        // Step 2: Build the scaffold
        await vscode.window.withProgress(
            {
                location: vscode.ProgressLocation.Notification,
                title: `MCD: Initializing ${config.projectName}...`,
                cancellable: false,
            },
            async (progress) => {
                progress.report({ message: 'Writing scaffold directories...' });
                await buildScaffold(root, config, context.extensionUri);
                progress.report({ increment: 100, message: 'Done!' });
            }
        );

        vscode.window.showInformationMessage(
            `✅ MCD project "${config.projectName}" initialized! The Command Deck is starting on port ${config.port}.`
        );
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
                        'Initialize an MCD project in this workspace?',
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
