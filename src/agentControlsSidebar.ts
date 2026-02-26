import * as vscode from 'vscode';
import { CommandDeckDashboard } from './commandDeckDashboard';
import { ServerController } from './serverController';

export class AgentControlsSidebarProvider implements vscode.WebviewViewProvider {
    public static readonly viewType = 'amphionAgent.controlsView';
    private _view: vscode.WebviewView | undefined;
    private _viewDisposables: vscode.Disposable[] = [];

    constructor(
        private readonly extensionUri: vscode.Uri,
        private readonly serverController: ServerController
    ) {}

    public resolveWebviewView(webviewView: vscode.WebviewView): void {
        this.disposeViewDisposables();
        this._view = webviewView;

        webviewView.webview.options = {
            enableScripts: true,
            localResourceRoots: [vscode.Uri.joinPath(this.extensionUri, 'assets')],
        };
        webviewView.webview.html = CommandDeckDashboard.getHtmlForWebview();
        CommandDeckDashboard.registerMessageHandlers(
            webviewView.webview,
            this._viewDisposables,
            this.serverController
        );

        this._viewDisposables.push(
            webviewView.onDidDispose(() => {
                this._view = undefined;
                this.disposeViewDisposables();
            })
        );
    }

    public async reveal(): Promise<void> {
        await vscode.commands.executeCommand('workbench.view.extension.amphionAgent');
        if (this._view) {
            this._view.show(false);
            return;
        }
        await vscode.commands.executeCommand(`${AgentControlsSidebarProvider.viewType}.focus`);
    }

    private disposeViewDisposables(): void {
        while (this._viewDisposables.length > 0) {
            const disposable = this._viewDisposables.pop();
            disposable?.dispose();
        }
    }
}

