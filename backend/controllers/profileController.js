const bcrypt = require('bcryptjs');
const { User } = require('../models');
const { logAdminAction, logRevendedorAction } = require('../services/logService');

const getProfile = async (req, res) => {
  try {
    const user = await User.findByPk(req.user.id, {
      attributes: { exclude: ['senha_hash'] },
      include: req.user.tipo === 'usuario' ? [{
        model: User,
        as: 'revendedor',
        attributes: ['id', 'nome', 'email', 'whatsapp_contato', 'telegram_contato'],
        required: false,
      }] : [],
    });

    if (!user) {
      return res.status(404).json({ error: 'Usuário não encontrado' });
    }

    res.json({ user });
  } catch (error) {
    console.error('Erro ao buscar perfil:', error);
    res.status(500).json({ error: 'Erro interno do servidor' });
  }
};

const updateProfile = async (req, res) => {
  try {
    const { nome, email, whatsapp_contato, telegram_contato } = req.body;

    const user = await User.findByPk(req.user.id);
    if (!user) {
      return res.status(404).json({ error: 'Usuário não encontrado' });
    }

    if (email && email !== user.email) {
      const existingUser = await User.findOne({ where: { email } });
      if (existingUser) {
        return res.status(400).json({ error: 'Email já cadastrado' });
      }
    }

    if (nome) user.nome = nome;
    if (email) user.email = email;
    
    if (user.tipo === 'revendedor') {
      if (whatsapp_contato !== undefined) user.whatsapp_contato = whatsapp_contato;
      if (telegram_contato !== undefined) user.telegram_contato = telegram_contato;
    }

    await user.save();

    const logFunction = user.tipo === 'admin' ? logAdminAction : logRevendedorAction;
    await logFunction(user.id, 'Perfil atualizado', { 
      alteracoes: req.body 
    });

    res.json({
      message: 'Perfil atualizado com sucesso',
      user: {
        id: user.id,
        nome: user.nome,
        email: user.email,
        tipo: user.tipo,
        whatsapp_contato: user.whatsapp_contato,
        telegram_contato: user.telegram_contato,
      },
    });

  } catch (error) {
    console.error('Erro ao atualizar perfil:', error);
    res.status(500).json({ error: 'Erro interno do servidor' });
  }
};

const changePassword = async (req, res) => {
  try {
    const { senhaAtual, novaSenha } = req.body;

    if (!senhaAtual || !novaSenha) {
      return res.status(400).json({ error: 'Senha atual e nova senha são obrigatórias' });
    }

    const user = await User.findByPk(req.user.id);
    if (!user) {
      return res.status(404).json({ error: 'Usuário não encontrado' });
    }

    const senhaValida = await bcrypt.compare(senhaAtual, user.senha_hash);
    if (!senhaValida) {
      return res.status(400).json({ error: 'Senha atual incorreta' });
    }

    const novaSenhaHash = await bcrypt.hash(novaSenha, 10);
    user.senha_hash = novaSenhaHash;
    await user.save();

    const logFunction = user.tipo === 'admin' ? logAdminAction : logRevendedorAction;
    await logFunction(user.id, 'Senha alterada', {});

    res.json({ message: 'Senha alterada com sucesso' });

  } catch (error) {
    console.error('Erro ao alterar senha:', error);
    res.status(500).json({ error: 'Erro interno do servidor' });
  }
};

module.exports = {
  getProfile,
  updateProfile,
  changePassword,
};
