import * as vscode from 'vscode';
import * as fs from 'fs/promises';
import * as http from 'http';
import * as path from 'path';
import { spawn } from 'child_process';
import { readRuntimeConfig, resolveCommandDeckPath } from './environment';
import { flushPendingBoardArtifacts } from './canonicalDocs';

interface ServerProcessMetadata {
    pid: number;
    port: string;
    startedAt: string;
}

type ServerActionState =
    | 'started'
    | 'already-running'
    | 'stopped'
    | 'already-stopped'
    | 'unmanaged-running'
    | 'error';

export interface ServerActionResult {
    ok: boolean;
    state: ServerActionState;
    message: string;
    port: string;
    pid?: number;
}

interface CommandDeckHealthPayload {
    ok?: boolean;
    runtime?: {
        server?: string;
        implementation?: string;
        datastore?: string;
        fingerprint?: string;
    };
}

type CommandDeckHealthStatus = 'canonical' | 'noncanonical' | 'unreachable';

const DEFAULT_PORT = '8765';
const EXPECTED_RUNTIME_SERVER = 'launch-command-deck';
const EXPECTED_RUNTIME_IMPLEMENTATION = 'python';
const EXPECTED_RUNTIME_DATASTORE = 'sqlite';
const EXPECTED_RUNTIME_FINGERPRINT = `${EXPECTED_RUNTIME_SERVER}:${EXPECTED_RUNTIME_IMPLEMENTATION}:${EXPECTED_RUNTIME_DATASTORE}`;

export class ServerController {
    constructor(private readonly context: vscode.ExtensionContext) {}

    private resolveWorkspaceRoot(root?: vscode.Uri): vscode.Uri | undefined {
        if (root) {
            return root;
        }
        const folders = vscode.workspace.workspaceFolders;
        return folders && folders.length > 0 ? folders[0].uri : undefined;
    }

    private processStateKey(root: vscode.Uri): string {
        return `amphion.server.process:${root.fsPath}`;
    }

    private async readPort(root: vscode.Uri): Promise<string> {
        try {
            const parsed = await readRuntimeConfig(root);
            const port = String(parsed.port ?? DEFAULT_PORT).trim();
            return port.length > 0 ? port : DEFAULT_PORT;
        } catch {
            return DEFAULT_PORT;
        }
    }

    private readStoredProcess(root: vscode.Uri): ServerProcessMetadata | undefined {
        return this.context.workspaceState.get<ServerProcessMetadata>(this.processStateKey(root));
    }

    private async writeStoredProcess(root: vscode.Uri, metadata?: ServerProcessMetadata): Promise<void> {
        await this.context.workspaceState.update(this.processStateKey(root), metadata);
    }

    private async isPidAlive(pid: number): Promise<boolean> {
        if (!Number.isInteger(pid) || pid <= 0) {
            return false;
        }
        try {
            process.kill(pid, 0);
            return true;
        } catch {
            return false;
        }
    }

    private isCanonicalRuntime(payload: CommandDeckHealthPayload): boolean {
        if (!payload || payload.ok !== true || !payload.runtime) {
            return false;
        }
        const runtime = payload.runtime;
        if (runtime.fingerprint && runtime.fingerprint === EXPECTED_RUNTIME_FINGERPRINT) {
            return true;
        }
        return (
            runtime.server === EXPECTED_RUNTIME_SERVER
            && runtime.implementation === EXPECTED_RUNTIME_IMPLEMENTATION
            && runtime.datastore === EXPECTED_RUNTIME_DATASTORE
        );
    }

