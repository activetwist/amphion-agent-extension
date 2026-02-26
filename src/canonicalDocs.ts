import * as http from 'http';
import * as crypto from 'crypto';
import * as vscode from 'vscode';
import { readRuntimeConfig } from './environment';

type JsonObject = Record<string, unknown>;

function requestJson<T>(port: string, method: string, path: string, body?: JsonObject): Promise<T> {
    return new Promise((resolve, reject) => {
        const payload = body ? JSON.stringify(body) : undefined;
        const req = http.request(
            {
                hostname: '127.0.0.1',
                port: Number(port),
                path,
                method,
                headers: payload
                    ? {
                        'Content-Type': 'application/json',
                        'Content-Length': Buffer.byteLength(payload),
                    }
                    : undefined,
                timeout: 3000,
            },
            (res) => {
                const chunks: Buffer[] = [];
                res.on('data', (chunk) => chunks.push(Buffer.isBuffer(chunk) ? chunk : Buffer.from(chunk)));
                res.on('end', () => {
                    try {
                        const raw = Buffer.concat(chunks).toString('utf8');
                        const parsed = JSON.parse(raw) as T & { ok?: boolean; error?: string };
                        if (!res.statusCode || res.statusCode < 200 || res.statusCode >= 300 || parsed.ok === false) {
                            reject(new Error(parsed.error || `Request failed (${res.statusCode || 0})`));
                            return;
                        }
                        resolve(parsed);
                    } catch (error) {
                        reject(error);
                    }
                });
            },
        );
        req.on('error', reject);
        req.on('timeout', () => {
            req.destroy(new Error('Request timed out'));
        });
        if (payload) {
            req.write(payload);
        }
        req.end();
    });
}

interface BoardStateResponse {
    ok: boolean;
    state: {
        activeBoardId: string;
    };
}

type ArtifactType = 'charter' | 'prd' | 'guardrails' | 'playbook';

interface PendingArtifact {
    key: string;
    artifactType: ArtifactType;
    title: string;
    summary: string;
    body: string;
    sourceRef: string;
    queuedAt: string;
}

interface BoardContext {
    port: string;
    boardId: string;
}

function pendingQueueUri(root: vscode.Uri): vscode.Uri {
    return vscode.Uri.joinPath(root, '.amphion', 'control-plane', 'pending-artifacts.jsonl');
}

async function ensureQueueDir(root: vscode.Uri): Promise<void> {
    await vscode.workspace.fs.createDirectory(vscode.Uri.joinPath(root, '.amphion', 'control-plane'));
}

async function readQueue(root: vscode.Uri): Promise<PendingArtifact[]> {
    const uri = pendingQueueUri(root);
    try {
        const raw = new TextDecoder().decode(await vscode.workspace.fs.readFile(uri));
        return raw
            .split('\n')
            .map((line) => line.trim())
            .filter((line) => line.length > 0)
            .map((line) => JSON.parse(line) as PendingArtifact);
    } catch {
        return [];
    }
}

async function writeQueue(root: vscode.Uri, items: PendingArtifact[]): Promise<void> {
    const uri = pendingQueueUri(root);
    if (items.length === 0) {
        try {
            await vscode.workspace.fs.delete(uri, { useTrash: false });
        } catch {
            // Queue already absent.
        }
        return;
    }
    await ensureQueueDir(root);
    const payload = `${items.map((item) => JSON.stringify(item)).join('\n')}\n`;
    await vscode.workspace.fs.writeFile(uri, new TextEncoder().encode(payload));
}

function buildArtifactKey(artifactType: ArtifactType, title: string, body: string): string {
    const hash = crypto.createHash('sha256').update(`${artifactType}::${title}::${body}`, 'utf8').digest('hex');
    return `${artifactType}:${hash}`;
}

async function enqueuePendingArtifact(root: vscode.Uri, item: PendingArtifact): Promise<void> {
    const items = await readQueue(root);
    if (!items.some((existing) => existing.key === item.key)) {
        items.push(item);
        await writeQueue(root, items);
    }
}

async function resolveBoardContext(root: vscode.Uri): Promise<BoardContext> {
    const runtime = await readRuntimeConfig(root);
    const state = await requestJson<BoardStateResponse>(runtime.port, 'GET', '/api/state');
    const boardId = String(state.state.activeBoardId || '').trim();
    if (!boardId) {
        throw new Error('No active board found for canonical artifact write.');
    }
    return { port: runtime.port, boardId };
}

async function postBoardArtifact(context: BoardContext, item: PendingArtifact): Promise<void> {
    await requestJson<{ ok: boolean }>(context.port, 'POST', `/api/boards/${context.boardId}/artifacts`, {
        artifactType: item.artifactType,
        title: item.title,
        summary: item.summary,
        body: item.body,
        sourceRef: item.sourceRef,
    });
}

export async function flushPendingBoardArtifacts(root: vscode.Uri, silent = true): Promise<{ flushed: number; remaining: number }> {
    const queue = await readQueue(root);
    if (queue.length === 0) {
        return { flushed: 0, remaining: 0 };
    }

    let context: BoardContext;
    try {
        context = await resolveBoardContext(root);
    } catch {
        return { flushed: 0, remaining: queue.length };
    }

    const remaining: PendingArtifact[] = [];
    let flushed = 0;
    for (const item of queue) {
        try {
            await postBoardArtifact(context, item);
            flushed += 1;
        } catch {
            remaining.push(item);
        }
    }

    await writeQueue(root, remaining);
    if (!silent && flushed > 0) {
        vscode.window.showInformationMessage(`AmphionAgent: Flushed ${flushed} pending artifact(s) to Command Deck DB.`);
    }
    return { flushed, remaining: remaining.length };
}

export async function writeBoardArtifact(
    root: vscode.Uri,
    artifactType: ArtifactType,
    title: string,
    summary: string,
    body: string,
): Promise<void> {
    const pending: PendingArtifact = {
        key: buildArtifactKey(artifactType, title, body),
        artifactType,
        title,
        summary,
        body,
        sourceRef: '.amphion/control-plane',
        queuedAt: new Date().toISOString(),
    };

    try {
        await flushPendingBoardArtifacts(root, true);
        const context = await resolveBoardContext(root);
        await postBoardArtifact(context, pending);
        return;
    } catch (error) {
        await enqueuePendingArtifact(root, pending);
        const reason = error instanceof Error ? error.message : String(error);
        vscode.window.showWarningMessage(
            `AmphionAgent: Command Deck API unavailable during artifact write (${reason}). Queued ${artifactType.toUpperCase()} for automatic DB flush.`
        );
    }
}
