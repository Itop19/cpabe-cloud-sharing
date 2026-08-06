const express = require('express');
const { listAuditLogs } = require('../controllers/auditController');
const { authenticate } = require('../utils/auth');

const router = express.Router();
router.get('/', authenticate, listAuditLogs);

module.exports = router;
