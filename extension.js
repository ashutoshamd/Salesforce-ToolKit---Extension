const vscode = require('vscode'); // Give my JavaScript access to VS Code. Without this:  vscode.window wouldn't exist. require('vscode') -> VS Code APIs

function activate(context) {  // I'm ready. Tell me what you want me to do. Extension loaded -> activate() --> register functionality

    const command = vscode.commands.registerCommand( // Register Command. This needs to match the command ID declared in package.json. Button -> Event -> Handler
        'salesforce-toolkit.open',
        function () {

            const panel = vscode.window.createWebviewPanel(  // Create a webpage-like panel inside VS Code.
                'salesforceToolkit',  // 'salesforceToolkit', is the internal ID
                'Salesforce Toolkit',  // is the title shown on the tab.
                vscode.ViewColumn.One, // 
                {
                    enableScripts: true
                }  // Allow JavaScript inside our webview. VS Code webviews have scripting disabled by default, so we explicitly enable it because our UI will eventually need JavaScript to respond to radio buttons and the Execute button.
            );

            panel.webview.html = getWebviewContent(); // Here's the HTML that I want you to display.

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
