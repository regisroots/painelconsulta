const express = require('express');
const router = express.Router();
const { authenticateToken, requireRole } = require('../middlewares/auth');
const { getLogs } = require('../controllers/logController');

router.use(authenticateToken);

router.get('/', requireRole(['admin', 'revendedor']), getLogs);

module.exports = router;
