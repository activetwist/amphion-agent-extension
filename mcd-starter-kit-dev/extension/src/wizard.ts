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
        title: 'MCD Starter Kit (1/5)',
        prompt: 'Enter the Project Name',
        placeHolder: 'e.g. Cymata',
        ignoreFocusOut: true,
        validateInput: (value) => {
            return value && value.trim().length > 0 ? null : 'Project name is required.';
        },
    });
    if (!projectName) return undefined;

    // Step 2: Server Language
    const serverPick = await vscode.window.showQuickPick(
        [
            { label: 'Python', description: 'Default — zero setup', detail: 'python' },
            { label: 'Node.js', description: 'JavaScript runtime', detail: 'node' },
        ],
        {
            title: 'MCD Starter Kit (2/5)',
            placeHolder: 'Select Command Deck server language',
            ignoreFocusOut: true,
        }
    );
    if (!serverPick) return undefined;
    const serverLang = (serverPick.detail as 'python' | 'node') || 'python';

    // Step 3: Codename
    const codename = await vscode.window.showInputBox({
        title: 'MCD Starter Kit (3/5)',
        prompt: 'Enter the Project Codename',
        placeHolder: 'e.g. Genesis',
        ignoreFocusOut: true,
        validateInput: (value) => {
            return value && value.trim().length > 0 ? null : 'Codename is required.';
        },
    });
    if (!codename) return undefined;

    // Step 4: Initial Version
    const initialVersion = await vscode.window.showInputBox({
        title: 'MCD Starter Kit (4/5)',
        prompt: 'Enter the Initial Version',
        value: 'v0.01a',
        ignoreFocusOut: true,
        validateInput: (value) => {
            return value && value.trim().length > 0 ? null : 'Version is required.';
        },
    });
    if (!initialVersion) return undefined;

    // Step 5: Port
    const port = await vscode.window.showInputBox({
        title: 'MCD Starter Kit (5/5)',
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
        serverLang,
        codename: codename.trim(),
        initialVersion: initialVersion.trim(),
        port: port.trim(),
    };
}
