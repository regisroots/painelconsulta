const { Modulo } = require('../models');
const { logAdminAction } = require('../services/logService');

const getModulos = async (req, res) => {
  try {
    const modulos = await Modulo.findAll({
      order: [['createdAt', 'DESC']],
    });

    res.json({ modulos });

  } catch (error) {
    console.error('Erro ao buscar módulos:', error);
    res.status(500).json({ error: 'Erro interno do servidor' });
  }
};

const getModulosAtivos = async (req, res) => {
  try {
    const modulos = await Modulo.findAll({
      where: { ativo: true },
      order: [['nome', 'ASC']],
    });

    res.json({ modulos });

  } catch (error) {
    console.error('Erro ao buscar módulos ativos:', error);
    res.status(500).json({ error: 'Erro interno do servidor' });
  }
};

const createModulo = async (req, res) => {
  try {
    const { nome, descricao, tipo_limite, preco_por_consulta, api_url, campos_entrada } = req.body;

    if (!nome || !api_url) {
      return res.status(400).json({ error: 'Nome e URL da API são obrigatórios' });
    }

    const modulo = await Modulo.create({
      nome,
      descricao,
      tipo_limite: tipo_limite || 'creditos',
      preco_por_consulta,
      api_url,
      campos_entrada: campos_entrada || [],
    });

    await logAdminAction(req.user.id, 'Módulo criado', { 
      modulo_id: modulo.id,
      nome,
      api_url 
    });

    res.status(201).json({
      message: 'Módulo criado com sucesso',
      modulo,
    });

  } catch (error) {
    console.error('Erro ao criar módulo:', error);
    res.status(500).json({ error: 'Erro interno do servidor' });
  }
};

const updateModulo = async (req, res) => {
  try {
    const { id } = req.params;
    const { nome, descricao, ativo, tipo_limite, preco_por_consulta, api_url, campos_entrada } = req.body;

    const modulo = await Modulo.findByPk(id);
    if (!modulo) {
      return res.status(404).json({ error: 'Módulo não encontrado' });
    }

    if (nome) modulo.nome = nome;
    if (descricao !== undefined) modulo.descricao = descricao;
    if (typeof ativo === 'boolean') modulo.ativo = ativo;
    if (tipo_limite) modulo.tipo_limite = tipo_limite;
    if (preco_por_consulta !== undefined) modulo.preco_por_consulta = preco_por_consulta;
    if (api_url) modulo.api_url = api_url;
    if (campos_entrada) modulo.campos_entrada = campos_entrada;

    await modulo.save();

    await logAdminAction(req.user.id, 'Módulo atualizado', { 
      modulo_id: id,
      alteracoes: req.body 
    });

    res.json({
      message: 'Módulo atualizado com sucesso',
      modulo,
    });

  } catch (error) {
    console.error('Erro ao atualizar módulo:', error);
    res.status(500).json({ error: 'Erro interno do servidor' });
  }
};

const deleteModulo = async (req, res) => {
  try {
    const { id } = req.params;

    const modulo = await Modulo.findByPk(id);
    if (!modulo) {
      return res.status(404).json({ error: 'Módulo não encontrado' });
    }

    await modulo.destroy();

    await logAdminAction(req.user.id, 'Módulo excluído', { 
      modulo_id: id,
      nome: modulo.nome 
    });

    res.json({ message: 'Módulo excluído com sucesso' });

  } catch (error) {
    console.error('Erro ao excluir módulo:', error);
    res.status(500).json({ error: 'Erro interno do servidor' });
  }
};

const updateTimeout = async (req, res) => {
  try {
    const { id } = req.params;
    const { timeout_segundos } = req.body;
    
    if (req.user.tipo !== 'admin') {
      return res.status(403).json({ error: 'Acesso negado' });
    }

    const modulo = await Modulo.findByPk(id);
    if (!modulo) {
      return res.status(404).json({ error: 'Módulo não encontrado' });
    }

    await modulo.update({ timeout_segundos });
    
    await logAdminAction(req.user.id, 'Timeout do módulo atualizado', { 
      modulo_id: id,
      timeout_segundos 
    });

    res.json(modulo);
  } catch (error) {
    console.error('Erro ao atualizar timeout:', error);
    res.status(500).json({ error: 'Erro interno do servidor' });
  }
};

const updateStatus = async (req, res) => {
  try {
    const { id } = req.params;
    const { ativo, manutencao } = req.body;
    
    if (req.user.tipo !== 'admin') {
      return res.status(403).json({ error: 'Acesso negado' });
    }

    const modulo = await Modulo.findByPk(id);
    if (!modulo) {
      return res.status(404).json({ error: 'Módulo não encontrado' });
    }

    const updateData = {};
    if (typeof ativo !== 'undefined') updateData.ativo = ativo;
    if (typeof manutencao !== 'undefined') updateData.manutencao = manutencao;

    await modulo.update(updateData);
    
    await logAdminAction(req.user.id, 'Status do módulo atualizado', { 
      modulo_id: id,
      alteracoes: updateData 
    });

    res.json(modulo);
  } catch (error) {
    console.error('Erro ao atualizar status:', error);
    res.status(500).json({ error: 'Erro interno do servidor' });
  }
};

module.exports = {
  getModulos,
  getModulosAtivos,
  createModulo,
  updateModulo,
  updateTimeout,
  updateStatus,
  deleteModulo,
};
