import * as vscode from 'vscode';
import * as path from 'path';
import { ProjectConfig } from './wizard';
import {
    renderAgentsMd,
    renderClaudeMd,
    renderCursorCommand,
    renderCursorRule,
    renderCursorRules,
    renderAntigravityWorkflow,
    renderWindsurfWorkflow,
} from './templates/adapters';

export type IdeTarget = 'agents' | 'cursor' | 'windsurf' | 'claude';

export interface AmphionRuntimeConfig {
    port: string;
    serverLang: 'python';
    codename: string;
    projectName: string;
    initialVersion: string;
    mcdVersion: string;
    commandDeckPath: string;
}

export interface AdapterDecision {
    policy: 'accepted' | 'remind-later' | 'never';
    updatedAt: string;
}

export interface AmphionEnvironmentState {
    version: 1;
    detectedIdeTargets: IdeTarget[];
    adapterDecisions: Record<string, AdapterDecision>;
    lastPromptAt: string;
}

export interface AdapterWriteSummary {
    written: string[];
    skipped: string[];
}

const TARGET_SENTINELS: Record<IdeTarget, string[]> = {
    agents: ['AGENTS.md', '.agents/workflows/evaluate.md'],
    cursor: ['.cursor/rules/evaluate.mdc', '.cursor/commands/evaluate.md'],
    windsurf: ['.windsurf/workflows/evaluate.md'],
    claude: ['CLAUDE.md'],
};

const DEFAULT_RUNTIME_CONFIG: AmphionRuntimeConfig = {
    port: '8765',
    serverLang: 'python',
    codename: 'BLACKCLAW',
    projectName: 'Amphion Project',
    initialVersion: '0.1.0',
    mcdVersion: '0.0.0',
    commandDeckPath: '.amphion/command-deck',
};

const DEFAULT_ENVIRONMENT_STATE: AmphionEnvironmentState = {
    version: 1,
    detectedIdeTargets: [],
    adapterDecisions: {},
    lastPromptAt: '',
};

const ADAPTER_COMMANDS: string[] = ['evaluate', 'contract', 'execute', 'closeout', 'remember', 'docs'];

function nowIso(): string {
    return new Date().toISOString();
}

async function pathExists(root: vscode.Uri, relativePath: string): Promise<boolean> {
    try {
        await vscode.workspace.fs.stat(vscode.Uri.joinPath(root, relativePath));
        return true;
    } catch {
        return false;
    }
}

async function readJson<T>(root: vscode.Uri, relativePath: string): Promise<T | undefined> {
    try {
        const bytes = await vscode.workspace.fs.readFile(vscode.Uri.joinPath(root, relativePath));
        return JSON.parse(new TextDecoder().decode(bytes)) as T;
    } catch {
        return undefined;
    }
}

async function writeJson(root: vscode.Uri, relativePath: string, value: unknown): Promise<void> {
    const uri = vscode.Uri.joinPath(root, relativePath);
    const bytes = new TextEncoder().encode(JSON.stringify(value, null, 2));
    await vscode.workspace.fs.writeFile(uri, bytes);
}

async function writeText(root: vscode.Uri, relativePath: string, content: string): Promise<void> {
    const uri = vscode.Uri.joinPath(root, relativePath);
    await vscode.workspace.fs.writeFile(uri, new TextEncoder().encode(content));
}

async function ensureDir(root: vscode.Uri, relativePath: string): Promise<void> {
    const uri = vscode.Uri.joinPath(root, relativePath);
    await vscode.workspace.fs.createDirectory(uri);
}

