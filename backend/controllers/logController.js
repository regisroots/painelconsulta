const { Log, User } = require('../models');

const getLogs = async (req, res) => {
  try {
    const { page = 1, limit = 10, tipo, usuario_id } = req.query;
    const offset = (page - 1) * limit;

    const whereClause = {};
    if (tipo) whereClause.tipo = tipo;
    if (usuario_id) whereClause.usuario_id = usuario_id;

    if (req.user.tipo === 'revendedor') {
      whereClause.usuario_id = req.user.id;
    }

    const logs = await Log.findAndCountAll({
      where: whereClause,
      include: [
        {
          model: User,
          attributes: ['id', 'nome', 'email'],
          required: false,
        },
      ],
      limit: parseInt(limit),
      offset: parseInt(offset),
      order: [['data', 'DESC']],
    });

    res.json({
      logs: logs.rows,
      total: logs.count,
      page: parseInt(page),
      totalPages: Math.ceil(logs.count / limit),
    });

  } catch (error) {
    console.error('Erro ao buscar logs:', error);
    res.status(500).json({ error: 'Erro interno do servidor' });
  }
};

module.exports = {
  getLogs,
};
