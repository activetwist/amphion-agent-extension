import * as vscode from 'vscode';
import { ProjectConfig } from './wizard';
import { renderCharter, CharterData } from './templates/charter';
import { renderPrd, PrdData } from './templates/prd';
import { renderCharterStub, getCharterAgentInstruction } from './templates/charterStub';
import { renderPrdStub, getPrdAgentInstruction } from './templates/prdStub';
import { launchCommandDeck } from './scaffolder';
import { writeBoardArtifact } from './canonicalDocs';

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
    // ── Write canonical DB artifacts ────────────────────────────────────────
    const timestamp = nowTimestamp();

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

    const charterBody = renderCharter(config, charterData, timestamp);
    const prdBody = renderPrd(config, charterData, prdData, timestamp);
    await writeBoardArtifact(
        root,
        'charter',
        `Project Charter · ${config.projectName}`,
        'Generated from manual onboarding inputs.',
        charterBody,
    );
    await writeBoardArtifact(
        root,
        'prd',
        `High-Level PRD · ${config.projectName}`,
        'Generated from manual onboarding inputs.',
        prdBody,
    );
    vscode.window.showInformationMessage('✅ Project Charter and PRD were saved to canonical DB artifacts.');
}

export async function runSourceDocsPath(
    root: vscode.Uri,
    config: ProjectConfig,
    terminal: vscode.Terminal
): Promise<{ charterPrompt: string, prdPrompt: string } | undefined> {
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

    // ── Step 2: Build context references without workspace duplication ──────
    const copiedFileNames: string[] = [];
    for (const fileUri of selected) {
        const filename = fileUri.path.split('/').pop() || fileUri.fsPath;
        copiedFileNames.push(filename);
    }

    // ── Step 3: Write stub Charter/PRD as DB artifacts ──────────────────────
    const timestamp = nowTimestamp();
    await writeBoardArtifact(
        root,
        'charter',
        `Project Charter · ${config.projectName}`,
        'Stub charter generated from imported source-document references.',
        renderCharterStub(config, copiedFileNames, timestamp),
    );
    await writeBoardArtifact(
        root,
        'prd',
        `High-Level PRD · ${config.projectName}`,
        'Stub PRD generated from imported source-document references.',
        renderPrdStub(config, copiedFileNames, timestamp),
    );
    vscode.window.showInformationMessage('✅ Stub Charter/PRD saved to canonical DB artifacts (no helperContext duplication).');

    return {
        charterPrompt: getCharterAgentInstruction(copiedFileNames),
        prdPrompt: getPrdAgentInstruction(copiedFileNames)
    };
}
