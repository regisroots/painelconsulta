const bcrypt = require('bcryptjs');
const { User } = require('../models');
const { logAdminAction, logRevendedorAction } = require('../services/logService');

const getUsers = async (req, res) => {
  try {
    const { page = 1, limit = 10 } = req.query;
    const offset = (page - 1) * limit;

    const users = await User.findAndCountAll({
      attributes: { exclude: ['senha_hash'] },
      limit: parseInt(limit),
      offset: parseInt(offset),
      order: [['data_criacao', 'DESC']],
    });

    res.json({
      users: users.rows,
      total: users.count,
      page: parseInt(page),
      totalPages: Math.ceil(users.count / limit),
    });

  } catch (error) {
    console.error('Erro ao buscar usuários:', error);
    res.status(500).json({ error: 'Erro interno do servidor' });
  }
};

const createUser = async (req, res) => {
  try {
    const { nome, email, senha, tipo = 'usuario', dias_ativos = 0, creditos = 0 } = req.body;

    if (!nome || !email || !senha) {
      return res.status(400).json({ error: 'Nome, email e senha são obrigatórios' });
    }

    if (req.user.tipo === 'revendedor' && tipo === 'admin') {
      return res.status(403).json({ error: 'Revendedor não pode criar admin' });
    }

    const existingUser = await User.findOne({ where: { email } });
    if (existingUser) {
      return res.status(400).json({ error: 'Email já cadastrado' });
    }

    const senha_hash = await bcrypt.hash(senha, 10);

    let data_expiracao = null;
    if (dias_ativos > 0) {
      data_expiracao = new Date();
      data_expiracao.setDate(data_expiracao.getDate() + dias_ativos);
    }

    const user = await User.create({
      nome,
      email,
      senha_hash,
      tipo,
      dias_ativos,
      data_expiracao,
      creditos,
      revendedor_id: req.user.tipo === 'revendedor' ? req.user.id : null,
    });

    const logFunction = req.user.tipo === 'admin' ? logAdminAction : logRevendedorAction;
    await logFunction(req.user.id, 'Usuário criado', { 
      email, 
      tipo, 
      dias_ativos, 
      creditos 
    });

    res.status(201).json({
      message: 'Usuário criado com sucesso',
      user: {
        id: user.id,
        nome: user.nome,
        email: user.email,
        tipo: user.tipo,
        dias_ativos: user.dias_ativos,
        data_expiracao: user.data_expiracao,
        creditos: user.creditos,
      },
    });

  } catch (error) {
    console.error('Erro ao criar usuário:', error);
    res.status(500).json({ error: 'Erro interno do servidor' });
  }
};

const updateUser = async (req, res) => {
  try {
    const { id } = req.params;
    const { nome, email, tipo, dias_ativos, creditos, ativo } = req.body;

    const user = await User.findByPk(id);
    if (!user) {
      return res.status(404).json({ error: 'Usuário não encontrado' });
    }

    if (req.user.tipo === 'revendedor' && (user.tipo === 'admin' || tipo === 'admin')) {
      return res.status(403).json({ error: 'Revendedor não pode modificar admin' });
    }

    if (nome) user.nome = nome;
    if (email) user.email = email;
    if (tipo && req.user.tipo === 'admin') user.tipo = tipo;
    if (typeof ativo === 'boolean') user.ativo = ativo;
    if (creditos !== undefined) user.creditos = creditos;

    if (dias_ativos !== undefined) {
      user.dias_ativos = dias_ativos;
      if (dias_ativos > 0) {
        const data_expiracao = new Date();
        data_expiracao.setDate(data_expiracao.getDate() + dias_ativos);
        user.data_expiracao = data_expiracao;
      } else {
        user.data_expiracao = null;
      }
    }

    await user.save();

    const logFunction = req.user.tipo === 'admin' ? logAdminAction : logRevendedorAction;
    await logFunction(req.user.id, 'Usuário atualizado', { 
      usuario_id: id,
      alteracoes: req.body 
    });

    res.json({
      message: 'Usuário atualizado com sucesso',
      user: {
        id: user.id,
        nome: user.nome,
        email: user.email,
        tipo: user.tipo,
        dias_ativos: user.dias_ativos,
        data_expiracao: user.data_expiracao,
        creditos: user.creditos,
        ativo: user.ativo,
      },
    });

  } catch (error) {
    console.error('Erro ao atualizar usuário:', error);
    res.status(500).json({ error: 'Erro interno do servidor' });
  }
};

const banUser = async (req, res) => {
  try {
    const { id } = req.params;
    const { motivo } = req.body;

    if (!motivo) {
      return res.status(400).json({ error: 'Motivo do banimento é obrigatório' });
    }

    const user = await User.findByPk(id);
    if (!user) {
      return res.status(404).json({ error: 'Usuário não encontrado' });
    }

    if (req.user.tipo === 'revendedor' && user.tipo === 'admin') {
      return res.status(403).json({ error: 'Revendedor não pode banir admin' });
    }

    user.banido = true;
    user.motivo_banimento = motivo;
    user.ativo = false;
    await user.save();

    const logFunction = req.user.tipo === 'admin' ? logAdminAction : logRevendedorAction;
    await logFunction(req.user.id, 'Usuário banido', { 
      usuario_id: id,
      motivo 
    });

    res.json({ message: 'Usuário banido com sucesso' });

  } catch (error) {
    console.error('Erro ao banir usuário:', error);
    res.status(500).json({ error: 'Erro interno do servidor' });
  }
};

module.exports = {
  getUsers,
  createUser,
  updateUser,
  banUser,
};
