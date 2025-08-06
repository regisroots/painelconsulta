const bcrypt = require('bcryptjs');
const jwt = require('jsonwebtoken');
const { User, sequelize } = require('../models');
const { Op } = require('sequelize');
const { logAdminAction, logRevendedorAction, LogService } = require('../services/logService');

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

const login = async (req, res) => {
  const startTime = Date.now();
  req.startTime = startTime;
  
  try {
    const { email, senha } = req.body;

    if (!email || !senha) {
      await LogService.criarLog('error', null, 'Tentativa de login sem email/senha', { email }, req);
      return res.status(400).json({ error: 'Email e senha são obrigatórios' });
    }

    const user = await User.findOne({ where: { email } });
    if (!user) {
      await LogService.criarLog('error', null, 'Tentativa de login com email inexistente', { email }, req);
      return res.status(401).json({ error: 'Credenciais inválidas' });
    }

    if (user.banido) {
      await LogService.criarLog('error', user.id, 'Tentativa de login de usuário banido', { motivo: user.motivo_banimento }, req);
      return res.status(403).json({ 
        error: 'Usuário banido', 
        motivo: user.motivo_banimento 
      });
    }

    if (!user.ativo) {
      await LogService.criarLog('error', user.id, 'Tentativa de login de usuário inativo', null, req);
      return res.status(403).json({ error: 'Usuário inativo' });
    }

    if (user.data_expiracao && new Date() > user.data_expiracao) {
      await LogService.criarLog('error', user.id, 'Tentativa de login de usuário expirado', { data_expiracao: user.data_expiracao }, req);
      return res.status(403).json({ error: 'Usuário expirado' });
    }

    const senhaValida = await bcrypt.compare(senha, user.senha_hash);
    if (!senhaValida) {
      await LogService.criarLog('error', user.id, 'Tentativa de login com senha incorreta', null, req);
      return res.status(401).json({ error: 'Credenciais inválidas' });
    }

    const token = jwt.sign(
      { 
        id: user.id, 
        email: user.email, 
        tipo: user.tipo 
      },
      process.env.JWT_SECRET,
      { expiresIn: '24h' }
    );

    await LogService.criarLog('login', user.id, 'Login realizado com sucesso', null, req);

    res.json({
      message: 'Login realizado com sucesso',
      token,
      user: {
        id: user.id,
        nome: user.nome,
        email: user.email,
        tipo: user.tipo,
        creditos: user.creditos,
        dias_ativos: user.dias_ativos,
        data_expiracao: user.data_expiracao,
      },
    });

  } catch (error) {
    console.error('Erro no login:', error);
    await LogService.criarLog('error', null, 'Erro interno no login', { error: error.message }, req);
    res.status(500).json({ error: 'Erro interno do servidor' });
  }
};

