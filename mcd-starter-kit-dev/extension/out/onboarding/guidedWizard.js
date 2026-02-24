"use strict";
var __createBinding = (this && this.__createBinding) || (Object.create ? (function(o, m, k, k2) {
    if (k2 === undefined) k2 = k;
    var desc = Object.getOwnPropertyDescriptor(m, k);
    if (!desc || ("get" in desc ? !m.__esModule : desc.writable || desc.configurable)) {
      desc = { enumerable: true, get: function() { return m[k]; } };
    }
    Object.defineProperty(o, k2, desc);
}) : (function(o, m, k, k2) {
    if (k2 === undefined) k2 = k;
    o[k2] = m[k];
}));
var __setModuleDefault = (this && this.__setModuleDefault) || (Object.create ? (function(o, v) {
    Object.defineProperty(o, "default", { enumerable: true, value: v });
}) : function(o, v) {
    o["default"] = v;
});
var __importStar = (this && this.__importStar) || (function () {
    var ownKeys = function(o) {
        ownKeys = Object.getOwnPropertyNames || function (o) {
            var ar = [];
            for (var k in o) if (Object.prototype.hasOwnProperty.call(o, k)) ar[ar.length] = k;
            return ar;
        };
        return ownKeys(o);
    };
    return function (mod) {
        if (mod && mod.__esModule) return mod;
        var result = {};
        if (mod != null) for (var k = ownKeys(mod), i = 0; i < k.length; i++) if (k[i] !== "default") __createBinding(result, mod, k[i]);
        __setModuleDefault(result, mod);
        return result;
    };
})();
Object.defineProperty(exports, "__esModule", { value: true });
exports.runGuidedWizard = runGuidedWizard;
const vscode = __importStar(require("vscode"));
const initMode_1 = require("./initMode");
async function runGuidedWizard(config) {
    // Helper: Input Box
    const askText = async (title, prompt, placeholder, value) => {
        const result = await vscode.window.showInputBox({ title, prompt, placeHolder: placeholder, value, ignoreFocusOut: true });
        return result !== undefined ? result.trim() : undefined;
    };
    // Helper: Single Choice
    const askPick = async (title, placeHolder, items) => {
        const result = await vscode.window.showQuickPick(items, { title, placeHolder, ignoreFocusOut: true });
        return result;
    };
    // Helper: Multi Choice
    const askMultiPick = async (title, placeHolder, items) => {
        const result = await vscode.window.showQuickPick(items.map(i => ({ label: i })), { title, placeHolder, canPickMany: true, ignoreFocusOut: true });
        return result ? result.map(i => i.label) : undefined;
    };
    const titleBase = 'Strategic Init (SIP-1)';
    // A. Target Users
    const targetUsersOpts = ['Individual consumer', 'Small team (2–10)', 'Org team (10–100)', 'Enterprise', 'Public/no login', 'Other'];
    let targetUsers = await askMultiPick(`${titleBase} 1/18`, '1. Who uses this?', targetUsersOpts);
    if (!targetUsers)
        return undefined;
    if (targetUsers.includes('Other')) {
        const otherStr = await askText(`${titleBase} 1/18`, 'Please specify "Other" target users:');
        if (!otherStr)
            return undefined;
        targetUsers = targetUsers.filter(u => u !== 'Other').concat(otherStr);
    }
    const targetSuccess = await askText(`${titleBase} 2/18`, '2. What does a successful user look like?');
    if (targetSuccess === undefined)
        return undefined;
    // B. Problem Statement
    const probOpts = ['manual work', 'spreadsheets', 'tool switching', 'copying/pasting', 'slow approvals', 'errors/rework', 'other'];
    let problemTypes = await askMultiPick(`${titleBase} 3/18`, '3. What happens today without this?', probOpts);
    if (!problemTypes)
        return undefined;
    const painfulStep = await askText(`${titleBase} 4/18`, '4. What is the most painful step?');
    if (painfulStep === undefined)
        return undefined;
    // C. Core Value Proposition
    const reducesOpts = ['time', 'errors', 'cost', 'cognitive load', 'tool switching', 'other'];
    let reduces = await askMultiPick(`${titleBase} 5/18`, '5. This reduces...', reducesOpts);
    if (!reduces)
        return undefined;
    const increasesOpts = ['speed', 'visibility', 'accuracy', 'automation', 'revenue', 'other'];
    let increases = await askMultiPick(`${titleBase} 6/18`, '6. This increases...', increasesOpts);
    if (!increases)
        return undefined;
    const coreValue = await askText(`${titleBase} 7/18`, '7. One-sentence value statement', 'e.g., A one-click tool that turns profiles into PDFs');
    if (coreValue === undefined)
        return undefined;
    // D. Hard Non-Goals
    const nonGoalOpts = ['payments', 'auth/login', 'multi-user collaboration', 'mobile app', 'analytics/telemetry', 'marketplace/plugins', 'AI features', 'other'];
    let doNotInclude = await askMultiPick(`${titleBase} 8/18`, '8. Do not include in v1', nonGoalOpts);
    if (!doNotInclude)
        return undefined;
    const explicitNonGoal = await askText(`${titleBase} 9/18`, '9. What is explicitly NOT a goal?');
    if (explicitNonGoal === undefined)
        return undefined;
    // E. Key Features
    const targetVersion = await askText(`${titleBase} 10/18`, `10. Current Target Version`, undefined, config.initialVersion);
    if (targetVersion === undefined)
        return undefined;
    const rawFeatures = await askText(`${titleBase} 11/18`, `11. List up to 5 must-have features (comma separated)`);
    if (rawFeatures === undefined)
        return undefined;
    const features = rawFeatures.split(',').map(f => f.trim()).filter(f => f.length > 0).slice(0, 5);
    // F. Success Metric
    const metricOpts = ['shipped to production', 'first real user', 'first paying user', 'replaces an existing tool', 'saves time', 'other'];
    let metricType = await askPick(`${titleBase} 12/18`, '12. What event proves this worked?', metricOpts);
    if (!metricType)
        return undefined;
    const metricTarget = await askText(`${titleBase} 13/18`, '13. Define the metric target');
    if (metricTarget === undefined)
        return undefined;
    const horizonOpts = ['7 days', '30 days', '90 days', '6 months', '12 months'];
    let metricHorizon = await askPick(`${titleBase} 14/18`, '14. Time horizon', horizonOpts);
    if (!metricHorizon)
        return undefined;
    // G. Constraints
    const deployOpts = ['local-only', 'shared hosting', 'VPS', 'cloud', 'other'];
    let deploy = await askPick(`${titleBase} 15/18`, '15. Deployment target', deployOpts);
    if (!deploy)
        return undefined;
    const dataOpts = ['file-based', 'SQLite', 'MySQL', 'Postgres', 'other'];
    let dataStore = await askPick(`${titleBase} 16/18`, '16. Data storage', dataOpts);
    if (!dataStore)
        return undefined;
    const secOpts = ['no telemetry', 'encrypted secrets', 'audit logs', 'role-based permissions', 'other'];
    let security = await askMultiPick(`${titleBase} 17/18`, '17. Security stance', secOpts);
    if (!security)
        return undefined;
    // H. Wrap up
    const openQs = await askText(`${titleBase} 18/18`, '18. Open questions (optional, comma separated)');
    if (openQs === undefined)
        return undefined;
    const qs = openQs.length > 0 ? openQs.split(',').map(q => q.trim()) : [];
    const now = new Date().toISOString();
    const state = {
        schemaVersion: "sip-1",
        createdAt: now,
        updatedAt: now,
        initMode: initMode_1.InitMode.Guided,
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
//# sourceMappingURL=guidedWizard.js.map