const bcrypt = require('bcryptjs');
const { User } = require('../models');
const { generateToken } = require('../utils/jwt');
const { logAdminAction } = require('../services/logService');

const login = async (req, res) => {
  try {
    const { email, senha } = req.body;

    if (!email || !senha) {
      return res.status(400).json({ error: 'Email e senha são obrigatórios' });
    }

    const user = await User.findOne({ where: { email } });

    if (!user) {
      return res.status(401).json({ error: 'Credenciais inválidas' });
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
      const revendedor = await User.findByPk(user.revendedor_id, {
        attributes: ['id', 'nome', 'email', 'whatsapp_contato', 'telegram_contato']
      });
      
      return res.status(401).json({ 
        error: 'Conta expirada',
        expired: true,
        revendedor: revendedor || null
      });
    }

    const senhaValida = await bcrypt.compare(senha, user.senha_hash);

    if (!senhaValida) {
      return res.status(401).json({ error: 'Credenciais inválidas' });
    }

    const token = generateToken({ 
      id: user.id, 
      email: user.email, 
      tipo: user.tipo 
    });

    await logAdminAction(user.id, 'Login', { email });

    res.json({
      token,
      user: {
        id: user.id,
        nome: user.nome,
        email: user.email,
        tipo: user.tipo,
        creditos: user.creditos,
        data_expiracao: user.data_expiracao,
        modulos: user.modulos,
      },
    });

  } catch (error) {
    console.error('Erro no login:', error);
    res.status(500).json({ error: 'Erro interno do servidor' });
  }
};

const register = async (req, res) => {
  try {
    const { nome, email, senha, tipo = 'usuario' } = req.body;

    if (!nome || !email || !senha) {
      return res.status(400).json({ error: 'Nome, email e senha são obrigatórios' });
    }

    const existingUser = await User.findOne({ where: { email } });
    if (existingUser) {
      return res.status(400).json({ error: 'Email já cadastrado' });
    }

    const senha_hash = await bcrypt.hash(senha, 10);

    const user = await User.create({
      nome,
      email,
      senha_hash,
      tipo,
    });

    await logAdminAction(user.id, 'Usuário criado', { email, tipo });

    res.status(201).json({
      message: 'Usuário criado com sucesso',
      user: {
        id: user.id,
        nome: user.nome,
        email: user.email,
        tipo: user.tipo,
      },
    });

  } catch (error) {
    console.error('Erro no registro:', error);
    res.status(500).json({ error: 'Erro interno do servidor' });
  }
};

module.exports = {
  login,
  register,
};
