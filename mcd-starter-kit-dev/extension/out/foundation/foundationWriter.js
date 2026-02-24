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
exports.writeFoundationJson = writeFoundationJson;
const vscode = __importStar(require("vscode"));
const path = __importStar(require("path"));
const fs = __importStar(require("fs"));
async function writeFoundationJson(root, state) {
    const strategyDir = path.join(root.fsPath, 'referenceDocs', '01_Strategy');
    const foundationPath = path.join(strategyDir, 'foundation.json');
    // Ensure directory exists
    if (!fs.existsSync(strategyDir)) {
        fs.mkdirSync(strategyDir, { recursive: true });
    }
    let finalPath = foundationPath;
    // Handle Collision
    if (fs.existsSync(foundationPath)) {
        const choice = await vscode.window.showWarningMessage('A foundation.json file already exists in 01_Strategy. Do you want to overwrite it, or create a timestamped backup of the new state?', { modal: true }, 'Overwrite (Destructive)', 'Create Timestamped File', 'Abort');
        if (choice === 'Abort' || !choice) {
            return false;
        }
        if (choice === 'Create Timestamped File') {
            const timestamp = new Date().toISOString().replace(/[:.]/g, '-');
            finalPath = path.join(strategyDir, `foundation-${timestamp}.json`);
        }
    }
    const jsonString = JSON.stringify(state, null, 2);
    const encoder = new TextEncoder();
    await vscode.workspace.fs.writeFile(vscode.Uri.file(finalPath), encoder.encode(jsonString));
    return true;
}
//# sourceMappingURL=foundationWriter.js.map