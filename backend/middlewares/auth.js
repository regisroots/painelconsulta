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
    console.error('Erro na verificação do token:', error);
    
    let message = 'Token inválido';
    if (error.name === 'TokenExpiredError') {
      message = 'Token expirado';
    } else if (error.name === 'JsonWebTokenError') {
      message = 'Token malformado';
    } else if (error.name === 'NotBeforeError') {
      message = 'Token ainda não é válido';
    }
    
    return res.status(403).json({ 
      error: message,
      errorType: error.name
    });
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
