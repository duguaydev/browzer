const express = require('express');
const fs = require('fs');
const path = require('path');
const router = express.Router();

// API route to get file details
router.get('/file-info', (req, res) => {
    const filePath = req.query.path; // Get file path from query parameter

    if (!filePath) {
        return res.status(400).json({ error: 'File path is required' });
    }

    fs.stat(filePath, (err, stats) => {
        if (err) {
            return res.status(500).json({ error: 'Error retrieving file details' });
        }

        const fileDetails = {
            name: path.basename(filePath),
            path: filePath,
            size: stats.size < 1024 * 1024 ? `${(stats.size / 1024).toFixed(2)} KB` : `${(stats.size / (1024 * 1024)).toFixed(2)} MB`,
            creationDate: stats.birthtime,
            lastModified: stats.mtime,
            owner: stats.uid
        };

        res.json(fileDetails);
    });
});

module.exports = router;
