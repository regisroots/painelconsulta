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

router.use((req, res, next) => {
  console.log('=== MIDDLEWARE CONSULTAS ROUTE ===');
  console.log('Method:', req.method);
  console.log('URL:', req.url);
  console.log('Body:', JSON.stringify(req.body, null, 2));
  console.log('Headers:', JSON.stringify(req.headers, null, 2));
  console.log('=== FIM MIDDLEWARE CONSULTAS ===');
  next();
});

router.post('/', realizarConsulta);

router.get('/', getConsultas);

router.get('/admin/all', requireRole(['admin', 'revendedor']), getAllConsultas);

router.get('/meu-historico', getConsultas);

router.get('/:id', getConsultaById);

module.exports = router;