    private async healthCheck(port: string): Promise<CommandDeckHealthStatus> {
        return new Promise((resolve) => {
            const req = http.request(
                {
                    hostname: '127.0.0.1',
                    port: Number(port),
                    path: '/api/health',
                    method: 'GET',
                    timeout: 1500,
                },
                (res) => {
                    const statusCode = res.statusCode ?? 0;
                    if (statusCode < 200 || statusCode >= 300) {
                        res.resume();
                        resolve('unreachable');
                        return;
                    }
                    const chunks: Buffer[] = [];
                    res.on('data', (chunk: Buffer | string) => {
                        chunks.push(typeof chunk === 'string' ? Buffer.from(chunk) : chunk);
                    });
                    res.on('end', () => {
                        const raw = Buffer.concat(chunks).toString('utf8').trim();
                        if (!raw) {
                            resolve('noncanonical');
                            return;
                        }
                        try {
                            const payload = JSON.parse(raw) as CommandDeckHealthPayload;
                            resolve(this.isCanonicalRuntime(payload) ? 'canonical' : 'noncanonical');
                        } catch {
                            resolve('noncanonical');
                        }
                    });
                }
            );
            req.on('timeout', () => {
                req.destroy();
                resolve('unreachable');
            });
            req.on('error', () => resolve('unreachable'));
            req.end();
        });
    }

    private async waitForHealth(port: string, expected: CommandDeckHealthStatus, timeoutMs: number): Promise<boolean> {
        const start = Date.now();
        while (Date.now() - start < timeoutMs) {
            const status = await this.healthCheck(port);
            if (status === expected) {
                return true;
            }
            await new Promise((resolve) => setTimeout(resolve, 200));
        }
        return false;
    }

    private async terminatePid(pid: number): Promise<boolean> {
        if (!(await this.isPidAlive(pid))) {
            return true;
        }
        try {
            if (process.platform === 'win32') {
                process.kill(pid, 'SIGTERM');
            } else {
                process.kill(-pid, 'SIGTERM');
            }
        } catch {
            try {
                process.kill(pid, 'SIGTERM');
            } catch {
                // Continue to liveness check / fallback.
            }
        }

        const gracefulStopped = await this.waitForPidExit(pid, 2500);
        if (gracefulStopped) {
            return true;
        }

        try {
            if (process.platform === 'win32') {
                process.kill(pid, 'SIGKILL');
            } else {
                process.kill(-pid, 'SIGKILL');
            }
        } catch {
            try {
                process.kill(pid, 'SIGKILL');
            } catch {
                // Ignore; final liveness check below.
            }
        }

        return this.waitForPidExit(pid, 2000);
    }

    private async waitForPidExit(pid: number, timeoutMs: number): Promise<boolean> {
        const start = Date.now();
        while (Date.now() - start < timeoutMs) {
            if (!(await this.isPidAlive(pid))) {
                return true;
            }
            await new Promise((resolve) => setTimeout(resolve, 200));
        }
        return !(await this.isPidAlive(pid));
    }

