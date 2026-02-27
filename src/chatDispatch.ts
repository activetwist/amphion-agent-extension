import * as vscode from 'vscode';
import {
    type ChatProvider,
    detectChatProvider,
    isPrefillCommand,
    resolveDispatchCommands,
    runChatDispatchPlanSelfTest,
    uniqueCommandList,
} from './chatDispatchPlan';

export type DispatchMode = 'dry-run' | 'live';

type DispatchStage = 'prefill' | 'open' | 'type';

interface ChatDispatchConfig {
    openDelayMs: number;
    enableDiagnosticsLogging: boolean;
    overrides: Record<ChatProvider, string[]>;
}

interface DispatchAttempt {
    stage: DispatchStage;
    commandId: string;
    payloadKind?: string;
    ok: boolean;
    error?: string;
}

export interface ChatDispatchDiagnostics {
    appName: string;
    provider: ChatProvider;
    input: string;
    mode: DispatchMode;
    timestamp: string;
    availableCommandCount: number;
    overrideCommands: string[];
    discoveredCommands: string[];
    resolvedCommands: string[];
    attempts: DispatchAttempt[];
    success: boolean;
    successCommand?: string;
    failureReason?: string;
}

export interface ChatDispatchResult {
    ok: boolean;
    diagnostics: ChatDispatchDiagnostics;
}

let diagnosticsChannel: vscode.OutputChannel | undefined;

function getDiagnosticsChannel(): vscode.OutputChannel {
    if (!diagnosticsChannel) {
        diagnosticsChannel = vscode.window.createOutputChannel('AmphionAgent Chat Dispatch');
    }
    return diagnosticsChannel;
}

function parseCommandOverride(value: unknown): string[] {
    if (!Array.isArray(value)) {
        return [];
    }
    const onlyStrings = value.filter((item): item is string => typeof item === 'string');
    return uniqueCommandList(onlyStrings);
}

function parseOpenDelayMs(value: number): number {
    if (!Number.isFinite(value)) {
        return 120;
    }
    const rounded = Math.round(value);
    return Math.min(Math.max(rounded, 30), 1500);
}

function getConfig(): ChatDispatchConfig {
    const config = vscode.workspace.getConfiguration('amphion.chatDispatch');
    return {
        openDelayMs: parseOpenDelayMs(Number(config.get<number>('openDelayMs', 120))),
        enableDiagnosticsLogging: Boolean(config.get<boolean>('enableDiagnosticsLogging', false)),
        overrides: {
            vscode: parseCommandOverride(config.get<unknown>('vscodeCommands', [])),
            cursor: parseCommandOverride(config.get<unknown>('cursorCommands', [])),
            windsurf: parseCommandOverride(config.get<unknown>('windsurfCommands', [])),
            antigravity: parseCommandOverride(config.get<unknown>('antigravityCommands', [])),
            generic: parseCommandOverride(config.get<unknown>('genericCommands', [])),
        },
    };
}

function toErrorString(error: unknown): string {
    if (error instanceof Error && error.message) {
        return error.message;
    }
    return String(error);
}

function getPayloadVariants(text: string): Array<{ kind: string; value: unknown }> {
    return [
        { kind: 'query-object', value: { query: text } },
        { kind: 'prompt-object', value: { prompt: text } },
        { kind: 'text-object', value: { text } },
        { kind: 'input-object', value: { input: text } },
        { kind: 'string', value: text },
    ];
}

function buildFailureReason(input: string, resolvedCommands: string[], attempts: DispatchAttempt[]): string {
    if (!input.trim()) {
        return 'empty-input';
    }
    if (resolvedCommands.length === 0) {
        return 'no-supported-chat-commands';
    }
    if (attempts.length === 0) {
        return 'no-attempts-executed';
    }
    const hasOpenFail = attempts.some((attempt) => attempt.stage === 'open' && !attempt.ok);
    const hasTypeFail = attempts.some((attempt) => attempt.stage === 'type' && !attempt.ok);
    const hasPrefillFail = attempts.some((attempt) => attempt.stage === 'prefill' && !attempt.ok);
    if (hasTypeFail && !hasOpenFail) {
        return 'chat-opened-but-type-failed';
    }
    if (hasOpenFail && !hasTypeFail && !hasPrefillFail) {
        return 'chat-open-failed';
    }
    if (hasPrefillFail && !hasOpenFail && !hasTypeFail) {
        return 'prefill-not-supported';
    }
    return 'all-dispatch-attempts-failed';
}

