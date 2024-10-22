const express = require('express');
const fs = require('fs');
const path = require('path');
const router = express.Router();

// Function to search files in the home directory recursively
function searchFilesRecursively(dir, searchTerm, fileList = []) {
    try {
        const files = fs.readdirSync(dir);
        files.forEach(file => {
            const filePath = path.join(dir, file);
            try {
                const stat = fs.statSync(filePath);
                if (stat.isDirectory()) {
                    searchFilesRecursively(filePath, searchTerm, fileList);  // Recursive search
                } else if (file.toLowerCase().includes(searchTerm.toLowerCase())) {
                    fileList.push(filePath);  // Match found
                }
            } catch (err) {
                console.error(`Error accessing file: ${filePath}`, err);
            }
        });
    } catch (err) {
        console.error(`Error reading directory: ${dir}`, err);
    }
    return fileList;
}

// Search route to handle queries
router.get('/search', (req, res) => {
    const searchTerm = req.query.query || '';  // Capture the search term
    if (!searchTerm) {
        return res.status(400).json({ error: 'No search term provided' });
    }

    const homeDir = path.join(require('os').homedir());  // Point to home directory
    const results = searchFilesRecursively(homeDir, searchTerm);
    res.json(results);
});

module.exports = router;
