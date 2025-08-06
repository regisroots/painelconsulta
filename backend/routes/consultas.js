const express = require('express');
const router = express.Router();
const { authenticateToken, requireRole } = require('../middlewares/auth');
const { 
  realizarConsulta, 
  getConsultas, 
  getConsultaById, 
  getAllConsultas 
} = require('../controllers/consultaController');

router.use(authenticateToken);

router.post('/', realizarConsulta);

router.get('/', getConsultas);

router.get('/admin/all', requireRole(['admin', 'revendedor']), getAllConsultas);

router.get('/:id', getConsultaById);

module.exports = router;