function logDiagnosticsIfEnabled(config: ChatDispatchConfig, diagnostics: ChatDispatchDiagnostics): void {
    if (!config.enableDiagnosticsLogging) {
        return;
    }
    const channel = getDiagnosticsChannel();
    channel.appendLine(`[${diagnostics.timestamp}] app=${diagnostics.appName} provider=${diagnostics.provider}`);
    channel.appendLine(JSON.stringify(diagnostics, null, 2));
    channel.show(true);
}

export async function diagnoseChatDispatch(chatText: string, mode: DispatchMode = 'dry-run'): Promise<ChatDispatchDiagnostics> {
    const appName = vscode.env.appName || 'unknown';
    const provider = detectChatProvider(appName);
    const config = getConfig();
    const availableCommands = await vscode.commands.getCommands(true);
    const overrideCommands = config.overrides[provider].length > 0
        ? config.overrides[provider]
        : config.overrides.generic;
    const { discovered, resolved } = resolveDispatchCommands(provider, availableCommands, overrideCommands);
    const diagnostics: ChatDispatchDiagnostics = {
        appName,
        provider,
        input: chatText,
        mode,
        timestamp: new Date().toISOString(),
        availableCommandCount: availableCommands.length,
        overrideCommands,
        discoveredCommands: discovered,
        resolvedCommands: resolved,
        attempts: [],
        success: false,
    };

    if (mode === 'dry-run') {
        diagnostics.failureReason = buildFailureReason(chatText, resolved, diagnostics.attempts);
        logDiagnosticsIfEnabled(config, diagnostics);
        return diagnostics;
    }

    const text = chatText.trim();
    if (!text) {
        diagnostics.failureReason = 'empty-input';
        logDiagnosticsIfEnabled(config, diagnostics);
        return diagnostics;
    }

    const payloadVariants = getPayloadVariants(text);

    for (const commandId of resolved) {
        if (!isPrefillCommand(commandId)) {
            continue;
        }
        for (const payload of payloadVariants) {
            try {
                await vscode.commands.executeCommand(commandId, payload.value);
                diagnostics.attempts.push({
                    stage: 'prefill',
                    commandId,
                    payloadKind: payload.kind,
                    ok: true,
                });
                diagnostics.success = true;
                diagnostics.successCommand = commandId;
                logDiagnosticsIfEnabled(config, diagnostics);
                return diagnostics;
            } catch (error) {
                diagnostics.attempts.push({
                    stage: 'prefill',
                    commandId,
                    payloadKind: payload.kind,
                    ok: false,
                    error: toErrorString(error),
                });
            }
        }
    }

    for (const commandId of resolved) {
        try {
            await vscode.commands.executeCommand(commandId);
            diagnostics.attempts.push({
                stage: 'open',
                commandId,
                ok: true,
            });
        } catch (error) {
            diagnostics.attempts.push({
                stage: 'open',
                commandId,
                ok: false,
                error: toErrorString(error),
            });
            continue;
        }

        try {
            await new Promise((resolve) => setTimeout(resolve, config.openDelayMs));
            await vscode.commands.executeCommand('type', { text });
            diagnostics.attempts.push({
                stage: 'type',
                commandId,
                ok: true,
            });
            diagnostics.success = true;
            diagnostics.successCommand = commandId;
            logDiagnosticsIfEnabled(config, diagnostics);
            return diagnostics;
        } catch (error) {
            diagnostics.attempts.push({
                stage: 'type',
                commandId,
                ok: false,
                error: toErrorString(error),
            });
        }
    }

    diagnostics.failureReason = buildFailureReason(text, resolved, diagnostics.attempts);
    logDiagnosticsIfEnabled(config, diagnostics);
    return diagnostics;
}

export async function dispatchChatText(chatText: string): Promise<ChatDispatchResult> {
    const diagnostics = await diagnoseChatDispatch(chatText, 'live');
    return {
        ok: diagnostics.success,
        diagnostics,
    };
}

export function runChatDispatchSelfTest(): { ok: boolean; failures: string[] } {
    return runChatDispatchPlanSelfTest();
}
