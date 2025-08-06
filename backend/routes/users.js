const express = require('express');
const router = express.Router();
const { authenticateToken, requireRole } = require('../middlewares/auth');
const { getUsers, createUser, updateUser, banUser, login, register, getUserMetrics } = require('../controllers/userController');

router.post('/login', login);

router.post('/register', register);

router.use(authenticateToken);

router.get('/metrics', requireRole(['admin', 'revendedor']), getUserMetrics);
router.get('/', requireRole(['admin', 'revendedor']), getUsers);

router.post('/', requireRole(['admin', 'revendedor']), createUser);

router.put('/:id', requireRole(['admin', 'revendedor']), updateUser);

router.post('/:id/ban', requireRole(['admin', 'revendedor']), banUser);

router.put('/:id/plan', requireRole(['admin', 'revendedor']), async (req, res) => {
  try {
    const { id } = req.params;
    const { days, hours } = req.body;
    
    const { User } = require('../models');
    const { logAdminAction, logRevendedorAction } = require('../services/logService');
    
    const user = await User.findByPk(id);
    if (!user) {
      return res.status(404).json({ error: 'Usuário não encontrado' });
    }

    if (req.user.tipo === 'revendedor' && user.tipo === 'admin') {
      return res.status(403).json({ error: 'Revendedor não pode modificar admin' });
    }

    let data_expiracao = user.data_expiracao ? new Date(user.data_expiracao) : new Date();
    
    if (days) {
      data_expiracao.setDate(data_expiracao.getDate() + parseInt(days));
    }
    
    if (hours) {
      data_expiracao.setHours(data_expiracao.getHours() + parseInt(hours));
    }
    
    user.data_expiracao = data_expiracao;
    await user.save();

    const logFunction = req.user.tipo === 'admin' ? logAdminAction : logRevendedorAction;
    await logFunction(req.user.id, 'Plano de usuário atualizado', { 
      usuario_id: id,
      days_added: days,
      hours_added: hours,
      new_expiration: data_expiracao
    });

    res.json({
      message: 'Plano atualizado com sucesso',
      user: {
        id: user.id,
        nome: user.nome,
        data_expiracao: user.data_expiracao
      }
    });

  } catch (error) {
    console.error('Erro ao atualizar plano:', error);
    res.status(500).json({ error: 'Erro interno do servidor' });
  }
});

module.exports = router;
