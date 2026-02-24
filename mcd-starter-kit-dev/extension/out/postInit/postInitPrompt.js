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
exports.promptPostInitReview = promptPostInitReview;
const vscode = __importStar(require("vscode"));
const scaffolder_1 = require("../scaffolder");
async function promptPostInitReview(root, config) {
    const choice = await vscode.window.showInformationMessage('Do you want to review your Charter, PRD, and initial architecture now?', { modal: true }, 'Yes', 'No');
    if (choice === 'Yes') {
        const reviewChoice = await vscode.window.showQuickPick(['Review Charter', 'Review PRD', 'Review Architecture'], { title: 'Select Artifact to Review', ignoreFocusOut: true });
        let targetPattern = '';
        if (reviewChoice === 'Review Charter')
            targetPattern = '*PROJECT_CHARTER.md';
        else if (reviewChoice === 'Review PRD')
            targetPattern = '*HIGH_LEVEL_PRD.md';
        else if (reviewChoice === 'Review Architecture')
            targetPattern = '*SYSTEM_ARCHITECTURE.md';
        if (targetPattern) {
            const files = await vscode.workspace.findFiles(`referenceDocs/01_Strategy/${targetPattern}`);
            if (files.length > 0) {
                // Open the newest one if multiple exist
                const sortedFiles = files.sort((a, b) => b.fsPath.localeCompare(a.fsPath));
                await vscode.window.showTextDocument(await vscode.workspace.openTextDocument(sortedFiles[0]), {
                    viewColumn: vscode.ViewColumn.Beside,
                    preserveFocus: true,
                    preview: false
                });
            }
            else {
                vscode.window.showInformationMessage('Artifact not found.');
            }
        }
    }
    else {
        const nextAction = await vscode.window.showQuickPick(['Define MVP milestone plan', 'Build initial contracts', 'Generate board/cards'], { title: 'What do you want to work on first?', ignoreFocusOut: true });
        if (nextAction === 'Generate board/cards') {
            vscode.window.showInformationMessage('Launch the Command Deck to begin board generation.');
        }
        else {
            vscode.window.showInformationMessage(`Agent context loaded for: ${nextAction}`);
        }
    }
    // After review decision, automatically launch the command deck if not already prompted
    const launchChoice = await vscode.window.showInformationMessage('Launch Command Deck to view your Kanban board?', 'Launch Command Deck');
    if (launchChoice === 'Launch Command Deck') {
        await (0, scaffolder_1.launchCommandDeck)(root, config);
    }
}
//# sourceMappingURL=postInitPrompt.js.map