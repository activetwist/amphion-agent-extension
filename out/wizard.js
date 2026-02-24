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
exports.runWizard = runWizard;
const vscode = __importStar(require("vscode"));
async function runWizard() {
    // Step 1: Project Name
    const projectName = await vscode.window.showInputBox({
        title: 'AmphionAgent (1/5)',
        prompt: 'Enter the Project Name',
        placeHolder: 'e.g. Acme Platform',
        ignoreFocusOut: true,
        validateInput: (value) => {
            return value && value.trim().length > 0 ? null : 'Project name is required.';
        },
    });
    if (!projectName)
        return undefined;
    // Step 2: Codename
    const codename = await vscode.window.showInputBox({
        title: 'AmphionAgent (2/4)',
        prompt: 'Enter the Project Codename',
        placeHolder: 'e.g. Genesis',
        ignoreFocusOut: true,
        validateInput: (value) => {
            return value && value.trim().length > 0 ? null : 'Codename is required.';
        },
    });
    if (!codename)
        return undefined;
    // Step 3: Initial Version
    const initialVersion = await vscode.window.showInputBox({
        title: 'AmphionAgent (3/4)',
        prompt: 'Enter the Initial Version',
        value: 'v0.01a',
        ignoreFocusOut: true,
        validateInput: (value) => {
            return value && value.trim().length > 0 ? null : 'Version is required.';
        },
    });
    if (!initialVersion)
        return undefined;
    // Step 4: Port
    const port = await vscode.window.showInputBox({
        title: 'AmphionAgent (4/4)',
        prompt: 'Enter the Command Deck Port (must not be in use)',
        value: '8765',
        ignoreFocusOut: true,
        validateInput: (value) => {
            const num = parseInt(value, 10);
            if (isNaN(num) || num < 1024 || num > 65535) {
                return 'Please enter a valid port number between 1024 and 65535.';
            }
            return null;
        },
    });
    if (!port)
        return undefined;
    return {
        projectName: projectName.trim(),
        serverLang: 'python',
        codename: codename.trim(),
        initialVersion: initialVersion.trim(),
        port: port.trim(),
    };
}
//# sourceMappingURL=wizard.js.map