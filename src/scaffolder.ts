import * as vscode from 'vscode';
import * as path from 'path';
import * as fs from 'fs';
import { ProjectConfig } from './wizard';
import { renderGuardrails } from './templates/guardrails';
import { getPlaybookContent } from './templates/playbook';
import { renderEvaluate, renderContract, renderExecute, renderCloseout } from './templates/commands';
import { renderAntigravityWorkflow, renderClaudeMd, renderAgentsMd, renderCursorRules } from './templates/adapters';
import { runCharterWizard } from './charterWizard';

const DIRS = [
    'referenceDocs/00_Governance/mcd',
    'referenceDocs/01_Strategy',
    'referenceDocs/02_Architecture/primitives',
    'referenceDocs/03_Contracts/active',
    'referenceDocs/03_Contracts/archive',
    'referenceDocs/04_Analysis/findings',
    'referenceDocs/04_Analysis/scripts',
    'referenceDocs/05_Records/buildLogs',
    'referenceDocs/05_Records/chatLogs',
    'referenceDocs/05_Records/documentation/helperContext',
    '.agents/workflows',
    'ops',
];

const CONFLICT_CHECK_DIRS = [
    'referenceDocs',
    'ops/launch-command-deck',
];

async function writeFile(root: vscode.Uri, relativePath: string, content: string): Promise<void> {
    const uri = vscode.Uri.joinPath(root, relativePath);
    const encoder = new TextEncoder();
    await vscode.workspace.fs.writeFile(uri, encoder.encode(content));
}

async function createDir(root: vscode.Uri, relativePath: string): Promise<void> {
    const uri = vscode.Uri.joinPath(root, relativePath);
    await vscode.workspace.fs.createDirectory(uri);
}

function copyDirSync(src: string, dest: string): void {
    if (!fs.existsSync(dest)) {
        fs.mkdirSync(dest, { recursive: true });
    }
    const entries = fs.readdirSync(src, { withFileTypes: true });
    for (const entry of entries) {
        const srcPath = path.join(src, entry.name);
        const destPath = path.join(dest, entry.name);
        if (entry.isDirectory()) {
            copyDirSync(srcPath, destPath);
        } else {
            fs.copyFileSync(srcPath, destPath);
        }
    }
}

async function pathExists(root: vscode.Uri, relativePath: string): Promise<boolean> {
    try {
        await vscode.workspace.fs.stat(vscode.Uri.joinPath(root, relativePath));
        return true;
    } catch {
        return false;
    }
}

export async function buildScaffold(
    root: vscode.Uri,
    config: ProjectConfig,
    extensionUri: vscode.Uri
): Promise<void> {
    // --- Pre-flight: conflict detection ---
    const conflicts: string[] = [];
    for (const dir of CONFLICT_CHECK_DIRS) {
        if (await pathExists(root, dir)) {
            conflicts.push(dir + '/');
        }
    }

    if (conflicts.length > 0) {
        const choice = await vscode.window.showWarningMessage(
            `The following directories already exist: ${conflicts.join(', ')}. Proceeding will merge new files into these directories.`,
            { modal: true },
            'Continue',
            'Abort'
        );
        if (choice !== 'Continue') {
            vscode.window.showInformationMessage('MCD initialization aborted.');
            return;
        }
    }

    // 1. Create all directory structure
    for (const dir of DIRS) {
        await createDir(root, dir);
    }

    // 2. Write GUARDRAILS.md
    await writeFile(
        root,
        'referenceDocs/00_Governance/GUARDRAILS.md',
        renderGuardrails(config)
    );

    // 3. Write MCD_PLAYBOOK.md
    await writeFile(
        root,
        'referenceDocs/00_Governance/MCD_PLAYBOOK.md',
        getPlaybookContent()
    );

    // 4. Write Canonical Commands
    const mcdDir = 'referenceDocs/00_Governance/mcd';
    await writeFile(root, `${mcdDir}/EVALUATE.md`, renderEvaluate(config));
    await writeFile(root, `${mcdDir}/CONTRACT.md`, renderContract(config));
    await writeFile(root, `${mcdDir}/EXECUTE.md`, renderExecute(config));
    await writeFile(root, `${mcdDir}/CLOSEOUT.md`, renderCloseout(config));

    // 5. Write Agent Adapters
    await writeFile(root, 'CLAUDE.md', renderClaudeMd(config));
    await writeFile(root, 'AGENTS.md', renderAgentsMd(config));
    await writeFile(root, '.cursorrules', renderCursorRules(config));

    // 6. Write Antigravity Workflows
    const wfDir = '.agents/workflows';
    await writeFile(root, `${wfDir}/evaluate.md`, renderAntigravityWorkflow('evaluate', config));
    await writeFile(root, `${wfDir}/contract.md`, renderAntigravityWorkflow('contract', config));
    await writeFile(root, `${wfDir}/execute.md`, renderAntigravityWorkflow('execute', config));
    await writeFile(root, `${wfDir}/closeout.md`, renderAntigravityWorkflow('closeout', config));

    // 7. Copy the bundled Command Deck into ops/
    const deckSrc = vscode.Uri.joinPath(extensionUri, 'assets', 'launch-command-deck');
    const deckDest = path.join(root.fsPath, 'ops', 'launch-command-deck');
    copyDirSync(deckSrc.fsPath, deckDest);

    // 5. Initialize the Command Deck board for this project
    const initTerminal = vscode.window.createTerminal({
        name: 'MCD Init',
        cwd: root.fsPath,
    });

    const initScript = path.join(
        root.fsPath,
        'ops',
        'launch-command-deck',
        'scripts',
        'init_command_deck.py'
    );

    initTerminal.sendText(
        `python3 "${initScript}" --project-name "${config.projectName}" --codename "${config.codename}" --initial-version "${config.initialVersion}" --milestone-title "Version 0a Pre-Release" --seed-template scaffold`
    );

    // 6. Git: detect existing repo or initialize
    const gitExists = await pathExists(root, '.git');
    if (gitExists) {
        // Existing git repo — offer a branch
        const branchChoice = await vscode.window.showQuickPick(
            ['Yes — create mcd/init branch', 'No — commit to current branch'],
            { title: 'Git repository detected', ignoreFocusOut: true }
        );
        if (branchChoice?.startsWith('Yes')) {
            initTerminal.sendText('git checkout -b mcd/init');
        }
    } else {
        initTerminal.sendText('git init');
    }

    initTerminal.sendText('git add .');
    initTerminal.sendText(
        `git commit -m "chore(init): ${config.codename} scaffold - establish guardrails + command deck"`
    );

    // 7. Start the Command Deck server (language-aware)
    const serverTerminal = vscode.window.createTerminal({
        name: `Command Deck :${config.port}`,
        cwd: root.fsPath,
    });
    serverTerminal.show();

    if (config.serverLang === 'node') {
        serverTerminal.sendText(
            `node ops/launch-command-deck/server.js --port ${config.port}`
        );
    } else {
        serverTerminal.sendText(
            `python3 ops/launch-command-deck/server.py --port ${config.port}`
        );
    }

    // 8. Open browser after a short delay for the server to start
    setTimeout(async () => {
        const url = vscode.Uri.parse(`http://127.0.0.1:${config.port}`);
        await vscode.env.openExternal(url);
    }, 2500);

    // 9. Open Webview for Charter + PRD wizard (async — does not block server startup)
    setTimeout(async () => {
        await runCharterWizard(extensionUri, root, config, initTerminal);
    }, 3500);
}
