const vscode = require('vscode'); // Give my JavaScript access to VS Code. Without this:  vscode.window wouldn't exist. require('vscode') -> VS Code APIs

// JavaScript + Node.js = JavaScript that can work with your computer
const fs = require('fs'); // File System : It allows JavaScript to read/write files. Ex : fs.readFileSync(...) - means "Read this file."  (Read a file , Write a file ,Create a folder ,Check whether a file exists)
const path = require('path'); // helps us construct file paths safely. Ex: path.join(...) - means C:\something\something
const terminals = new Map();
// const { spawn } = require('child_process');  // Pass Data from UI -> JS -> Power shell. Node.js provides an API called: child_process. It allows our JavaScript program to start another program.

function activate(context) {  // I'm ready. Tell me what you want me to do. Extension loaded -> activate() --> register functionality

    const command = vscode.commands.registerCommand( // Register Command. This needs to match the command ID declared in package.json. Button -> Event -> Handler
        'salesforce-toolkit.open',
        function () {
            const commands = loadCommands(context);
            const panel = vscode.window.createWebviewPanel(  // Create a webpage-like panel inside VS Code.
                'salesforceToolkit',  // 'salesforceToolkit', is the internal ID
                'Salesforce Toolkit',  // is the title shown on the tab.
                vscode.ViewColumn.One, // 
                {
                    enableScripts: true
                }  // Allow JavaScript inside our webview. VS Code webviews have scripting disabled by default, so we explicitly enable it because our UI will eventually need JavaScript to respond to radio buttons and the Execute button.
            );

            panel.webview.html = getWebviewContent(commands); // Here's the HTML that I want you to display. Build my UI using these commands.
            
            panel.webview.onDidReceiveMessage(function (message) { // created the complete communication path: DP10 Radio + Execute) ➔ Webview JS (postMessage()) ➔ VS Code Host (onDidReceiveMessage()) ➔ extension.js (Executes code)
                if (message.type === 'execute') {  // Only process messages whose purpose is execute.
                    console.log('Selected command:', message.commandId);

                    const selectedCommand = commands.find(
                        function (command) {
                            return command.id === message.commandId;
                        }
                    );

                    if (!selectedCommand) {
                        vscode.window.showErrorMessage('Command not found.');
                        return;
                    }

                    const scriptPath = path.join(
                        context.extensionPath,
                        selectedCommand.script
                    );

                    console.log('Script selected:',scriptPath);

                    const terminal = vscode.window.createTerminal({  // Create a new integrated terminal.
                        name: `Salesforce Toolkit - ${selectedCommand.label}`,
                        cwd: context.extensionPath     // Start the terminal in our extension's root directory. ex scripts/dp10.ps1
                    });

                    terminals.set(selectedCommand.id,terminal);  // map to recognize which is running 

                    terminal.show();   // terminal visible to user

                    terminal.sendText(`powershell.exe -NoProfile -ExecutionPolicy Bypass -File "${scriptPath}"`);  //powershell.exe -NoProfile -ExecutionPolicy Bypass -File "C:\...\scripts\dp10.ps1"
                }
            });
        }
    );

    context.subscriptions.push(command);
}

function loadCommands(context) {

    const configPath = path.join(
        context.extensionPath,  // Where is my extension installed? - During development, it points to your extension project. Later, when you package it: and someone installs it, it points to the installed extension location.
        '.salesforce-toolkit',
        'commands.json'
    );

    const fileContent = fs.readFileSync(  // Read the file and give me its contents as text. JavaScript initially receives it as text.
        configPath,
        'utf8'
    );

    const config = JSON.parse(fileContent);

    return config.commands; // "Give me only the commands array."
}

function runPowerShell(scriptPath) {

    return new Promise(function (resolve, reject) {  // Think of a Promise as: "This operation will finish later."

        const powershell = spawn(
            'powershell.exe',
            [
                '-NoProfile',
                '-ExecutionPolicy',
                'Bypass',
                '-File',
                scriptPath
            ]
        );   // Concept : powershell.exe -NoProfile -ExecutionPolicy Bypass -File scripts/dp10.ps1. -File means: "The thing I'm giving you is a PowerShell script file.

        powershell.stdout.on('data', function (data) {

            console.log(
                data.toString()
            );

        });

        powershell.stderr.on('data', function (data) {

            console.error(
                data.toString()
            );

        });

        powershell.on('close', function (code) {

            console.log(
                'PowerShell exited with code:',
                code
            );

            if (code === 0) {

                resolve();

            } else {

                reject(
                    new Error(
                        `PowerShell failed with exit code ${code}`
                    )
                );

            }

        });

    });
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

            <div id="commandList"></div>

            <button id="executeButton"> Execute </button>

        </body>

        <script>
            const commands = ${JSON.stringify(commands)};
            const commandList = document.getElementById('commandList');
            // ${} is a placeholder used inside template literals (strings wrapped in backticks '`'). It lets you insert variables, math, or logic directly into a string without using the + sign.
    commands.forEach(function (command, index) {
        const label = document.createElement('label');
        label.innerHTML = ` <input type="radio" name="command" value="${command.id}" ${index === 0 ? 'checked' : ''} > ${command.label} <br> 
                `;

        commandList.appendChild(label);
    });

    const vscode = acquireVsCodeApi(); // This is a VS Code function provided to the webview. It gives your webview a communication channel back to the extension.

    document
        .getElementById('executeButton') // Find the HTML element whose ID is executeButton
        .addEventListener('click', function () {   // When someone clicks this element, run this function.

            const selected = document.querySelector(  // Find the checked radio button whose name is command
                'input[name="command"]:checked'
            );

            vscode.postMessage({ // We're sending an object across the webview boundary. like LWC -> event -> apex , Webview -> postMessage -> Extension
                type: 'execute',
                commandId: selected.value
            });
        });
        </script >

        </html > `
     ;
}

function deactivate() {}

module.exports = {
    activate,
    deactivate
};
