import * as vscode from 'vscode';
import * as path from 'path';
import * as fs from 'fs';
import * as os from 'os';
import { exec } from 'child_process';
import { ProjectConfig } from './wizard';
import { renderGuardrails } from './templates/guardrails';
import { getPlaybookContent } from './templates/playbook';
import { renderEvaluate, renderBoard, renderContract, renderExecute, renderCloseout, renderRemember } from './templates/commands';
import { generateMermaidExampleTemplate } from './templates/mermaidExample';
import {
    detectIdeTargets,
    ensureAdaptersForTargets,
    ensureAmphionCore,
    readRuntimeConfig,
    resolveCommandDeckPath,
    toProjectConfig,
    writeRuntimeConfig,
} from './environment';
import { flushPendingBoardArtifacts } from './canonicalDocs';
// Adapters and workflows are loaded dynamically in buildScaffold/deployWorkflows

const DIRS = [
    '.amphion',
    '.amphion/control-plane/mcd',
    '.amphion/context',
];

const CONFLICT_CHECK_DIRS = [
    '.amphion/command-deck',
    'ops/launch-command-deck', // legacy fallback/migration path
];

interface AmphionConfigFile {
    port?: string | number;
    serverLang?: 'python' | string;
    codename?: string;
    projectName?: string;
    initialVersion?: string;
    mcdVersion?: string;
    commandDeckPath?: string;
}

async function writeFile(root: vscode.Uri, relativePath: string, content: string): Promise<void> {
    const uri = vscode.Uri.joinPath(root, relativePath);
    const encoder = new TextEncoder();
    await vscode.workspace.fs.writeFile(uri, encoder.encode(content));
}

