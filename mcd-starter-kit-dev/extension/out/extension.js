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
exports.activate = activate;
exports.deactivate = deactivate;
const vscode = __importStar(require("vscode"));
const wizard_1 = require("./wizard");
const scaffolder_1 = require("./scaffolder");
function activate(context) {
    const disposable = vscode.commands.registerCommand('mcd.init', async () => {
        // Determine target workspace folder
        const workspaceFolders = vscode.workspace.workspaceFolders;
        if (!workspaceFolders || workspaceFolders.length === 0) {
            vscode.window.showErrorMessage('MCD Starter Kit: Please open a folder in VS Code before initializing a project.');
            return;
        }
        const root = workspaceFolders[0].uri;
        // Step 1: Run the onboarding wizard to collect project config
        const config = await (0, wizard_1.runWizard)();
        if (!config) {
            // User cancelled at some point
            return;
        }
        // Step 2: Build the scaffold
        await vscode.window.withProgress({
            location: vscode.ProgressLocation.Notification,
            title: `MCD: Initializing ${config.projectName}...`,
            cancellable: false,
        }, async (progress) => {
            progress.report({ message: 'Writing scaffold directories...' });
            await (0, scaffolder_1.buildScaffold)(root, config, context.extensionUri);
            progress.report({ increment: 100, message: 'Done!' });
        });
        vscode.window.showInformationMessage(`✅ MCD project "${config.projectName}" initialized! The Command Deck is starting on port ${config.port}.`);
    });
    context.subscriptions.push(disposable);
    // Show init prompt for workspaces that don't already have an MCD scaffold
    const folders = vscode.workspace.workspaceFolders;
    if (folders && folders.length > 0) {
        const root = folders[0].uri;
        const refDocsUri = vscode.Uri.joinPath(root, 'referenceDocs');
        vscode.workspace.fs.stat(refDocsUri).then(() => {
            // referenceDocs exists — MCD scaffold already present, don't prompt
        }, () => {
            // referenceDocs does not exist — offer initialization
            vscode.window
                .showInformationMessage('Initialize an MCD project in this workspace?', 'Initialize')
                .then((selection) => {
                if (selection === 'Initialize') {
                    vscode.commands.executeCommand('mcd.init');
                }
            });
        });
    }
}
function deactivate() { }
//# sourceMappingURL=extension.js.map