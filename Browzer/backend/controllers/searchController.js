const path = require('path');
const fs = require('fs');

exports.searchFiles = (req, res) => {
    const searchTerm = req.query.query;
    if (!searchTerm) {
        return res.status(400).json({ error: 'No search term provided' });
    }
    try {
        const results = searchFilesRecursively('/', searchTerm);  // Scan the root filesystem
        res.json(results);
    } catch (err) {
        console.error('Search error:', err);
        res.status(500).json({ error: 'Failed to search files' });
    }
};
