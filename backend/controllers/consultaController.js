const { Consulta, Modulo, User } = require('../models');
const { executarConsulta } = require('../services/consultaService');

const realizarConsulta = async (req, res) => {
  console.log('=== RECEBIDA REQUISICAO DE CONSULTA ===');
  console.log('User ID:', req.user?.id);
  console.log('Body:', req.body);
  
  try {
    const { modulo_id, input } = req.body;

    if (!modulo_id || !input) {
      console.log('ERRO: Dados obrigatorios ausentes');
      return res.status(400).json({ error: 'Módulo e dados de entrada são obrigatórios' });
    }

    const resultado = await executarConsulta(req.user.id, modulo_id, input);

    res.json({
      message: 'Consulta realizada com sucesso',
      consulta_id: resultado.consulta.id,
      status: resultado.status,
      retorno: resultado.retorno,
    });

  } catch (error) {
    console.error('Erro na consulta:', error);
    res.status(400).json({ error: error.message });
  }
};

const getConsultas = async (req, res) => {
  try {
    const { page = 1, limit = 10, modulo_id } = req.query;
    const offset = (page - 1) * limit;

    const whereClause = { usuario_id: req.user.id };
    if (modulo_id) {
      whereClause.modulo_id = modulo_id;
    }

    const consultas = await Consulta.findAndCountAll({
      where: whereClause,
      include: [
        {
          model: Modulo,
          attributes: ['id', 'nome', 'descricao'],
        },
      ],
      limit: parseInt(limit),
      offset: parseInt(offset),
      order: [['data', 'DESC']],
    });

    res.json({
      consultas: consultas.rows,
      total: consultas.count,
      page: parseInt(page),
      totalPages: Math.ceil(consultas.count / limit),
    });

  } catch (error) {
    console.error('Erro ao buscar consultas:', error);
    res.status(500).json({ error: 'Erro interno do servidor' });
  }
};

const getConsultaById = async (req, res) => {
  try {
    const { id } = req.params;

    const consulta = await Consulta.findOne({
      where: { 
        id,
        usuario_id: req.user.id 
      },
      include: [
        {
          model: Modulo,
          attributes: ['id', 'nome', 'descricao'],
        },
      ],
    });

    if (!consulta) {
      return res.status(404).json({ error: 'Consulta não encontrada' });
    }

    res.json({ consulta });

  } catch (error) {
    console.error('Erro ao buscar consulta:', error);
    res.status(500).json({ error: 'Erro interno do servidor' });
  }
};

const getAllConsultas = async (req, res) => {
  try {
    const { page = 1, limit = 10, usuario_id, modulo_id } = req.query;
    const offset = (page - 1) * limit;

    const whereClause = {};
    if (usuario_id) whereClause.usuario_id = usuario_id;
    if (modulo_id) whereClause.modulo_id = modulo_id;

    const consultas = await Consulta.findAndCountAll({
      where: whereClause,
      include: [
        {
          model: User,
          attributes: ['id', 'nome', 'email'],
        },
        {
          model: Modulo,
          attributes: ['id', 'nome', 'descricao'],
        },
      ],
      limit: parseInt(limit),
      offset: parseInt(offset),
      order: [['data', 'DESC']],
    });

    res.json({
      consultas: consultas.rows,
      total: consultas.count,
      page: parseInt(page),
      totalPages: Math.ceil(consultas.count / limit),
    });

  } catch (error) {
    console.error('Erro ao buscar todas as consultas:', error);
    res.status(500).json({ error: 'Erro interno do servidor' });
  }
};

module.exports = {
  realizarConsulta,
  getConsultas,
  getConsultaById,
  getAllConsultas,
};
