const express = require('express');
const router = express.Router();
const { authenticateToken, requireRole } = require('../middlewares/auth');
const { 
  getModulos, 
  getModulosAtivos, 
  createModulo, 
  updateModulo, 
  updateTimeout,
  updateStatus,
  deleteModulo 
} = require('../controllers/moduloController');

router.use(authenticateToken);

router.get('/ativos', getModulosAtivos);

router.get('/', requireRole(['admin']), getModulos);

router.post('/', requireRole(['admin']), createModulo);

router.put('/:id', requireRole(['admin']), updateModulo);

router.put('/:id/timeout', requireRole(['admin']), updateTimeout);

router.put('/:id/status', requireRole(['admin']), updateStatus);

router.delete('/:id', requireRole(['admin']), deleteModulo);

module.exports = router;
