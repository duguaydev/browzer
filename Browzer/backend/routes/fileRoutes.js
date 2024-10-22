const express = require('express');
const router = express.Router();
const fileController = require('../controllers/fileController');
const searchController = require('../controllers/searchController');

// Route to get file data
router.get('/', fileController.getFiles);

module.exports = router;

// Route for searching files
router.get('/search', searchController.searchFiles);

module.exports = router;