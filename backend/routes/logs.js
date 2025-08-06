const express = require('express');
const router = express.Router();
const { authenticateToken, requireRole } = require('../middlewares/auth');
const { LogController, getLogs } = require('../controllers/logController');

router.use(authenticateToken);

router.get('/', requireRole(['admin', 'revendedor']), getLogs);

router.get('/meus', LogController.listarLogsUsuario);

router.post('/', LogController.criarLog);

module.exports = router;