async function appendOrWriteFile(root: vscode.Uri, relativePath: string, content: string): Promise<void> {
    const uri = vscode.Uri.joinPath(root, relativePath);
    let existingContent = '';
    const encoder = new TextEncoder();

    try {
        const fileData = await vscode.workspace.fs.readFile(uri);
        existingContent = new TextDecoder().decode(fileData);
    } catch (e) {
        // File does not exist, existingContent remains empty
    }

    if (existingContent) {
        if (!existingContent.includes('--- MCD Governance Core Rules ---')) {
            const separator = '\n\n# --- MCD Governance Core Rules ---\n\n';
            await vscode.workspace.fs.writeFile(uri, encoder.encode(existingContent + separator + content));
        }
    } else {
        await vscode.workspace.fs.writeFile(uri, encoder.encode(content));
    }
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

/**
 * Recursively copies a directory but skips specific files if they already exist in the destination.
 * This is used during migration to avoid overwriting user data (like amphion.db).
 */
function copyDirSafeSync(src: string, dest: string, skipIfExist: string[] = []): void {
    if (!fs.existsSync(dest)) {
        fs.mkdirSync(dest, { recursive: true });
    }
    const entries = fs.readdirSync(src, { withFileTypes: true });
    for (const entry of entries) {
        const srcPath = path.join(src, entry.name);
        const destPath = path.join(dest, entry.name);

        if (entry.isDirectory()) {
            copyDirSafeSync(srcPath, destPath, skipIfExist);
        } else {
            if (entry.name === 'state.json') {
                continue;
            }
            // Check if this file should be skipped if it already exists
            const isSkippable = skipIfExist.some(skipPath => destPath.endsWith(skipPath));
            if (isSkippable && fs.existsSync(destPath)) {
                continue;
            }
            fs.copyFileSync(srcPath, destPath);
        }
    }
}

function collectChangedFilesForBackup(src: string, dest: string, skipIfExist: string[] = []): Array<{ src: string; dest: string; rel: string }> {
    const changed: Array<{ src: string; dest: string; rel: string }> = [];
    const walk = (srcDir: string, destDir: string, relBase: string) => {
        if (!fs.existsSync(srcDir)) {
            return;
        }
        const entries = fs.readdirSync(srcDir, { withFileTypes: true });
        for (const entry of entries) {
            const srcPath = path.join(srcDir, entry.name);
            const rel = relBase ? path.join(relBase, entry.name) : entry.name;
            const destPath = path.join(destDir, entry.name);
            if (entry.isDirectory()) {
                walk(srcPath, destPath, rel);
                continue;
            }
            if (entry.name === 'state.json') {
                continue;
            }
            const isSkippable = skipIfExist.some((skipPath) => destPath.endsWith(skipPath));
            if (isSkippable) {
                continue;
            }
            if (!fs.existsSync(destPath)) {
                continue;
            }
            try {
                const srcBytes = fs.readFileSync(srcPath);
                const destBytes = fs.readFileSync(destPath);
                if (!srcBytes.equals(destBytes)) {
                    changed.push({ src: srcPath, dest: destPath, rel });
                }
            } catch {
                // If compare fails, conservatively back it up.
                changed.push({ src: srcPath, dest: destPath, rel });
            }
        }
    };
    walk(src, dest, '');
    return changed;
}

function backupChangedRuntimeFiles(root: vscode.Uri, changed: Array<{ src: string; dest: string; rel: string }>): string | undefined {
    if (changed.length === 0) {
        return undefined;
    }
    const timestamp = new Date().toISOString().replace(/[:.]/g, '-');
    const backupRoot = path.join(root.fsPath, '.amphion', 'control-plane', 'backups', 'runtime', timestamp);
    for (const item of changed) {
        const backupPath = path.join(backupRoot, item.rel);
        fs.mkdirSync(path.dirname(backupPath), { recursive: true });
        fs.copyFileSync(item.dest, backupPath);
    }
    return backupRoot;
}

async function pathExists(root: vscode.Uri, relativePath: string): Promise<boolean> {
    try {
        await vscode.workspace.fs.stat(vscode.Uri.joinPath(root, relativePath));
        return true;
    } catch {
        return false;
    }
}

async function readJsonFile<T>(root: vscode.Uri, relativePath: string): Promise<T | undefined> {
    try {
        const bytes = await vscode.workspace.fs.readFile(vscode.Uri.joinPath(root, relativePath));
        return JSON.parse(new TextDecoder().decode(bytes)) as T;
    } catch {
        return undefined;
    }
}

async function ensureFileExists(root: vscode.Uri, relativePath: string, content: string): Promise<void> {
    const exists = await pathExists(root, relativePath);
    if (!exists) {
        await writeFile(root, relativePath, content);
    }
}

function runShellCommand(cwd: string, command: string): Promise<string> {
    return new Promise((resolve, reject) => {
        exec(command, { cwd }, (error, stdout, stderr) => {
            if (error) {
                reject(new Error(stderr || error.message));
                return;
            }
            resolve(stdout);
        });
    });
}

function normalizeProjectConfig(raw: AmphionConfigFile): ProjectConfig {
    return {
        projectName: typeof raw.projectName === 'string' && raw.projectName.trim().length > 0 ? raw.projectName : 'Amphion Project',
        serverLang: 'python',
        codename: typeof raw.codename === 'string' && raw.codename.trim().length > 0 ? raw.codename : 'BLACKCLAW',
        initialVersion: typeof raw.initialVersion === 'string' && raw.initialVersion.trim().length > 0 ? raw.initialVersion : '0.1.0',
        port: String(raw.port ?? '8765')
    };
}

async function getExtensionVersion(extensionUri: vscode.Uri): Promise<string> {
    try {
        const bytes = await vscode.workspace.fs.readFile(vscode.Uri.joinPath(extensionUri, 'package.json'));
        const parsed = JSON.parse(new TextDecoder().decode(bytes)) as { version?: string };
        return parsed.version ?? '0.0.0';
    } catch {
        return '0.0.0';
    }
}

export async function migrateEnvironment(
    root: vscode.Uri,
    extensionUri: vscode.Uri,
    targetVersion: string
): Promise<boolean> {
    const runtimeConfig = await readRuntimeConfig(root);
    runtimeConfig.mcdVersion = targetVersion;

    try {
        const status = await runShellCommand(root.fsPath, 'git status --porcelain');
        if (status.trim().length > 0) {
            const proceed = await vscode.window.showWarningMessage(
                'Environment update detected uncommitted changes. Continue anyway?',
                { modal: true },
                'Continue',
                'Abort'
            );
            if (proceed !== 'Continue') {
                return false;
            }
        }
    } catch {
        // No git repo or git unavailable. Continue with non-blocking behavior.
    }

    await ensureAmphionCore(root, runtimeConfig);

    const mcdDir = '.amphion/control-plane/mcd';
    await createDir(root, mcdDir);

    // Allowlist: generator-owned governance + command surfaces.
    const projectConfig = toProjectConfig(runtimeConfig);
    await writeFile(root, '.amphion/control-plane/GUARDRAILS.md', renderGuardrails(projectConfig));
    await writeFile(root, '.amphion/control-plane/MCD_PLAYBOOK.md', getPlaybookContent());
    await writeFile(root, `${mcdDir}/EVALUATE.md`, renderEvaluate(projectConfig));
    await writeFile(root, `${mcdDir}/BOARD.md`, renderBoard(projectConfig));
    await writeFile(root, `${mcdDir}/CONTRACT.md`, renderContract(projectConfig));
    await writeFile(root, `${mcdDir}/EXECUTE.md`, renderExecute(projectConfig));
    await writeFile(root, `${mcdDir}/CLOSEOUT.md`, renderCloseout(projectConfig));
    await writeFile(root, `${mcdDir}/REMEMBER.md`, renderRemember(projectConfig));

    const deckSrc = vscode.Uri.joinPath(extensionUri, 'assets', 'launch-command-deck');
    const deckDest = resolveCommandDeckPath(root, runtimeConfig);
    // Migrate legacy ops runtime into canonical path first, then overlay latest assets.
    const legacyDeckPath = path.join(root.fsPath, 'ops', 'launch-command-deck');
    if (fs.existsSync(legacyDeckPath) && !fs.existsSync(deckDest)) {
        copyDirSafeSync(legacyDeckPath, deckDest);
    }

    // Synchronize the Command Deck assets (safe migration, no data overwrite)
    const skipPaths = ['amphion.db'];
    const changedRuntimeFiles = collectChangedFilesForBackup(deckSrc.fsPath, deckDest, skipPaths);
    const backupPath = backupChangedRuntimeFiles(root, changedRuntimeFiles);
    copyDirSafeSync(deckSrc.fsPath, deckDest, skipPaths);
    if (backupPath) {
        vscode.window.showInformationMessage(`AmphionAgent: Backed up ${changedRuntimeFiles.length} modified runtime file(s) to ${backupPath}.`);
    }

    // Populate adapters for currently-detected IDEs.
    const targets = await detectIdeTargets(root);
    await ensureAdaptersForTargets(root, projectConfig, targets);
    await writeRuntimeConfig(root, runtimeConfig);

    return true;
}

export async function buildScaffold(
    root: vscode.Uri,
    config: ProjectConfig,
    extensionUri: vscode.Uri,
    initTerminal: vscode.Terminal
): Promise<void> {
    const extensionVersion = await getExtensionVersion(extensionUri);
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

    // Trigger the unified Webview flow
    const { OnboardingPanel } = await import('./onboardingWebview');
    OnboardingPanel.createOrShow(extensionUri, root);

    // 1. Create all directory structure
    for (const dir of DIRS) {
        await createDir(root, dir);
    }

    // 1.5 Write config context (.amphion canonical with ops compatibility mirror).
    const runtimeConfig = {
        port: config.port,
        serverLang: 'python' as const,
        codename: config.codename,
        projectName: config.projectName,
        initialVersion: config.initialVersion,
        mcdVersion: extensionVersion,
        commandDeckPath: '.amphion/command-deck',
    };
    await ensureAmphionCore(root, runtimeConfig);

    // 2. Write canonical control-plane docs
    await writeFile(
        root,
        '.amphion/control-plane/GUARDRAILS.md',
        renderGuardrails(config)
    );

    // Optional architecture sample retained in control-plane only.
    await writeFile(root, '.amphion/control-plane/EXAMPLE_MARKETING_IA.md', generateMermaidExampleTemplate(config.codename));

    // 3. Write MCD_PLAYBOOK.md
    await writeFile(
        root,
        '.amphion/control-plane/MCD_PLAYBOOK.md',
        getPlaybookContent()
    );

    // 4. Write Canonical Commands
    const mcdDir = '.amphion/control-plane/mcd';
    await writeFile(root, `${mcdDir}/EVALUATE.md`, renderEvaluate(config));
    await writeFile(root, `${mcdDir}/BOARD.md`, renderBoard(config));
    await writeFile(root, `${mcdDir}/CONTRACT.md`, renderContract(config));
    await writeFile(root, `${mcdDir}/EXECUTE.md`, renderExecute(config));
    await writeFile(root, `${mcdDir}/CLOSEOUT.md`, renderCloseout(config));
    await writeFile(root, `${mcdDir}/REMEMBER.md`, renderRemember(config));

    // 5. Generate only adapters needed for detected environment.
    const targets = await detectIdeTargets(root);
    await ensureAdaptersForTargets(root, config, targets);

    // 6. Copy the bundled Command Deck into canonical .amphion path.
    const deckSrc = vscode.Uri.joinPath(extensionUri, 'assets', 'launch-command-deck');
    const deckDest = resolveCommandDeckPath(root, runtimeConfig);
    copyDirSync(deckSrc.fsPath, deckDest);

    // 7. Initialize the Command Deck board for this project
    // (initTerminal replaces the old internal instantiation)

    const initScript = path.join(
        deckDest,
        'scripts',
        'init_command_deck.py',
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

    // (The Onboarding Webview handles the Charter/PRD continuation now. The Server start is deferred.)
}

export async function launchCommandDeck(root: vscode.Uri, config: ProjectConfig): Promise<void> {
    const result = await vscode.commands.executeCommand<{ ok: boolean; message: string; state: string; port: string }>('mcd.startServer', root);
    if (!result || !result.ok) {
        const message = result?.message ?? 'AmphionAgent: Failed to start Command Deck server.';
        vscode.window.showWarningMessage(message);
        return;
    }
    vscode.window.showInformationMessage(result.message);

    const url = `http://localhost:${result.port || config.port}`;

    setTimeout(() => {
        // Reveal the sidebar-hosted Agent Controls view
        vscode.commands.executeCommand('mcd.openDashboard');
        void flushPendingBoardArtifacts(root, false);

        // Also open the browser Command Deck
        const platform = os.platform();
        if (platform === 'darwin') {
            exec(`open ${url}`);
        } else if (platform === 'win32') {
            exec(`start ${url}`);
        } else {
            exec(`xdg-open ${url}`);
        }
    }, 2500);
}
