const { app, BrowserWindow, ipcMain } = require('electron');
const { exec } = require('child_process');
const path = require('path');

const preloadPath = 'Browzer/frontend/preload.js';

function createWindow() {
    const mainWindow = new BrowserWindow({
        width: 1800,
        height: 900,
        webPreferences: {
            preload: preloadPath, // Use path.join to ensure the correct absolute path
            nodeIntegration: true,  // Allow Node.js integration
            contextIsolation: false, 
            enableRemoteModule: true,  // Enable remote module for Node.js features
            sandbox: false  // Disable sandboxing
        },
    });

    mainWindow.loadURL(`http://localhost:3000/`);

    // Now, properly reference the `mainWindow` to open DevTools
    mainWindow.webContents.openDevTools();
}

app.whenReady().then(() => {
    createWindow();

    app.on('activate', function () {
        if (BrowserWindow.getAllWindows().length === 0) createWindow();
    });
});

app.on('window-all-closed', function () {
    if (process.platform !== 'darwin') app.quit();
});
