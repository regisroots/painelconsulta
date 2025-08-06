const { verifyToken } = require('../utils/jwt');
const { User } = require('../models');

const authenticateToken = async (req, res, next) => {
  const authHeader = req.headers['authorization'];
  const token = authHeader && authHeader.split(' ')[1];

  if (!token) {
    return res.status(401).json({ error: 'Token de acesso requerido' });
  }

  try {
    const decoded = verifyToken(token);
    const user = await User.findByPk(decoded.id);

    if (!user) {
      return res.status(401).json({ error: 'Usuário não encontrado' });
    }

    if (!user.ativo) {
      return res.status(401).json({ error: 'Usuário inativo' });
    }

    if (user.banido) {
      return res.status(403).json({ 
        error: 'Usuário banido',
        motivo: user.motivo_banimento 
      });
    }

    if (user.data_expiracao && new Date() > user.data_expiracao) {
      return res.status(401).json({ error: 'Conta expirada' });
    }

    req.user = user;
    next();
  } catch (error) {
    return res.status(403).json({ error: 'Token inválido' });
  }
};

const requireRole = (roles) => {
  return (req, res, next) => {
    if (!req.user) {
      return res.status(401).json({ error: 'Usuário não autenticado' });
    }

    if (!roles.includes(req.user.tipo)) {
      return res.status(403).json({ error: 'Acesso negado' });
    }

    next();
  };
};

module.exports = {
  authenticateToken,
  requireRole,
};
