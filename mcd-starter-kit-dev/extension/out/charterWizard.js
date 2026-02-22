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
exports.runManualPath = runManualPath;
exports.runSourceDocsPath = runSourceDocsPath;
const vscode = __importStar(require("vscode"));
const path = __importStar(require("path"));
const fs = __importStar(require("fs"));
const charter_1 = require("./templates/charter");
const prd_1 = require("./templates/prd");
const charterStub_1 = require("./templates/charterStub");
const prdStub_1 = require("./templates/prdStub");
const scaffolder_1 = require("./scaffolder");
function nowTimestamp() {
    const d = new Date();
    const pad = (n) => String(n).padStart(2, '0');
    return `${d.getFullYear()}${pad(d.getMonth() + 1)}${pad(d.getDate())}${pad(d.getHours())}${pad(d.getMinutes())}`;
}
async function runManualPath(root, config, terminal, data) {
    // ── Write documents ──────────────────────────────────────────────────────
    const timestamp = nowTimestamp();
    const encoder = new TextEncoder();
    const charterData = {
        targetUsers: data.targetUsers,
        problemStatement: data.problemStatement,
        coreValue: data.coreValue,
        nonGoals: data.nonGoals
    };
    const prdData = {
        keyFeatures: data.keyFeatures,
        successMetric: data.successMetric
    };
    await vscode.workspace.fs.writeFile(vscode.Uri.joinPath(root, `referenceDocs/01_Strategy/${timestamp}-PROJECT_CHARTER.md`), encoder.encode((0, charter_1.renderCharter)(config, charterData, timestamp)));
    await vscode.workspace.fs.writeFile(vscode.Uri.joinPath(root, `referenceDocs/01_Strategy/${timestamp}-HIGH_LEVEL_PRD.md`), encoder.encode((0, prd_1.renderPrd)(config, charterData, prdData, timestamp)));
    // ── Stage and commit ─────────────────────────────────────────────────────
    terminal.sendText('git add referenceDocs/01_Strategy/');
    terminal.sendText(`git commit -m "docs(${config.initialVersion}): add Project Charter and High-Level PRD for ${config.codename}"`);
    vscode.window.showInformationMessage(`✅ Project Charter and PRD created in referenceDocs/01_Strategy/ and committed.`);
    const action = await vscode.window.showInformationMessage('MCD has initialized your project! The Command Deck kanban board will now launch in your browser. Return to VS Code when you are ready to manage your work.', { modal: true }, 'Launch Command Deck');
    if (action === 'Launch Command Deck') {
        await (0, scaffolder_1.launchCommandDeck)(root, config);
    }
}
async function runSourceDocsPath(root, config, terminal) {
    // ── Step 1: File picker ──────────────────────────────────────────────────
    const selected = await vscode.window.showOpenDialog({
        canSelectMany: true,
        canSelectFiles: true,
        canSelectFolders: false,
        openLabel: 'Import as source documents',
        filters: {
            'Documents': ['md', 'txt', 'pdf', 'docx'],
            'All Files': ['*'],
        },
    });
    // Graceful fallback: if operator cancels without selecting, return to webview ideally
    // For now, if cancelled, just abort gracefully.
    if (!selected || selected.length === 0) {
        vscode.window.showInformationMessage('Import cancelled.');
        return;
    }
    // ── Step 2: Copy files to helperContext/ ─────────────────────────────────
    const helperContextDir = path.join(root.fsPath, 'referenceDocs', '05_Records', 'documentation', 'helperContext');
    if (!fs.existsSync(helperContextDir)) {
        fs.mkdirSync(helperContextDir, { recursive: true });
    }
    const copiedFileNames = [];
    for (const fileUri of selected) {
        const filename = path.basename(fileUri.fsPath);
        const destPath = path.join(helperContextDir, filename);
        fs.copyFileSync(fileUri.fsPath, destPath);
        copiedFileNames.push(filename);
    }
    // ── Step 3: Write stub Charter ───────────────────────────────────────────
    const timestamp = nowTimestamp();
    const encoder = new TextEncoder();
    await vscode.workspace.fs.writeFile(vscode.Uri.joinPath(root, `referenceDocs/01_Strategy/${timestamp}-PROJECT_CHARTER.md`), encoder.encode((0, charterStub_1.renderCharterStub)(config, copiedFileNames, timestamp)));
    // ── Step 4: Write stub PRD ───────────────────────────────────────────────
    await vscode.workspace.fs.writeFile(vscode.Uri.joinPath(root, `referenceDocs/01_Strategy/${timestamp}-HIGH_LEVEL_PRD.md`), encoder.encode((0, prdStub_1.renderPrdStub)(config, copiedFileNames, timestamp)));
    // ── Step 5: Stage and commit ─────────────────────────────────────────────
    terminal.sendText('git add referenceDocs/');
    terminal.sendText(`git commit -m "docs(${config.initialVersion}): add source documents + Charter/PRD stubs for AI derivation"`);
    // ── Step 6: Product Owner Agent Handoff ──────────────────────────────────
    const charterPath = vscode.Uri.joinPath(root, `referenceDocs/01_Strategy/${timestamp}-PROJECT_CHARTER.md`);
    // Guide user to Charter unconditionally — the embedded agent block handles the rest
    await vscode.window.showTextDocument(await vscode.workspace.openTextDocument(charterPath));
    const action = await vscode.window.showInformationMessage('MCD has initialized your project! The Command Deck kanban board will now launch in your browser. Complete your Strategy Docs with your AI Agent, and return to VS Code when you are ready to manage your work.', { modal: true }, 'Launch Command Deck');
    if (action === 'Launch Command Deck') {
        await (0, scaffolder_1.launchCommandDeck)(root, config);
    }
}
//# sourceMappingURL=charterWizard.js.map