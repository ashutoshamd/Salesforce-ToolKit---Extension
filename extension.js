const vscode = require('vscode');

function activate(context) {

    const command = vscode.commands.registerCommand(
        'salesforce-toolkit.open',
        function () {

            const panel = vscode.window.createWebviewPanel(
                'salesforceToolkit',
                'Salesforce Toolkit',
                vscode.ViewColumn.One,
                {
                    enableScripts: true
                }
            );

            panel.webview.html = getWebviewContent();

        }
    );

    context.subscriptions.push(command);
}

function getWebviewContent() {

    return `
        <!DOCTYPE html>

        <html>

        <head>

            <title>Salesforce Toolkit</title>

        </head>

        <body>

            <h1>Salesforce Toolkit</h1>

            <p>Welcome to Salesforce Toolkit</p>

            <button>
                Execute
            </button>

        </body>

        </html>
    `;
}

function deactivate() {}

module.exports = {
    activate,
    deactivate
};
