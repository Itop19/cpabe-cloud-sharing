const express = require('express');
const { listUsers, createUser, updateUser, deleteUser, assignAttributes } = require('../controllers/userController');
const { authenticate } = require('../utils/auth');

const router = express.Router();
router.get('/', authenticate, listUsers);
router.post('/', authenticate, createUser);
router.put('/:id', authenticate, updateUser);
router.delete('/:id', authenticate, deleteUser);
router.post('/:id/attributes', authenticate, assignAttributes);

module.exports = router;
