import * as vscode from 'vscode';
import * as path from 'path';
import * as fs from 'fs';
import { FoundationState } from './foundationSchema';

export async function writeFoundationJson(
    root: vscode.Uri,
    state: FoundationState
): Promise<boolean> {
    const strategyDir = path.join(root.fsPath, '.amphion', 'control-plane');
    const foundationPath = path.join(strategyDir, 'foundation.json');

    // Ensure directory exists
    if (!fs.existsSync(strategyDir)) {
        fs.mkdirSync(strategyDir, { recursive: true });
    }

    let finalPath = foundationPath;

    // Handle Collision
    if (fs.existsSync(foundationPath)) {
        const choice = await vscode.window.showWarningMessage(
            'A foundation.json file already exists in .amphion/control-plane. Do you want to overwrite it, or create a timestamped backup of the new state?',
            { modal: true },
            'Overwrite (Destructive)',
            'Create Timestamped File',
            'Abort'
        );

        if (choice === 'Abort' || !choice) {
            return false;
        }

        if (choice === 'Create Timestamped File') {
            const timestamp = new Date().toISOString().replace(/[:.]/g, '-');
            finalPath = path.join(strategyDir, `foundation-${timestamp}.json`);
        }
    }

    const jsonString = JSON.stringify(state, null, 2);
    const encoder = new TextEncoder();

    await vscode.workspace.fs.writeFile(
        vscode.Uri.file(finalPath),
        encoder.encode(jsonString)
    );

    return true;
}
