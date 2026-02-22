import * as vscode from 'vscode';
import * as path from 'path';
import * as fs from 'fs';
import { ProjectConfig } from './wizard';
import { renderCharter, CharterData } from './templates/charter';
import { renderPrd, PrdData } from './templates/prd';
import { renderCharterStub } from './templates/charterStub';
import { renderPrdStub } from './templates/prdStub';

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

    // ── Step 6: Guided Sequential Flow ───────────────────────────────────────
    const charterPath = vscode.Uri.joinPath(root, `referenceDocs/01_Strategy/${timestamp}-PROJECT_CHARTER.md`);
    const prdPath = vscode.Uri.joinPath(root, `referenceDocs/01_Strategy/${timestamp}-HIGH_LEVEL_PRD.md`);

    const fileListMarkdown = copiedFileNames.map(f => `- ${f}`).join('\n');

    // 1. Guide user to Charter
    await vscode.window.showTextDocument(await vscode.workspace.openTextDocument(charterPath));

    const charterPrompt = `Read each of the following files in referenceDocs/05_Records/documentation/helperContext/:\n${fileListMarkdown}\n\nDerive the content for every section marked *[Derive from source documents]* in the Project Charter. Populate each section directly from the source material. Do not add sections not already present in this document. Do not modify the Operating Constraints section.`;

    let charterCopied = false;
    while (!charterCopied) {
        await vscode.env.clipboard.writeText(charterPrompt);
        const action = await vscode.window.showInformationMessage(
            'Step 1: Project Charter Prompt copied to clipboard! Paste it into your AI agent to derive the Charter. Click "Next" when derivation is complete.',
            { modal: true },
            'Copy Again',
            'Next'
        );
        if (action === 'Next') {
            charterCopied = true;
        } else if (action === undefined) {
            return; // User cancelled the flow
        }
    }

    // 2. Guide user to PRD
    await vscode.window.showTextDocument(await vscode.workspace.openTextDocument(prdPath));

    const prdPrompt = `Read each of the following files in referenceDocs/05_Records/documentation/helperContext/:\n${fileListMarkdown}\n\nDerive the content for every section marked *[Derive from source documents]* in the High-Level PRD. Populate the Background, Feature Set, and Success Metric sections directly from the source material. Do not add sections not already present in this document. Once the derivation is complete, review both this PRD and the Project Charter to remove any introductory instructions, stub markers, or placeholder text (like this prompt), ensuring the finalized documents are clean and professional.`;

    let prdCopied = false;
    while (!prdCopied) {
        await vscode.env.clipboard.writeText(prdPrompt);
        const action = await vscode.window.showInformationMessage(
            'Step 2: High-Level PRD Prompt copied to clipboard! Paste it into your AI agent. The agent will finalize both files.',
            { modal: true },
            'Copy Again',
            'Done'
        );
        if (action === 'Done') {
            prdCopied = true;
        } else if (action === undefined) {
            return; // User cancelled the flow
        }
    }

    vscode.window.showInformationMessage('✅ BYO Docs derivation flow complete. You can now close the stubs and review the generated documents.');
}

import { OnboardingPanel } from './onboardingWebview';

export async function runCharterWizard(
    extensionUri: vscode.Uri,
    root: vscode.Uri,
    config: ProjectConfig,
    terminal: vscode.Terminal
): Promise<void> {
    // Launch Webview natively!
    OnboardingPanel.createOrShow(extensionUri, root, config, terminal);
}
