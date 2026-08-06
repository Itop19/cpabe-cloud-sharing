const express = require('express');
const { upload, uploadFile, listFiles, downloadFile, decryptFileRoute } = require('../controllers/fileController');
const { authenticate } = require('../utils/auth');

const router = express.Router();
router.post('/upload', authenticate, upload.single('file'), uploadFile);
router.get('/', authenticate, listFiles);
router.get('/:id/download', authenticate, downloadFile);
router.post('/decrypt', authenticate, decryptFileRoute);

module.exports = router;
