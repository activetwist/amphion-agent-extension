import * as fs from 'fs/promises';
import * as http from 'http';
import * as https from 'https';
import * as path from 'path';

type HookCommand = 'evaluate' | 'board' | 'contract' | 'execute' | 'closeout' | 'remember';

const SUPPORTED_COMMANDS: Set<HookCommand> = new Set([
    'evaluate',
    'board',
    'contract',
    'execute',
    'closeout',
    'remember',
]);

const COMMAND_BUCKET: Record<HookCommand, string> = {
    evaluate: 'ct',
    board: 'nx',
    contract: 'dec',
    execute: 'ct',
    closeout: 'ref',
    remember: 'ct',
};

interface StateResponse {
    ok?: boolean;
    state?: {
        activeBoardId?: string;
    };
}

interface WriteResponse {
    ok?: boolean;
}

export interface MemoryHookResult {
    attempted: boolean;
    recorded: boolean;
    command?: HookCommand;
    reason?: string;
}

function parseHookCommand(chatText: string): HookCommand | null {
    const normalized = chatText.trim().toLowerCase();
    const match = normalized.match(/^\/([a-z]+)/);
    if (!match) {
        return null;
    }
    const command = match[1] as HookCommand;
    if (!SUPPORTED_COMMANDS.has(command)) {
        return null;
    }
    return command;
}

async function resolvePort(workspaceRoot: string): Promise<string> {
    const paths = [
        path.join(workspaceRoot, '.amphion', 'config.json'),
        path.join(workspaceRoot, 'ops', 'amphion.json'),
    ];
    for (const configPath of paths) {
        try {
            const raw = await fs.readFile(configPath, 'utf8');
            const parsed = JSON.parse(raw) as { port?: string | number };
            if (parsed.port !== undefined && String(parsed.port).trim().length > 0) {
                return String(parsed.port).trim();
            }
        } catch {
            // Continue to next config candidate.
        }
    }
    return '8765';
}

function requestJson<T>(baseUrl: string, route: string, method: 'GET' | 'POST', payload?: unknown): Promise<T> {
    const target = new URL(route, baseUrl);
    const isHttps = target.protocol === 'https:';
    const transport = isHttps ? https : http;
    const body = payload === undefined ? '' : JSON.stringify(payload);

    return new Promise((resolve, reject) => {
        const req = transport.request(
            {
                hostname: target.hostname,
                port: target.port,
                path: `${target.pathname}${target.search}`,
                method,
                headers: payload === undefined
                    ? {}
                    : {
                        'Content-Type': 'application/json',
                        'Content-Length': Buffer.byteLength(body).toString(),
                    },
                timeout: 2500,
            },
            (res) => {
                const chunks: Buffer[] = [];
                res.on('data', (chunk: Buffer) => chunks.push(chunk));
                res.on('end', () => {
                    const raw = Buffer.concat(chunks).toString('utf8');
                    const statusCode = res.statusCode ?? 0;
                    if (statusCode < 200 || statusCode >= 300) {
                        reject(new Error(`HTTP ${statusCode}: ${raw || 'request failed'}`));
                        return;
                    }
                    if (!raw) {
                        resolve({} as T);
                        return;
                    }
                    try {
                        resolve(JSON.parse(raw) as T);
                    } catch {
                        reject(new Error('Invalid JSON response from Command Deck API'));
                    }
                });
            }
        );

        req.on('timeout', () => {
            req.destroy(new Error('Command Deck API timeout'));
        });
        req.on('error', reject);
        if (payload !== undefined) {
            req.write(body);
        }
        req.end();
    });
}

function toReason(error: unknown): string {
    if (error instanceof Error) {
        return error.message;
    }
    return String(error);
}

export async function recordCommandIntentFromChatInput(
    workspaceRoot: string,
    chatText: string
): Promise<MemoryHookResult> {
    const command = parseHookCommand(chatText);
    if (!command) {
        return { attempted: false, recorded: false, reason: 'unsupported-command' };
    }

    try {
        const port = await resolvePort(workspaceRoot);
        const baseUrl = `http://127.0.0.1:${port}`;
        const statePayload = await requestJson<StateResponse>(baseUrl, '/api/state', 'GET');
        const boardId = String(statePayload?.state?.activeBoardId || '').trim();
        if (!boardId) {
            return { attempted: true, recorded: false, command, reason: 'missing-active-board' };
        }

        const writePayload = {
            boardId,
            memoryKey: `phase.intent.${command}`,
            eventType: 'upsert',
            sourceType: 'verified-system',
            bucket: COMMAND_BUCKET[command],
            value: {
                command: `/${command}`,
                origin: 'dashboard',
                recordedAt: new Date().toISOString(),
            },
            tags: ['phase-intent', 'dashboard', command],
            sourceRef: 'extension:commandDeckDashboard',
        };

        const writeResponse = await requestJson<WriteResponse>(baseUrl, '/api/memory/events', 'POST', writePayload);
        if (writeResponse?.ok !== true) {
            return { attempted: true, recorded: false, command, reason: 'write-not-ok' };
        }
        return { attempted: true, recorded: true, command };
    } catch (error) {
        return { attempted: true, recorded: false, command, reason: toReason(error) };
    }
}
