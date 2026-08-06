const express = require('express');
const { listAttributes, createAttribute, updateAttribute, deleteAttribute } = require('../controllers/attributeController');
const { authenticate } = require('../utils/auth');

const router = express.Router();
router.get('/', authenticate, listAttributes);
router.post('/', authenticate, createAttribute);
router.put('/:id', authenticate, updateAttribute);
router.delete('/:id', authenticate, deleteAttribute);

module.exports = router;
