import * as vscode from 'vscode';
import { ProjectConfig } from '../wizard';
import { FoundationState } from '../foundation/foundationSchema';
import { InitMode } from './initMode';

export async function runGuidedWizard(config: ProjectConfig): Promise<FoundationState | undefined> {
    // Helper: Input Box
    const askText = async (title: string, prompt: string, placeholder?: string, value?: string): Promise<string | undefined> => {
        const result = await vscode.window.showInputBox({ title, prompt, placeHolder: placeholder, value, ignoreFocusOut: true });
        return result !== undefined ? result.trim() : undefined;
    };

    // Helper: Single Choice
    const askPick = async (title: string, placeHolder: string, items: string[]): Promise<string | undefined> => {
        const result = await vscode.window.showQuickPick(items, { title, placeHolder, ignoreFocusOut: true });
        return result;
    };

    // Helper: Multi Choice
    const askMultiPick = async (title: string, placeHolder: string, items: string[]): Promise<string[] | undefined> => {
        const result = await vscode.window.showQuickPick(items.map(i => ({ label: i })), { title, placeHolder, canPickMany: true, ignoreFocusOut: true });
        return result ? result.map(i => i.label) : undefined;
    };

    const titleBase = 'Strategic Init (SIP-1)';

    // A. Target Users
    const targetUsersOpts = ['Individual consumer', 'Small team (2–10)', 'Org team (10–100)', 'Enterprise', 'Public/no login', 'Other'];
    let targetUsers = await askMultiPick(`${titleBase} 1/18`, '1. Who uses this?', targetUsersOpts);
    if (!targetUsers) return undefined;
    if (targetUsers.includes('Other')) {
        const otherStr = await askText(`${titleBase} 1/18`, 'Please specify "Other" target users:');
        if (!otherStr) return undefined;
        targetUsers = targetUsers.filter(u => u !== 'Other').concat(otherStr);
    }
    const targetSuccess = await askText(`${titleBase} 2/18`, '2. What does a successful user look like?');
    if (targetSuccess === undefined) return undefined;

    // B. Problem Statement
    const probOpts = ['manual work', 'spreadsheets', 'tool switching', 'copying/pasting', 'slow approvals', 'errors/rework', 'other'];
    let problemTypes = await askMultiPick(`${titleBase} 3/18`, '3. What happens today without this?', probOpts);
    if (!problemTypes) return undefined;
    const painfulStep = await askText(`${titleBase} 4/18`, '4. What is the most painful step?');
    if (painfulStep === undefined) return undefined;

    // C. Core Value Proposition
    const reducesOpts = ['time', 'errors', 'cost', 'cognitive load', 'tool switching', 'other'];
    let reduces = await askMultiPick(`${titleBase} 5/18`, '5. This reduces...', reducesOpts);
    if (!reduces) return undefined;
    const increasesOpts = ['speed', 'visibility', 'accuracy', 'automation', 'revenue', 'other'];
    let increases = await askMultiPick(`${titleBase} 6/18`, '6. This increases...', increasesOpts);
    if (!increases) return undefined;
    const coreValue = await askText(`${titleBase} 7/18`, '7. One-sentence value statement', 'e.g., A one-click tool that turns profiles into PDFs');
    if (coreValue === undefined) return undefined;

    // D. Hard Non-Goals
    const nonGoalOpts = ['payments', 'auth/login', 'multi-user collaboration', 'mobile app', 'analytics/telemetry', 'marketplace/plugins', 'AI features', 'other'];
    let doNotInclude = await askMultiPick(`${titleBase} 8/18`, '8. Do not include in v1', nonGoalOpts);
    if (!doNotInclude) return undefined;
    const explicitNonGoal = await askText(`${titleBase} 9/18`, '9. What is explicitly NOT a goal?');
    if (explicitNonGoal === undefined) return undefined;

    // E. Key Features
    const targetVersion = await askText(`${titleBase} 10/18`, `10. Current Target Version`, undefined, config.initialVersion);
    if (targetVersion === undefined) return undefined;
    const rawFeatures = await askText(`${titleBase} 11/18`, `11. List up to 5 must-have features (comma separated)`);
    if (rawFeatures === undefined) return undefined;
    const features = rawFeatures.split(',').map(f => f.trim()).filter(f => f.length > 0).slice(0, 5);

    // F. Success Metric
    const metricOpts = ['shipped to production', 'first real user', 'first paying user', 'replaces an existing tool', 'saves time', 'other'];
    let metricType = await askPick(`${titleBase} 12/18`, '12. What event proves this worked?', metricOpts);
    if (!metricType) return undefined;
    const metricTarget = await askText(`${titleBase} 13/18`, '13. Define the metric target');
    if (metricTarget === undefined) return undefined;
    const horizonOpts = ['7 days', '30 days', '90 days', '6 months', '12 months'];
    let metricHorizon = await askPick(`${titleBase} 14/18`, '14. Time horizon', horizonOpts);
    if (!metricHorizon) return undefined;

    // G. Constraints
    const deployOpts = ['local-only', 'shared hosting', 'VPS', 'cloud', 'other'];
    let deploy = await askPick(`${titleBase} 15/18`, '15. Deployment target', deployOpts);
    if (!deploy) return undefined;
    const dataOpts = ['file-based', 'SQLite', 'MySQL', 'Postgres', 'other'];
    let dataStore = await askPick(`${titleBase} 16/18`, '16. Data storage', dataOpts);
    if (!dataStore) return undefined;
    const secOpts = ['no telemetry', 'encrypted secrets', 'audit logs', 'role-based permissions', 'other'];
    let security = await askMultiPick(`${titleBase} 17/18`, '17. Security stance', secOpts);
    if (!security) return undefined;

    // H. Wrap up
    const openQs = await askText(`${titleBase} 18/18`, '18. Open questions (optional, comma separated)');
    if (openQs === undefined) return undefined;
    const qs = openQs.length > 0 ? openQs.split(',').map(q => q.trim()) : [];

    const now = new Date().toISOString();

    const state: FoundationState = {
        schemaVersion: "sip-1",
        createdAt: now,
        updatedAt: now,
        initMode: InitMode.Guided,
        project: {
            name: config.projectName,
            codename: config.codename,
            version: targetVersion,
            repoType: "new"
        },
        actors: {
            primaryBuilder: "solo",
            roles: ["developer"]
        },
        product: {
            targetUsers: targetUsers.concat(`Success Profile: ${targetSuccess}`),
            problemStatement: `Pain points: ${problemTypes.join(', ')}. Most painful step: ${painfulStep}`,
            coreValueProposition: `Reduces: ${reduces.join(', ')}. Increases: ${increases.join(', ')}. Core: ${coreValue}`,
            hardNonGoals: doNotInclude.concat(`Explicitly explicitly excluded: ${explicitNonGoal}`),
            keyFeatures: features,
            successMetric: {
                type: metricType,
                definition: metricType,
                target: metricTarget,
                timeHorizon: metricHorizon
            }
        },
        constraints: {
            deployment: deploy,
            data: dataStore,
            security: security,
            performance: [],
            outOfScope: [],
            ai: {
                usesAI: false,
                providers: [],
                multiModel: false,
                safetyNotes: []
            }
        },
        notes: {
            openQuestions: qs,
            assumptions: [],
            risks: []
        }
    };

    return state;
}
