const { app, BrowserWindow, ipcMain } = require('electron');
const { exec } = require('child_process');

function createWindow() {
    const win = new BrowserWindow({
        width: 1800,
        height: 900,
        frame: false, // Optional: no window borders
        webPreferences: {
            preload: 'preload.js', // Allow secure IPC
            nodeIntegration: true,
            contextIsolation: false, // Required for Node.js integration in Electron v12+
        },
    });

    win.loadFile('Browzer/frontend/index.html');

    win.webContents.openDevTools();
}

// Handle terminal commands
ipcMain.on('run-command', (event, command) => {
    exec(command, (error, stdout, stderr) => {
        if (error) {
            event.reply('command-output', `Error: ${error.message}`);
            return;
        }
        if (stderr) {
            event.reply('command-output', `Error: ${stderr}`);
            return;
        }
        event.reply('command-output', stdout); // Send output back to frontend
    });
});

app.whenReady().then(createWindow);

app.on('window-all-closed', () => {
    if (process.platform !== 'darwin') {
        app.quit();
    }
});

app.on('activate', () => {
    if (BrowserWindow.getAllWindows().length === 0) {
        createWindow();
    }
});
