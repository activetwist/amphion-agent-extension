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

async function prompt(
    title: string,
    step: string,
    promptText: string,
    placeholder: string
): Promise<string | undefined> {
    return vscode.window.showInputBox({
        title: `MCD Charter & PRD (${step})`,
        prompt: promptText,
        placeHolder: placeholder,
        ignoreFocusOut: true,
        validateInput: (v) => (v && v.trim().length > 0 ? null : `${title} is required.`),
    });
}

async function runManualPath(
    root: vscode.Uri,
    config: ProjectConfig,
    terminal: vscode.Terminal
): Promise<void> {
    // ── Charter fields ──────────────────────────────────────────────────────
    const targetUsers = await prompt('Target Users', '1/6',
        'Who are the target users of this project?',
        'e.g. Solo developers building with AI coding agents'
    );
    if (!targetUsers) { return; }

    const problemStatement = await prompt('Problem Statement', '2/6',
        'What problem does this project solve?',
        'e.g. AI agents lack deterministic guardrails, causing scope creep and hallucination'
    );
    if (!problemStatement) { return; }

    const coreValue = await prompt('Core Value Proposition', '3/6',
        'What is the primary value this project delivers?',
        'e.g. A contract-governed workflow that enforces deterministic engineering'
    );
    if (!coreValue) { return; }

    const nonGoals = await prompt('Hard Non-Goals', '4/6',
        'What is explicitly out of scope? (Use bullet points or sentences)',
        'e.g. No multi-user support; No cloud hosting'
    );
    if (!nonGoals) { return; }

    // ── PRD fields ───────────────────────────────────────────────────────────
    const keyFeatures = await prompt('Key Features', '5/6',
        'List the key features for this version, separated by commas',
        'e.g. Scaffold generator, Kanban board, Contract management, Git traceability'
    );
    if (!keyFeatures) { return; }

    const successMetric = await prompt('Success Metric', '6/6',
        'How will you measure success for this version?',
        'e.g. A new project can be initialized and tracked end-to-end in under 5 minutes'
    );
    if (!successMetric) { return; }

    // ── Write documents ──────────────────────────────────────────────────────
    const timestamp = nowTimestamp();
    const encoder = new TextEncoder();

    const charterData: CharterData = { targetUsers, problemStatement, coreValue, nonGoals };
    const prdData: PrdData = { keyFeatures, successMetric };

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

async function runSourceDocsPath(
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

    // Graceful fallback: if operator cancels without selecting, run manual path
    if (!selected || selected.length === 0) {
        vscode.window.showInformationMessage(
            'No files selected — switching to manual entry.'
        );
        return runManualPath(root, config, terminal);
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

    // ── Step 6: Closing notification ─────────────────────────────────────────
    vscode.window.showInformationMessage(
        `✅ ${copiedFileNames.length} source document(s) added to helperContext/. ` +
        `Charter and PRD stubs are ready for AI completion in referenceDocs/01_Strategy/.`
    );
}

export async function runCharterWizard(
    root: vscode.Uri,
    config: ProjectConfig,
    terminal: vscode.Terminal
): Promise<void> {
    // Offer the wizard — operator can skip entirely
    const offer = await vscode.window.showInformationMessage(
        `Scaffold complete! Generate your Project Charter and PRD for "${config.projectName}" now?`,
        { modal: false },
        'Yes, let\'s go',
        'Skip for now'
    );

    if (offer !== 'Yes, let\'s go') {
        return;
    }

    // ── Branch question ───────────────────────────────────────────────────────
    const sourcePick = await vscode.window.showQuickPick(
        [
            {
                label: '$(file-text) Start from scratch',
                description: 'Answer 6 questions to build the Charter and PRD',
                detail: 'manual',
            },
            {
                label: '$(folder-opened) Import source documents',
                description: 'I have existing research, notes, or analysis to reference',
                detail: 'source',
            },
        ],
        {
            title: 'MCD Charter & PRD — How would you like to proceed?',
            placeHolder: 'Select an approach',
            ignoreFocusOut: true,
        }
    );

    if (!sourcePick) {
        return; // Cancelled
    }

    if (sourcePick.detail === 'source') {
        await runSourceDocsPath(root, config, terminal);
    } else {
        await runManualPath(root, config, terminal);
    }
}