function normalizeRuntimeConfig(raw?: Partial<AmphionRuntimeConfig>): AmphionRuntimeConfig {
    return {
        port: String(raw?.port || DEFAULT_RUNTIME_CONFIG.port),
        serverLang: 'python',
        codename: typeof raw?.codename === 'string' && raw.codename.trim().length > 0
            ? raw.codename.trim()
            : DEFAULT_RUNTIME_CONFIG.codename,
        projectName: typeof raw?.projectName === 'string' && raw.projectName.trim().length > 0
            ? raw.projectName.trim()
            : DEFAULT_RUNTIME_CONFIG.projectName,
        initialVersion: typeof raw?.initialVersion === 'string' && raw.initialVersion.trim().length > 0
            ? raw.initialVersion.trim()
            : DEFAULT_RUNTIME_CONFIG.initialVersion,
        mcdVersion: typeof raw?.mcdVersion === 'string' && raw.mcdVersion.trim().length > 0
            ? raw.mcdVersion.trim()
            : DEFAULT_RUNTIME_CONFIG.mcdVersion,
        commandDeckPath: typeof raw?.commandDeckPath === 'string' && raw.commandDeckPath.trim().length > 0
            ? raw.commandDeckPath.trim()
            : DEFAULT_RUNTIME_CONFIG.commandDeckPath,
    };
}

export async function readRuntimeConfig(root: vscode.Uri): Promise<AmphionRuntimeConfig> {
    const next = await readJson<Partial<AmphionRuntimeConfig>>(root, '.amphion/config.json');
    if (next) {
        const normalized = normalizeRuntimeConfig(next);
        const canonicalExists = await pathExists(root, normalized.commandDeckPath);
        if (canonicalExists) {
            return normalized;
        }
        const legacyPath = 'ops/launch-command-deck';
        if (await pathExists(root, legacyPath)) {
            normalized.commandDeckPath = legacyPath;
        }
        return normalized;
    }
    const legacy = await readJson<Partial<AmphionRuntimeConfig>>(root, 'ops/amphion.json');
    const normalized = normalizeRuntimeConfig(legacy);
    const configuredExists = await pathExists(root, normalized.commandDeckPath);
    if (configuredExists) {
        return normalized;
    }
    const legacyPath = 'ops/launch-command-deck';
    if (await pathExists(root, legacyPath)) {
        normalized.commandDeckPath = legacyPath;
    }
    return normalized;
}

export async function writeRuntimeConfig(root: vscode.Uri, config: AmphionRuntimeConfig): Promise<void> {
    await ensureDir(root, '.amphion');
    await writeJson(root, '.amphion/config.json', config);
    await ensureDir(root, 'ops');
    await writeJson(root, 'ops/amphion.json', config);
}

export async function readEnvironmentState(root: vscode.Uri): Promise<AmphionEnvironmentState> {
    const state = await readJson<Partial<AmphionEnvironmentState>>(root, '.amphion/environment.json');
    if (!state) {
        return { ...DEFAULT_ENVIRONMENT_STATE };
    }
    return {
        version: 1,
        detectedIdeTargets: Array.isArray(state.detectedIdeTargets)
            ? state.detectedIdeTargets.filter((v): v is IdeTarget => ['agents', 'cursor', 'windsurf', 'claude'].includes(String(v)))
            : [],
        adapterDecisions: state.adapterDecisions && typeof state.adapterDecisions === 'object'
            ? state.adapterDecisions as Record<string, AdapterDecision>
            : {},
        lastPromptAt: typeof state.lastPromptAt === 'string' ? state.lastPromptAt : '',
    };
}

export async function writeEnvironmentState(root: vscode.Uri, state: AmphionEnvironmentState): Promise<void> {
    await ensureDir(root, '.amphion');
    await writeJson(root, '.amphion/environment.json', state);
}

export async function ensureAmphionCore(root: vscode.Uri, config: AmphionRuntimeConfig): Promise<void> {
    await ensureDir(root, '.amphion');
    await ensureDir(root, '.amphion/memory');
    await writeRuntimeConfig(root, config);

    const envExists = await pathExists(root, '.amphion/environment.json');
    if (!envExists) {
        await writeEnvironmentState(root, { ...DEFAULT_ENVIRONMENT_STATE });
    }
}

export function toProjectConfig(config: AmphionRuntimeConfig): ProjectConfig {
    return {
        projectName: config.projectName,
        serverLang: 'python',
        codename: config.codename,
        initialVersion: config.initialVersion,
        port: config.port,
    };
}

export function resolveCommandDeckPath(workspaceRoot: vscode.Uri, config: AmphionRuntimeConfig): string {
    const rel = config.commandDeckPath || DEFAULT_RUNTIME_CONFIG.commandDeckPath;
    return path.join(workspaceRoot.fsPath, rel);
}

