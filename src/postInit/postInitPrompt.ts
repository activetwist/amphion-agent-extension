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

        if (reviewChoice === 'Review Charter') {
            vscode.window.showInformationMessage('Charter is now DB-canonical. Open Command Deck docs to review.');
        } else if (reviewChoice === 'Review PRD') {
            vscode.window.showInformationMessage('PRD is now DB-canonical. Open Command Deck docs to review.');
        } else if (reviewChoice === 'Review Architecture') {
            const architecturePath = vscode.Uri.joinPath(root, '.amphion/control-plane/EXAMPLE_MARKETING_IA.md');
            try {
                await vscode.workspace.fs.stat(architecturePath);
                await vscode.window.showTextDocument(await vscode.workspace.openTextDocument(architecturePath), {
                    viewColumn: vscode.ViewColumn.Beside,
                    preserveFocus: true,
                    preview: false
                });
            } catch {
                vscode.window.showInformationMessage('Architecture example not found in control-plane.');
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
