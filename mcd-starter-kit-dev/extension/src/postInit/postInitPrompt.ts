import * as vscode from 'vscode';
import * as path from 'path';
import { launchCommandDeck } from '../scaffolder';
import { ProjectConfig } from '../wizard';

export async function promptPostInitReview(root: vscode.Uri, config: ProjectConfig): Promise<void> {
    const choice = await vscode.window.showInformationMessage(
        'Do you want to review your Charter, PRD, and initial architecture now?',
        { modal: true },
        'Yes', 'No'
    );

    if (choice === 'Yes') {
        const reviewChoice = await vscode.window.showQuickPick(
            ['Review Charter', 'Review PRD', 'Review Architecture'],
            { title: 'Select Artifact to Review', ignoreFocusOut: true }
        );

        let targetPattern = '';
        if (reviewChoice === 'Review Charter') targetPattern = '*PROJECT_CHARTER.md';
        else if (reviewChoice === 'Review PRD') targetPattern = '*HIGH_LEVEL_PRD.md';
        else if (reviewChoice === 'Review Architecture') targetPattern = '*SYSTEM_ARCHITECTURE.md';

        if (targetPattern) {
            const files = await vscode.workspace.findFiles(`referenceDocs/01_Strategy/${targetPattern}`);
            if (files.length > 0) {
                // Open the newest one if multiple exist
                const sortedFiles = files.sort((a, b) => b.fsPath.localeCompare(a.fsPath));
                await vscode.window.showTextDocument(await vscode.workspace.openTextDocument(sortedFiles[0]), {
                    viewColumn: vscode.ViewColumn.Beside,
                    preserveFocus: true,
                    preview: false
                });
            } else {
                vscode.window.showInformationMessage('Artifact not found.');
            }
        }
    } else {
        const nextAction = await vscode.window.showQuickPick(
            ['Define MVP milestone plan', 'Build initial contracts', 'Generate board/cards'],
            { title: 'What do you want to work on first?', ignoreFocusOut: true }
        );

        if (nextAction === 'Generate board/cards') {
            vscode.window.showInformationMessage('Launch the Command Deck to begin board generation.');
        } else {
            vscode.window.showInformationMessage(`Agent context loaded for: ${nextAction}`);
        }
    }

    // After review decision, automatically launch the command deck if not already prompted
    const launchChoice = await vscode.window.showInformationMessage(
        'Launch Command Deck to view your Kanban board?',
        'Launch Command Deck'
    );

    if (launchChoice === 'Launch Command Deck') {
        await launchCommandDeck(root, config);
    }
}
