const { ipcRenderer, contextBridge } = require('electron');
const { exec } = require('child_process');

contextBridge.exposeInMainWorld('electronAPI', {
    runCommand: (command) => ipcRenderer.send('run-command', command),
    onCommandOutput: (callback) => ipcRenderer.on('command-output', (event, output) => callback(output)),
});
