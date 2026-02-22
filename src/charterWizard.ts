import * as vscode from 'vscode';
import * as path from 'path';
import * as fs from 'fs';
import { ProjectConfig } from './wizard';
import { renderCharter, CharterData } from './templates/charter';
import { renderPrd, PrdData } from './templates/prd';
import { renderCharterStub } from './templates/charterStub';
import { renderPrdStub } from './templates/prdStub';
import { launchCommandDeck } from './scaffolder';

function nowTimestamp(): string {
    const d = new Date();
    const pad = (n: number) => String(n).padStart(2, '0');
    return `${d.getFullYear()}${pad(d.getMonth() + 1)}${pad(d.getDate())}${pad(d.getHours())}${pad(d.getMinutes())}`;
}

export async function runManualPath(
    root: vscode.Uri,
    config: ProjectConfig,
    terminal: vscode.Terminal,
    data: {
        targetUsers: string;
        problemStatement: string;
        coreValue: string;
        nonGoals: string;
        keyFeatures: string;
        successMetric: string;
    }
): Promise<void> {
    // ── Write documents ──────────────────────────────────────────────────────
    const timestamp = nowTimestamp();
    const encoder = new TextEncoder();

    const charterData: CharterData = {
        targetUsers: data.targetUsers,
        problemStatement: data.problemStatement,
        coreValue: data.coreValue,
        nonGoals: data.nonGoals
    };
    const prdData: PrdData = {
        keyFeatures: data.keyFeatures,
        successMetric: data.successMetric
    };

    await vscode.workspace.fs.writeFile(
        vscode.Uri.joinPath(root, `referenceDocs/01_Strategy/${timestamp}-PROJECT_CHARTER.md`),
        encoder.encode(renderCharter(config, charterData, timestamp))
    );

    await vscode.workspace.fs.writeFile(
        vscode.Uri.joinPath(root, `referenceDocs/01_Strategy/${timestamp}-HIGH_LEVEL_PRD.md`),
        encoder.encode(renderPrd(config, charterData, prdData, timestamp))
    );

    // ── Stage and commit ─────────────────────────────────────────────────────
    terminal.sendText('git add referenceDocs/01_Strategy/');
    terminal.sendText(
        `git commit -m "docs(${config.initialVersion}): add Project Charter and High-Level PRD for ${config.codename}"`
    );

    vscode.window.showInformationMessage(
        `✅ Project Charter and PRD created in referenceDocs/01_Strategy/ and committed.`
    );

    const action = await vscode.window.showInformationMessage(
        'MCD has initialized your project! The Command Deck kanban board will now launch in your browser. Return to VS Code when you are ready to manage your work.',
        { modal: true },
        'Launch Command Deck'
    );

    if (action === 'Launch Command Deck') {
        await launchCommandDeck(root, config);
    }
}

export async function runSourceDocsPath(
    root: vscode.Uri,
    config: ProjectConfig,
    terminal: vscode.Terminal
): Promise<void> {
    // ── Step 1: File picker ──────────────────────────────────────────────────
    const selected = await vscode.window.showOpenDialog({
        canSelectMany: true,
        canSelectFiles: true,
        canSelectFolders: false,
        openLabel: 'Import as source documents',
        filters: {
            'Documents': ['md', 'txt', 'pdf', 'docx'],
            'All Files': ['*'],
        },
    });

    // Graceful fallback: if operator cancels without selecting, return to webview ideally
    // For now, if cancelled, just abort gracefully.
    if (!selected || selected.length === 0) {
        vscode.window.showInformationMessage('Import cancelled.');
        return;
    }

    // ── Step 2: Copy files to helperContext/ ─────────────────────────────────
    const helperContextDir = path.join(
        root.fsPath,
        'referenceDocs',
        '05_Records',
        'documentation',
        'helperContext'
    );

    if (!fs.existsSync(helperContextDir)) {
        fs.mkdirSync(helperContextDir, { recursive: true });
    }

    const copiedFileNames: string[] = [];
    for (const fileUri of selected) {
        const filename = path.basename(fileUri.fsPath);
        const destPath = path.join(helperContextDir, filename);
        fs.copyFileSync(fileUri.fsPath, destPath);
        copiedFileNames.push(filename);
    }

    // ── Step 3: Write stub Charter ───────────────────────────────────────────
    const timestamp = nowTimestamp();
    const encoder = new TextEncoder();

    await vscode.workspace.fs.writeFile(
        vscode.Uri.joinPath(root, `referenceDocs/01_Strategy/${timestamp}-PROJECT_CHARTER.md`),
        encoder.encode(renderCharterStub(config, copiedFileNames, timestamp))
    );

    // ── Step 4: Write stub PRD ───────────────────────────────────────────────
    await vscode.workspace.fs.writeFile(
        vscode.Uri.joinPath(root, `referenceDocs/01_Strategy/${timestamp}-HIGH_LEVEL_PRD.md`),
        encoder.encode(renderPrdStub(config, copiedFileNames, timestamp))
    );

    // ── Step 5: Stage and commit ─────────────────────────────────────────────
    terminal.sendText('git add referenceDocs/');
    terminal.sendText(
        `git commit -m "docs(${config.initialVersion}): add source documents + Charter/PRD stubs for AI derivation"`
    );

    // ── Step 6: Product Owner Agent Handoff ──────────────────────────────────
    const charterPath = vscode.Uri.joinPath(root, `referenceDocs/01_Strategy/${timestamp}-PROJECT_CHARTER.md`);

    // Guide user to Charter unconditionally — the embedded agent block handles the rest
    await vscode.window.showTextDocument(await vscode.workspace.openTextDocument(charterPath));

    const action = await vscode.window.showInformationMessage(
        'MCD has initialized your project! The Command Deck kanban board will now launch in your browser. Complete your Strategy Docs with your AI Agent, and return to VS Code when you are ready to manage your work.',
        { modal: true },
        'Launch Command Deck'
    );

    if (action === 'Launch Command Deck') {
        await launchCommandDeck(root, config);
    }
}