    public async start(root?: vscode.Uri): Promise<ServerActionResult> {
        const workspaceRoot = this.resolveWorkspaceRoot(root);
        if (!workspaceRoot) {
            return {
                ok: false,
                state: 'error',
                message: 'AmphionAgent: No workspace folder open to start server.',
                port: DEFAULT_PORT,
            };
        }

        const port = await this.readPort(workspaceRoot);
        const stored = this.readStoredProcess(workspaceRoot);
        if (stored && await this.isPidAlive(stored.pid)) {
            const managedStatus = await this.healthCheck(stored.port);
            if (managedStatus === 'canonical') {
                void flushPendingBoardArtifacts(workspaceRoot, true);
                return {
                    ok: true,
                    state: 'already-running',
                    message: `AmphionAgent: Command Deck already running on port ${stored.port}.`,
                    port: stored.port,
                    pid: stored.pid,
                };
            }
            await this.writeStoredProcess(workspaceRoot, undefined);
        }

        const healthStatus = await this.healthCheck(port);
        if (healthStatus === 'canonical') {
            await this.writeStoredProcess(workspaceRoot, undefined);
            void flushPendingBoardArtifacts(workspaceRoot, true);
            return {
                ok: true,
                state: 'already-running',
                message: `AmphionAgent: Canonical Command Deck runtime already reachable on port ${port}.`,
                port,
            };
        }
        if (healthStatus === 'noncanonical') {
            return {
                ok: false,
                state: 'unmanaged-running',
                message: `AmphionAgent: Non-canonical service is occupying port ${port}. Stop it and retry so Python+SQLite Command Deck can start.`,
                port,
            };
        }

        const runtime = await readRuntimeConfig(workspaceRoot);
        const scriptPath = path.join(resolveCommandDeckPath(workspaceRoot, runtime), 'server.py');
        try {
            await fs.access(scriptPath);
        } catch {
            return {
                ok: false,
                state: 'error',
                message: `AmphionAgent: Server script not found at ${scriptPath}.`,
                port,
            };
        }

        try {
            const child = spawn('python3', [scriptPath, '--port', port], {
                cwd: workspaceRoot.fsPath,
                detached: true,
                stdio: 'ignore',
            });
            child.unref();

            if (!child.pid || child.pid <= 0) {
                return {
                    ok: false,
                    state: 'error',
                    message: 'AmphionAgent: Failed to start server process.',
                    port,
                };
            }

            await this.writeStoredProcess(workspaceRoot, {
                pid: child.pid,
                port,
                startedAt: new Date().toISOString(),
            });

            const healthy = await this.waitForHealth(port, 'canonical', 5000);
            if (!healthy) {
                await this.terminatePid(child.pid);
                await this.writeStoredProcess(workspaceRoot, undefined);
                return {
                    ok: false,
                    state: 'error',
                    message: `AmphionAgent: Started process on port ${port}, but canonical Python+SQLite runtime verification failed.`,
                    port,
                    pid: child.pid,
                };
            }
            void flushPendingBoardArtifacts(workspaceRoot, true);
            return {
                ok: true,
                state: 'started',
                message: `AmphionAgent: Started Command Deck on port ${port}.`,
                port,
                pid: child.pid,
            };
        } catch (error) {
            await this.writeStoredProcess(workspaceRoot, undefined);
            return {
                ok: false,
                state: 'error',
                message: `AmphionAgent: Failed to start server on port ${port}.`,
                port,
            };
        }
    }

    public async stop(root?: vscode.Uri): Promise<ServerActionResult> {
        const workspaceRoot = this.resolveWorkspaceRoot(root);
        if (!workspaceRoot) {
            return {
                ok: false,
                state: 'error',
                message: 'AmphionAgent: No workspace folder open to stop server.',
                port: DEFAULT_PORT,
            };
        }

        const port = await this.readPort(workspaceRoot);
        const stored = this.readStoredProcess(workspaceRoot);

        if (stored && await this.isPidAlive(stored.pid)) {
            const stopped = await this.terminatePid(stored.pid);
            await this.writeStoredProcess(workspaceRoot, undefined);
            await this.waitForHealth(port, 'unreachable', 4000);
            if (stopped) {
                return {
                    ok: true,
                    state: 'stopped',
                    message: `AmphionAgent: Stopped Command Deck on port ${stored.port}.`,
                    port: stored.port,
                    pid: stored.pid,
                };
            }
            return {
                ok: false,
                state: 'error',
                message: `AmphionAgent: Unable to fully stop managed server process on port ${stored.port}.`,
                port: stored.port,
                pid: stored.pid,
            };
        }

        await this.writeStoredProcess(workspaceRoot, undefined);
        const healthStatus = await this.healthCheck(port);
        if (healthStatus === 'canonical') {
            return {
                ok: false,
                state: 'unmanaged-running',
                message: `AmphionAgent: Canonical Command Deck runtime is running on port ${port} but is not managed by this extension session.`,
                port,
            };
        }
        if (healthStatus === 'noncanonical') {
            return {
                ok: false,
                state: 'unmanaged-running',
                message: `AmphionAgent: Non-canonical service is running on port ${port}.`,
                port,
            };
        }

        return {
            ok: true,
            state: 'already-stopped',
            message: `AmphionAgent: No running managed server found on port ${port}.`,
            port,
        };
    }
}
