export type ChatProvider = 'vscode' | 'cursor' | 'windsurf' | 'antigravity' | 'generic';

const DEFAULT_COMMANDS: Record<ChatProvider, string[]> = {
    vscode: [
        'workbench.action.chat.open',
        'workbench.action.quickchat.open',
        'chat.open',
        'chat.new',
        'chat.focus',
        'aichat.open',
        'aichat.newChat',
        'aichat.newchat',
        'composer.openChat',
        'composer.newChat',
        'composer.newAgentChat',
    ],
    cursor: [
        'cursor.composer.newChat',
        'composer.newAgentChat',
        'composer.openChat',
        'composer.newChat',
        'workbench.action.chat.open',
        'workbench.action.quickchat.open',
        'chat.open',
        'chat.new',
        'chat.focus',
    ],
    windsurf: [
        'windsurf.triggerCascade',
        'windsurf.prioritized.command.open',
        'windsurf.openCascadeInNewGroup',
        'windsurf.cascade.openAgentPicker',
        'windsurf.prioritized.chat.toggleWriteChatMode',
    ],
    antigravity: [
        'antigravity.prioritized.command.open',
        'antigravity.openConversationPicker',
        'antigravity.openConversationWorkspaceQuickPick',
        'antigravity.toggleChatFocus',
        'antigravity.prioritized.chat.open',
    ],
    generic: [
        'workbench.action.chat.open',
        'workbench.action.quickchat.open',
        'chat.open',
        'chat.new',
        'chat.focus',
    ],
};

const DISCOVERY_PATTERNS: Record<ChatProvider, RegExp[]> = {
    vscode: [
        /^workbench\.action\.chat\.open$/i,
        /^workbench\.action\.quickchat\.open$/i,
        /^chat\.(open|new|focus)$/i,
        /^aichat\.[\w.-]+$/i,
        /^composer\.(openChat|newChat|newAgentChat)$/i,
    ],
    cursor: [
        /^cursor\.composer\.[\w.-]+$/i,
        /^composer\.(openChat|newChat|newAgentChat)$/i,
        /^workbench\.action\.chat\.open$/i,
        /^workbench\.action\.quickchat\.open$/i,
        /^chat\.(open|new|focus)$/i,
    ],
    windsurf: [
        /^windsurf\.triggerCascade$/i,
        /^windsurf\.prioritized\.command\.open$/i,
        /^windsurf\.openCascadeInNewGroup$/i,
        /^windsurf\.cascade\.openAgentPicker$/i,
        /^windsurf\.prioritized\.chat\.toggleWriteChatMode$/i,
    ],
    antigravity: [
        /^antigravity\.prioritized\.command\.open$/i,
        /^antigravity\.openConversationPicker$/i,
        /^antigravity\.openConversationWorkspaceQuickPick$/i,
        /^antigravity\.toggleChatFocus$/i,
        /^antigravity\.prioritized\.chat\.open$/i,
    ],
    generic: [
        /^workbench\.action\.chat\.open$/i,
        /^workbench\.action\.quickchat\.open$/i,
        /^chat\.(open|new|focus)$/i,
        /^aichat\.[\w.-]+$/i,
        /^composer\.(openChat|newChat|newAgentChat)$/i,
        /^cursor\.composer\.[\w.-]+$/i,
    ],
};

const PREFILL_COMMANDS: Set<string> = new Set([
    'workbench.action.chat.open',
    'workbench.action.quickchat.open',
    'chat.open',
    'chat.new',
]);

export function uniqueCommandList(values: string[]): string[] {
    const seen = new Set<string>();
    const result: string[] = [];
    for (const value of values) {
        const trimmed = value.trim();
        if (!trimmed || seen.has(trimmed)) {
            continue;
        }
        seen.add(trimmed);
        result.push(trimmed);
    }
    return result;
}

export function detectChatProvider(appName: string): ChatProvider {
    const normalized = appName.trim().toLowerCase();
    if (!normalized) {
        return 'generic';
    }
    if (normalized.includes('cursor')) {
        return 'cursor';
    }
    if (normalized.includes('windsurf')) {
        return 'windsurf';
    }
    if (normalized.includes('antigravity')) {
        return 'antigravity';
    }
    if (normalized.includes('visual studio code') || normalized.includes('vscode') || normalized.includes('code')) {
        return 'vscode';
    }
    return 'generic';
}

function discoverProviderCommands(provider: ChatProvider, availableCommands: string[]): string[] {
    const patterns = DISCOVERY_PATTERNS[provider] ?? [];
    return availableCommands.filter((commandId) => patterns.some((pattern) => pattern.test(commandId)));
}

export function resolveDispatchCommands(
    provider: ChatProvider,
    availableCommands: string[],
    overrideCommands: string[]
): { discovered: string[]; resolved: string[] } {
    const available = new Set(availableCommands);
    const discovered = discoverProviderCommands(provider, availableCommands);
    const ordered = uniqueCommandList([
        ...overrideCommands,
        ...DEFAULT_COMMANDS[provider],
        ...discovered,
        ...(provider === 'vscode' || provider === 'cursor' ? [] : DEFAULT_COMMANDS.generic),
    ]);
    const resolved = ordered.filter((commandId) => available.has(commandId));
    return { discovered, resolved };
}

export function isPrefillCommand(commandId: string): boolean {
    return PREFILL_COMMANDS.has(commandId);
}

function assert(condition: boolean, message: string, failures: string[]): void {
    if (!condition) {
        failures.push(message);
    }
}

export function runChatDispatchPlanSelfTest(): { ok: boolean; failures: string[] } {
    const failures: string[] = [];

    assert(detectChatProvider('Cursor') === 'cursor', 'provider detection failed for Cursor', failures);
    assert(detectChatProvider('Windsurf') === 'windsurf', 'provider detection failed for Windsurf', failures);
    assert(detectChatProvider('Antigravity') === 'antigravity', 'provider detection failed for Antigravity', failures);
    assert(
        detectChatProvider('Visual Studio Code') === 'vscode',
        'provider detection failed for Visual Studio Code',
        failures
    );

    const windsurfAvailable = [
        'windsurf.openProfile',
        'windsurf.triggerCascade',
        'windsurf.prioritized.command.open',
        'windsurf.openBillingPage',
    ];
    const windsurfResolved = resolveDispatchCommands('windsurf', windsurfAvailable, []);
    assert(
        windsurfResolved.resolved.includes('windsurf.triggerCascade'),
        'windsurf plan missing triggerCascade',
        failures
    );
    assert(
        !windsurfResolved.resolved.includes('windsurf.openProfile'),
        'windsurf plan should not include unrelated openProfile',
        failures
    );

    const antigravityAvailable = [
        'antigravity.openConversationPicker',
        'antigravity.prioritized.command.open',
        'antigravity.openChangeLog',
    ];
    const antigravityResolved = resolveDispatchCommands('antigravity', antigravityAvailable, []);
    assert(
        antigravityResolved.resolved.includes('antigravity.openConversationPicker'),
        'antigravity plan missing openConversationPicker',
        failures
    );
    assert(
        !antigravityResolved.resolved.includes('antigravity.openChangeLog'),
        'antigravity plan should not include unrelated openChangeLog',
        failures
    );

    assert(isPrefillCommand('workbench.action.chat.open'), 'prefill support missing for workbench.action.chat.open', failures);
    assert(!isPrefillCommand('windsurf.triggerCascade'), 'windsurf.triggerCascade must not be prefill-classified', failures);

    return {
        ok: failures.length === 0,
        failures,
    };
}
