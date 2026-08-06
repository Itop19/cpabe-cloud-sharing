const express = require('express');
const { listPolicies, createPolicy, updatePolicy, deletePolicy } = require('../controllers/policyController');
const { authenticate } = require('../utils/auth');

const router = express.Router();
router.get('/', authenticate, listPolicies);
router.post('/', authenticate, createPolicy);
router.put('/:id', authenticate, updatePolicy);
router.delete('/:id', authenticate, deletePolicy);

module.exports = router;