export async function detectIdeTargets(root: vscode.Uri): Promise<IdeTarget[]> {
    const targets: Set<IdeTarget> = new Set<IdeTarget>(['agents']);
    const appName = (vscode.env.appName || '').toLowerCase();
    if (appName.includes('cursor')) {
        targets.add('cursor');
    }
    if (appName.includes('windsurf')) {
        targets.add('windsurf');
    }
    if (appName.includes('claude') || appName.includes('cline')) {
        targets.add('claude');
    }

    const checks: Array<{ target: IdeTarget; path: string }> = [
        { target: 'cursor', path: '.cursor' },
        { target: 'windsurf', path: '.windsurf' },
        { target: 'claude', path: 'CLAUDE.md' },
    ];
    for (const check of checks) {
        if (await pathExists(root, check.path)) {
            targets.add(check.target);
        }
    }

    return Array.from(targets.values()).sort();
}

export async function detectAdapterGaps(root: vscode.Uri, targets: IdeTarget[]): Promise<IdeTarget[]> {
    const gaps: IdeTarget[] = [];
    for (const target of targets) {
        const sentinels = TARGET_SENTINELS[target] || [];
        let complete = true;
        for (const relativePath of sentinels) {
            if (!(await pathExists(root, relativePath))) {
                complete = false;
                break;
            }
        }
        if (!complete) {
            gaps.push(target);
        }
    }
    return gaps;
}

async function appendUnique(root: vscode.Uri, relativePath: string, content: string): Promise<void> {
    const uri = vscode.Uri.joinPath(root, relativePath);
    let existing = '';
    try {
        const bytes = await vscode.workspace.fs.readFile(uri);
        existing = new TextDecoder().decode(bytes);
    } catch {
        existing = '';
    }
    if (existing.includes(content.trim())) {
        return;
    }
    const next = existing ? `${existing.trimEnd()}\n\n${content}` : content;
    await vscode.workspace.fs.writeFile(uri, new TextEncoder().encode(next));
}

export async function ensureAdaptersForTargets(
    root: vscode.Uri,
    project: ProjectConfig,
    targets: IdeTarget[],
    options?: { dryRun?: boolean }
): Promise<AdapterWriteSummary> {
    const dryRun = options?.dryRun === true;
    const normalizedTargets: IdeTarget[] = Array.from(new Set<IdeTarget>(['agents', ...targets])).sort();
    const written: string[] = [];
    const skipped: string[] = [];

    const writeMaybe = async (relativePath: string, content: string, append = false) => {
        if (dryRun) {
            written.push(relativePath);
            return;
        }
        if (append) {
            await appendUnique(root, relativePath, content);
        } else {
            await writeText(root, relativePath, content);
        }
        written.push(relativePath);
    };

    if (normalizedTargets.includes('agents')) {
        await ensureDir(root, '.agents/workflows');
        await writeMaybe('AGENTS.md', renderAgentsMd(project));
        for (const cmd of ADAPTER_COMMANDS) {
            await writeMaybe(`.agents/workflows/${cmd}.md`, renderAntigravityWorkflow(cmd, project));
        }
    } else {
        skipped.push('AGENTS.md');
    }

    if (normalizedTargets.includes('claude')) {
        await writeMaybe('CLAUDE.md', renderClaudeMd(project));
        await writeMaybe('.clinerules', renderCursorRules(project), true);
    }

    if (normalizedTargets.includes('cursor')) {
        await ensureDir(root, '.cursor/rules');
        await ensureDir(root, '.cursor/commands');
        await writeMaybe('.cursorrules', renderCursorRules(project), true);
        for (const cmd of ADAPTER_COMMANDS) {
            await writeMaybe(`.cursor/rules/${cmd}.mdc`, renderCursorRule(cmd, project));
            await writeMaybe(`.cursor/commands/${cmd}.md`, renderCursorCommand(cmd, project));
        }
    }

    if (normalizedTargets.includes('windsurf')) {
        await ensureDir(root, '.windsurf/workflows');
        for (const cmd of ADAPTER_COMMANDS) {
            await writeMaybe(`.windsurf/workflows/${cmd}.md`, renderWindsurfWorkflow(cmd, project));
        }
    }

    return { written, skipped };
}
