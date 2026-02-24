import * as vscode from 'vscode';

export interface ProjectConfig {
    projectName: string;
    serverLang: 'python' | 'node';
    codename: string;
    initialVersion: string;
    port: string;
}

export async function runWizard(): Promise<ProjectConfig | undefined> {
    // Step 1: Project Name
    const projectName = await vscode.window.showInputBox({
        title: 'AmphionAgent (1/5)',
        prompt: 'Enter the Project Name',
        placeHolder: 'e.g. Acme Platform',
        ignoreFocusOut: true,
        validateInput: (value) => {
            return value && value.trim().length > 0 ? null : 'Project name is required.';
        },
    });
    if (!projectName) return undefined;

    // Step 2: Codename
    const codename = await vscode.window.showInputBox({
        title: 'AmphionAgent (2/4)',
        prompt: 'Enter the Project Codename',
        placeHolder: 'e.g. Genesis',
        ignoreFocusOut: true,
        validateInput: (value) => {
            return value && value.trim().length > 0 ? null : 'Codename is required.';
        },
    });
    if (!codename) return undefined;

    // Step 3: Initial Version
    const initialVersion = await vscode.window.showInputBox({
        title: 'AmphionAgent (3/4)',
        prompt: 'Enter the Initial Version',
        value: 'v0.01a',
        ignoreFocusOut: true,
        validateInput: (value) => {
            return value && value.trim().length > 0 ? null : 'Version is required.';
        },
    });
    if (!initialVersion) return undefined;

    // Step 4: Port
    const port = await vscode.window.showInputBox({
        title: 'AmphionAgent (4/4)',
        prompt: 'Enter the Command Deck Port (must not be in use)',
        value: '8765',
        ignoreFocusOut: true,
        validateInput: (value) => {
            const num = parseInt(value, 10);
            if (isNaN(num) || num < 1024 || num > 65535) {
                return 'Please enter a valid port number between 1024 and 65535.';
            }
            return null;
        },
    });
    if (!port) return undefined;

    return {
        projectName: projectName.trim(),
        serverLang: 'python',
        codename: codename.trim(),
        initialVersion: initialVersion.trim(),
        port: port.trim(),
    };
}
