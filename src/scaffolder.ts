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
// Adapters and workflows are loaded dynamically in buildScaffold/deployWorkflows

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
    'referenceDocs/06_AgentMemory',
    '.agents/workflows',
    '.cursor/rules',
    '.cursor/commands',
    '.windsurf/workflows',
    'ops',
];

const CONFLICT_CHECK_DIRS = [
    'referenceDocs',
    'ops/launch-command-deck',
];

interface AmphionConfigFile {
    port?: string | number;
    serverLang?: 'python' | 'node' | string;
    codename?: string;
    projectName?: string;
    initialVersion?: string;
    mcdVersion?: string;
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
        serverLang: raw.serverLang === 'node' ? 'node' : 'python',
        codename: typeof raw.codename === 'string' && raw.codename.trim().length > 0 ? raw.codename : 'BLACKCLAW',
        initialVersion: typeof raw.initialVersion === 'string' && raw.initialVersion.trim().length > 0 ? raw.initialVersion : '0.1.0',
        port: String(raw.port ?? '8765')
    };
}

function buildDefaultAgentMemorySnapshot(milestone: string) {
    return {
        v: 1,
        upd: new Date().toISOString(),
        cur: {
            st: 'init',
            ms: milestone,
            ct: [],
            dec: [],
            trb: [],
            lrn: [],
            nx: [],
            ref: []
        },
        hist: []
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
    let rawConfig = await readJsonFile<AmphionConfigFile>(root, 'ops/amphion.json');
    if (!rawConfig) {
        rawConfig = {};
    }
    const config = normalizeProjectConfig(rawConfig);

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

    const mcdDir = 'referenceDocs/00_Governance/mcd';
    await createDir(root, 'referenceDocs/00_Governance/mcd');
    await createDir(root, 'referenceDocs/06_AgentMemory');
    await createDir(root, '.agents/workflows');
    await createDir(root, '.cursor/rules');
    await createDir(root, '.cursor/commands');
    await createDir(root, '.windsurf/workflows');

    // Allowlist: generator-owned governance + command surfaces.
    await writeFile(root, 'referenceDocs/00_Governance/GUARDRAILS.md', renderGuardrails(config));
    await writeFile(root, 'referenceDocs/00_Governance/MCD_PLAYBOOK.md', getPlaybookContent());
    await writeFile(root, `${mcdDir}/EVALUATE.md`, renderEvaluate(config));
    await writeFile(root, `${mcdDir}/BOARD.md`, renderBoard(config));
    await writeFile(root, `${mcdDir}/CONTRACT.md`, renderContract(config));
    await writeFile(root, `${mcdDir}/EXECUTE.md`, renderExecute(config));
    await writeFile(root, `${mcdDir}/CLOSEOUT.md`, renderCloseout(config));
    await writeFile(root, `${mcdDir}/REMEMBER.md`, renderRemember(config));

    // Allowlist: generator-owned adapters/workflows.
    const { renderClaudeMd, renderAgentsMd, renderCursorRules } = await import('./templates/adapters');
    await writeFile(root, 'CLAUDE.md', renderClaudeMd(config));
    await writeFile(root, 'AGENTS.md', renderAgentsMd(config));
    await appendOrWriteFile(root, '.cursorrules', renderCursorRules(config));
    await appendOrWriteFile(root, '.clinerules', renderCursorRules(config));
    await deployWorkflows(root, config);

    // Include memory/governance additions when missing.
    await ensureFileExists(
        root,
        'referenceDocs/06_AgentMemory/agent-memory.json',
        JSON.stringify(buildDefaultAgentMemorySnapshot('migration'), null, 2)
    );
    await ensureFileExists(
        root,
        'referenceDocs/06_AgentMemory/README.md',
        '# Agent Memory\n\nThis directory stores compact operational memory for agent continuity.\n\n- Canonical file: `agent-memory.json`\n- Update policy: mandatory at closeout, optional via `/remember` during long sessions.\n- Keep entries compact and bounded; detailed narratives stay in `referenceDocs/05_Records/`.\n'
    );

    const nextConfig = {
        ...rawConfig,
        port: config.port,
        serverLang: config.serverLang,
        codename: config.codename,
        projectName: config.projectName,
        initialVersion: config.initialVersion,
        mcdVersion: targetVersion
    };

    await writeFile(root, 'ops/amphion.json', JSON.stringify(nextConfig, null, 2));
    return true;
}

async function deployWorkflows(root: vscode.Uri, config: ProjectConfig): Promise<void> {
    const commands = ['evaluate', 'board', 'contract', 'execute', 'closeout', 'remember', 'docs'];
    const { renderAntigravityWorkflow, renderCursorRule, renderCursorCommand, renderWindsurfWorkflow } = await import('./templates/adapters');

    for (const cmd of commands) {
        // Antigravity
        await writeFile(root, `.agents/workflows/${cmd}.md`, renderAntigravityWorkflow(cmd, config));
        // Cursor Rules (background)
        await writeFile(root, `.cursor/rules/${cmd}.mdc`, renderCursorRule(cmd, config));
        // Cursor Commands (slash menu)
        await writeFile(root, `.cursor/commands/${cmd}.md`, renderCursorCommand(cmd, config));
        // Windsurf
        await writeFile(root, `.windsurf/workflows/${cmd}.md`, renderWindsurfWorkflow(cmd, config));
    }
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

    // 1.5 Write config context
    await writeFile(
        root,
        'ops/amphion.json',
        JSON.stringify({
            port: config.port,
            serverLang: config.serverLang,
            codename: config.codename,
            projectName: config.projectName,
            initialVersion: config.initialVersion,
            mcdVersion: extensionVersion
        }, null, 2)
    );

    // 2. Write GUARDRAILS.md
    await writeFile(
        root,
        'referenceDocs/00_Governance/GUARDRAILS.md',
        renderGuardrails(config)
    );

    // 2.5 Write Example Architecture Chart
    await writeFile(
        root,
        'referenceDocs/02_Architecture/EXAMPLE_MARKETING_IA.md',
        generateMermaidExampleTemplate(config.codename)
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
    await writeFile(root, `${mcdDir}/BOARD.md`, renderBoard(config));
    await writeFile(root, `${mcdDir}/CONTRACT.md`, renderContract(config));
    await writeFile(root, `${mcdDir}/EXECUTE.md`, renderExecute(config));
    await writeFile(root, `${mcdDir}/CLOSEOUT.md`, renderCloseout(config));
    await writeFile(root, `${mcdDir}/REMEMBER.md`, renderRemember(config));

    // 4.5 Write default compact memory artifacts
    await writeFile(
        root,
        'referenceDocs/06_AgentMemory/agent-memory.json',
        JSON.stringify(buildDefaultAgentMemorySnapshot('bootstrap'), null, 2)
    );
    await writeFile(
        root,
        'referenceDocs/06_AgentMemory/README.md',
        '# Agent Memory\n\nThis directory stores compact operational memory for agent continuity.\n\n- Canonical file: `agent-memory.json`\n- Update policy: mandatory at closeout, optional via `/remember` during long sessions.\n- Keep entries compact and bounded; detailed narratives stay in `referenceDocs/05_Records/`.\n'
    );

    // 5. Write Agent Adapters
    const { renderClaudeMd, renderAgentsMd, renderCursorRules } = await import('./templates/adapters');
    await writeFile(root, 'CLAUDE.md', renderClaudeMd(config));
    await writeFile(root, 'AGENTS.md', renderAgentsMd(config));
    await appendOrWriteFile(root, '.cursorrules', renderCursorRules(config));
    await appendOrWriteFile(root, '.clinerules', renderCursorRules(config));

    // 6. Deploy Multi-IDE Workflows
    await deployWorkflows(root, config);

    // 7. Copy the bundled Command Deck into ops/
    const deckSrc = vscode.Uri.joinPath(extensionUri, 'assets', 'launch-command-deck');
    const deckDest = path.join(root.fsPath, 'ops', 'launch-command-deck');
    copyDirSync(deckSrc.fsPath, deckDest);

    // 5. Initialize the Command Deck board for this project
    // (initTerminal replaces the old internal instantiation)

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

    // (The Onboarding Webview handles the Charter/PRD continuation now. The Server start is deferred.)
}

export async function launchCommandDeck(root: vscode.Uri, config: ProjectConfig): Promise<void> {
    const serverTerminal = vscode.window.createTerminal({
        name: `Command Deck :${config.port}`,
        cwd: root.fsPath,
    });
    serverTerminal.show();

    serverTerminal.sendText(
        `python3 ops/launch-command-deck/server.py --port ${config.port}`
    );

    const url = `http://localhost:${config.port}`;

    setTimeout(() => {
        // Launch the internal IDE dashboard
        vscode.commands.executeCommand('mcd.openDashboard');

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
