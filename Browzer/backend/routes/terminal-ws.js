const { spawn } = require('child_process');
const WebSocket = require('ws');

// Start WebSocket Server
const wss = new WebSocket.Server({ noServer: true });

wss.on('connection', (ws) => {
    ws.on('message', (message) => {
        const shell = spawn('bash');  // Or use any shell

        shell.stdout.on('data', (data) => {
            ws.send(data.toString());  // Send shell output back to the client
        });

        shell.stderr.on('data', (data) => {
            ws.send(`Error: ${data}`);
        });

        shell.on('close', (code) => {
            ws.send(`Process closed with code ${code}`);
        });

        shell.stdin.write(message + "\n");  // Send command to shell
    });
});

module.exports = wss;