const register = async (req, res) => {
  const startTime = Date.now();
  req.startTime = startTime;
  
  try {
    const { nome, email, senha } = req.body;

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
      tipo: 'usuario',
      dias_ativos: 0,
      creditos: 0,
    });

    await LogService.criarLog('admin_action', user.id, 'Usuário registrado', { email, nome }, req);

    res.status(201).json({
      message: 'Usuário registrado com sucesso',
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

const getUserMetrics = async (req, res) => {
  try {
    const { startDate, endDate, revendedorId } = req.query;
    
    const whereConditions = {};
    if (startDate && endDate) {
      whereConditions.data_criacao = {
        [Op.between]: [new Date(startDate), new Date(endDate)]
      };
    }
    
    if (req.user.tipo === 'revendedor') {
      whereConditions.revendedor_id = req.user.id;
    } else if (revendedorId) {
      whereConditions.revendedor_id = revendedorId;
    }

    const usersByReseller = await User.findAll({
      attributes: [
        'revendedor_id',
        [sequelize.fn('COUNT', sequelize.col('id')), 'total_users'],
        [sequelize.fn('DATE', sequelize.col('data_criacao')), 'creation_date']
      ],
      where: whereConditions,
      include: [{
        model: User,
        as: 'revendedor',
        attributes: ['id', 'nome', 'email'],
        required: false
      }],
      group: ['revendedor_id', 'revendedor.id', 'creation_date'],
      order: [['creation_date', 'DESC']]
    });

    const totalMetrics = await User.findAll({
      attributes: [
        [sequelize.fn('COUNT', sequelize.col('id')), 'total_users'],
        [sequelize.fn('COUNT', sequelize.literal('CASE WHEN ativo = true THEN 1 END')), 'active_users'],
        [sequelize.fn('COUNT', sequelize.literal('CASE WHEN tipo = \'revendedor\' THEN 1 END')), 'total_resellers']
      ],
      where: whereConditions,
      raw: true
    });

    res.json({
      usersByReseller,
      totalMetrics: totalMetrics[0],
      dateRange: { startDate, endDate }
    });

  } catch (error) {
    console.error('Erro ao buscar métricas de usuários:', error);
    res.status(500).json({ error: 'Erro interno do servidor' });
  }
};

const addCredits = async (req, res) => {
  try {
    const { id } = req.params;
    const { amount } = req.body;

    if (!amount || amount <= 0) {
      return res.status(400).json({ error: 'Quantidade de créditos deve ser maior que zero' });
    }

    const user = await User.findByPk(id);
    if (!user) {
      return res.status(404).json({ error: 'Usuário não encontrado' });
    }

    if (req.user.tipo === 'revendedor' && user.tipo === 'admin') {
      return res.status(403).json({ error: 'Revendedor não pode modificar admin' });
    }

    user.creditos += parseInt(amount);
    await user.save();

    const logFunction = req.user.tipo === 'admin' ? logAdminAction : logRevendedorAction;
    await logFunction(req.user.id, 'Créditos adicionados', { 
      usuario_id: id,
      quantidade: amount,
      creditos_final: user.creditos
    });

    res.json({
      message: 'Créditos adicionados com sucesso',
      user: {
        id: user.id,
        nome: user.nome,
        creditos: user.creditos,
      },
    });

  } catch (error) {
    console.error('Erro ao adicionar créditos:', error);
    res.status(500).json({ error: 'Erro interno do servidor' });
  }
};

const removeCredits = async (req, res) => {
  try {
    const { id } = req.params;
    const { amount } = req.body;

    if (!amount || amount <= 0) {
      return res.status(400).json({ error: 'Quantidade de créditos deve ser maior que zero' });
    }

    const user = await User.findByPk(id);
    if (!user) {
      return res.status(404).json({ error: 'Usuário não encontrado' });
    }

    if (req.user.tipo === 'revendedor' && user.tipo === 'admin') {
      return res.status(403).json({ error: 'Revendedor não pode modificar admin' });
    }

    user.creditos = Math.max(0, user.creditos - parseInt(amount));
    await user.save();

    const logFunction = req.user.tipo === 'admin' ? logAdminAction : logRevendedorAction;
    await logFunction(req.user.id, 'Créditos removidos', { 
      usuario_id: id,
      quantidade: amount,
      creditos_final: user.creditos
    });

    res.json({
      message: 'Créditos removidos com sucesso',
      user: {
        id: user.id,
        nome: user.nome,
        creditos: user.creditos,
      },
    });

  } catch (error) {
    console.error('Erro ao remover créditos:', error);
    res.status(500).json({ error: 'Erro interno do servidor' });
  }
};

const addDays = async (req, res) => {
  try {
    const { id } = req.params;
    const { days } = req.body;

    if (!days || days <= 0) {
      return res.status(400).json({ error: 'Quantidade de dias deve ser maior que zero' });
    }

    const user = await User.findByPk(id);
    if (!user) {
      return res.status(404).json({ error: 'Usuário não encontrado' });
    }

    if (req.user.tipo === 'revendedor' && user.tipo === 'admin') {
      return res.status(403).json({ error: 'Revendedor não pode modificar admin' });
    }

    user.dias_ativos += parseInt(days);
    
    if (user.data_expiracao) {
      const currentExpiration = new Date(user.data_expiracao);
      currentExpiration.setDate(currentExpiration.getDate() + parseInt(days));
      user.data_expiracao = currentExpiration;
    } else {
      const newExpiration = new Date();
      newExpiration.setDate(newExpiration.getDate() + parseInt(days));
      user.data_expiracao = newExpiration;
    }

    await user.save();

    const logFunction = req.user.tipo === 'admin' ? logAdminAction : logRevendedorAction;
    await logFunction(req.user.id, 'Dias adicionados', { 
      usuario_id: id,
      quantidade: days,
      dias_ativos_final: user.dias_ativos,
      nova_expiracao: user.data_expiracao
    });

    res.json({
      message: 'Dias adicionados com sucesso',
      user: {
        id: user.id,
        nome: user.nome,
        dias_ativos: user.dias_ativos,
        data_expiracao: user.data_expiracao,
      },
    });

  } catch (error) {
    console.error('Erro ao adicionar dias:', error);
    res.status(500).json({ error: 'Erro interno do servidor' });
  }
};

const removeDays = async (req, res) => {
  try {
    const { id } = req.params;
    const { days } = req.body;

    if (!days || days <= 0) {
      return res.status(400).json({ error: 'Quantidade de dias deve ser maior que zero' });
    }

    const user = await User.findByPk(id);
    if (!user) {
      return res.status(404).json({ error: 'Usuário não encontrado' });
    }

    if (req.user.tipo === 'revendedor' && user.tipo === 'admin') {
      return res.status(403).json({ error: 'Revendedor não pode modificar admin' });
    }

    user.dias_ativos = Math.max(0, user.dias_ativos - parseInt(days));
    
    if (user.data_expiracao) {
      const currentExpiration = new Date(user.data_expiracao);
      currentExpiration.setDate(currentExpiration.getDate() - parseInt(days));
      
      if (currentExpiration <= new Date()) {
        user.data_expiracao = null;
        user.dias_ativos = 0;
      } else {
        user.data_expiracao = currentExpiration;
      }
    }

    await user.save();

    const logFunction = req.user.tipo === 'admin' ? logAdminAction : logRevendedorAction;
    await logFunction(req.user.id, 'Dias removidos', { 
      usuario_id: id,
      quantidade: days,
      dias_ativos_final: user.dias_ativos,
      nova_expiracao: user.data_expiracao
    });

    res.json({
      message: 'Dias removidos com sucesso',
      user: {
        id: user.id,
        nome: user.nome,
        dias_ativos: user.dias_ativos,
        data_expiracao: user.data_expiracao,
      },
    });

  } catch (error) {
    console.error('Erro ao remover dias:', error);
    res.status(500).json({ error: 'Erro interno do servidor' });
  }
};

const addHours = async (req, res) => {
  try {
    const { id } = req.params;
    const { hours } = req.body;

    if (!hours || hours <= 0) {
      return res.status(400).json({ error: 'Quantidade de horas deve ser maior que zero' });
    }

    const user = await User.findByPk(id);
    if (!user) {
      return res.status(404).json({ error: 'Usuário não encontrado' });
    }

    if (req.user.tipo === 'revendedor' && user.tipo === 'admin') {
      return res.status(403).json({ error: 'Revendedor não pode modificar admin' });
    }

    const hoursInDays = parseInt(hours) / 24;
    user.dias_ativos += hoursInDays;
    
    if (user.data_expiracao) {
      const currentExpiration = new Date(user.data_expiracao);
      currentExpiration.setHours(currentExpiration.getHours() + parseInt(hours));
      user.data_expiracao = currentExpiration;
    } else {
      const newExpiration = new Date();
      newExpiration.setHours(newExpiration.getHours() + parseInt(hours));
      user.data_expiracao = newExpiration;
    }

    await user.save();

    const logFunction = req.user.tipo === 'admin' ? logAdminAction : logRevendedorAction;
    await logFunction(req.user.id, 'Horas adicionadas', { 
      usuario_id: id,
      quantidade: hours,
      dias_ativos_final: user.dias_ativos,
      nova_expiracao: user.data_expiracao
    });

    res.json({
      message: 'Horas adicionadas com sucesso',
      user: {
        id: user.id,
        nome: user.nome,
        dias_ativos: user.dias_ativos,
        data_expiracao: user.data_expiracao,
      },
    });

  } catch (error) {
    console.error('Erro ao adicionar horas:', error);
    res.status(500).json({ error: 'Erro interno do servidor' });
  }
};

const changeUserRole = async (req, res) => {
  try {
    const { id } = req.params;
    const { tipo } = req.body;

    if (!tipo || !['admin', 'revendedor', 'usuario'].includes(tipo)) {
      return res.status(400).json({ error: 'Tipo de usuário inválido' });
    }

    if (req.user.tipo !== 'admin') {
      return res.status(403).json({ error: 'Apenas administradores podem alterar roles' });
    }

    const user = await User.findByPk(id);
    if (!user) {
      return res.status(404).json({ error: 'Usuário não encontrado' });
    }

    const oldTipo = user.tipo;
    user.tipo = tipo;
    await user.save();

    await logAdminAction(req.user.id, 'Role alterado', { 
      usuario_id: id,
      role_anterior: oldTipo,
      role_novo: tipo
    });

    res.json({
      message: 'Role alterado com sucesso',
      user: {
        id: user.id,
        nome: user.nome,
        email: user.email,
        tipo: user.tipo,
      },
    });

  } catch (error) {
    console.error('Erro ao alterar role:', error);
    res.status(500).json({ error: 'Erro interno do servidor' });
  }
};

const unbanUser = async (req, res) => {
  try {
    const { id } = req.params;

    const user = await User.findByPk(id);
    if (!user) {
      return res.status(404).json({ error: 'Usuário não encontrado' });
    }

    if (req.user.tipo === 'revendedor' && user.tipo === 'admin') {
      return res.status(403).json({ error: 'Revendedor não pode desbanir admin' });
    }

    user.banido = false;
    user.motivo_banimento = null;
    user.ativo = true;
    await user.save();

    const logFunction = req.user.tipo === 'admin' ? logAdminAction : logRevendedorAction;
    await logFunction(req.user.id, 'Usuário desbanido', { 
      usuario_id: id
    });

    res.json({ message: 'Usuário desbanido com sucesso' });

  } catch (error) {
    console.error('Erro ao desbanir usuário:', error);
    res.status(500).json({ error: 'Erro interno do servidor' });
  }
};

module.exports = {
  getUsers,
  createUser,
  updateUser,
  banUser,
  unbanUser,
  addCredits,
  removeCredits,
  addDays,
  removeDays,
  addHours,
  changeUserRole,
  login,
  register,
  getUserMetrics,
};
