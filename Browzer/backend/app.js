require('dotenv').config();  // Load environment variables from .env file
const express = require('express');
const os = require('os');
const path = require('path');
const fs = require('fs');
const app = express();

// Load Browser Server Variables
const browserHost = process.env.BROWSER_HOST || 'localhost';
const browserPort = process.env.BROWSER_PORT || 3000;
const browserApiKey = process.env.BROWSER_API_KEY;
const browserBasePath = process.env.BROWSER_BASE_PATH || '/';
const browserSslEnabled = process.env.BROWSER_SSL_ENABLED === 'true';

// Middleware
app.use(express.static(path.join(__dirname, '../frontend')));

// Helper function to get files and directories recursively
function getFilesRecursively(dirPath) {
    let files = [];
    
    try {
        files = fs.readdirSync(dirPath).map(file => {
            const filePath = path.join(dirPath, file);
            let stats;

            try {
                stats = fs.statSync(filePath);  // Check file/directory stats
            } catch (err) {
                console.error(`Error accessing ${filePath}:`, err.message);
                return null;  // Skip inaccessible files or directories
            }

            const fileObj = {
                name: file,
                isDirectory: stats.isDirectory(),
                path: filePath,
                children: []
            };

            if (stats.isDirectory()) {
                fileObj.children = getFilesRecursively(filePath);  // Recurse into subdirectory
            }

            return fileObj;
        });
    } catch (err) {
        console.error(`Error reading directory ${dirPath}:`, err.message);  // Handle directory read errors
    }

    return files.filter(f => f !== null);  // Filter out null entries from inaccessible files/directories
}

// API to fetch files and directories dynamically
app.get('/api/files', (req, res) => {
    const dirPath = req.query.path || path.join(os.homedir());  // Point to the home directory
    console.log('Fetching directory:', dirPath);
    try {
        const files = getFilesRecursively(dirPath);
        res.json(files);
    } catch (err) {
        console.error('Error reading directory:', err);
        res.status(500).json({ error: 'Error reading directory' });
    }
});

// API for system status
app.get('/api/system-status', (req, res) => {
    const cpuUsage = os.loadavg();
    const freeMemory = os.freemem();
    const totalMemory = os.totalmem();
    res.json({ cpuUsage, freeMemory, totalMemory });
});

// API for file content
app.get('/api/file-content', (req, res) => {
    const filePath = req.query.path;
    const extension = path.extname(filePath).toLowerCase();

    // Check if the file is a PDF
    if (extension === '.pdf') {
        res.sendFile(path.resolve(filePath), (err) => {
            if (err) {
                console.error(`Error sending PDF file: ${err.message}`);
                res.status(500).send('Error serving PDF');
            }
        });
    } else {
        // Handle non-PDF files
        fs.readFile(filePath, 'utf8', (err, data) => {
            if (err) return res.status(500).send('File not found');
            res.send(data);
        });
    }
});

// Example API to expose browser server configuration
app.get('/api/browser-config', (req, res) => {
    res.json({
        host: browserHost,
        port: browserPort,
        sslEnabled: browserSslEnabled,
        apiKey: browserApiKey,
        basePath: browserBasePath
    });
});

const fileInfoRoutes = require('./routes/file-info');
app.use('/api', fileInfoRoutes);

const searchRoutes = require('./routes/searchRoutes');
app.use('/api', searchRoutes);

// Start the server
const PORT = process.env.PORT || 3000;
app.listen(PORT, () => console.log(`Server running on port ${PORT}`));
