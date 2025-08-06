const express = require('express');
const router = express.Router();
const { authenticateToken, requireRole } = require('../middlewares/auth');
const { getUsers, createUser, updateUser, banUser, login, register } = require('../controllers/userController');

router.post('/login', login);

router.post('/register', register);

router.use(authenticateToken);

router.get('/', requireRole(['admin', 'revendedor']), getUsers);

router.post('/', requireRole(['admin', 'revendedor']), createUser);

router.put('/:id', requireRole(['admin', 'revendedor']), updateUser);

router.post('/:id/ban', requireRole(['admin', 'revendedor']), banUser);

module.exports = router;
