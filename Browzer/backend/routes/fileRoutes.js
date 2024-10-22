const express = require('express');
const router = express.Router();
const fileController = require('../controllers/fileController');

// Route to get file data
router.get('/', fileController.getFiles);

module.exports = router;
