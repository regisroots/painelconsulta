const { User, Consulta, Modulo } = require('../models');
const { Op } = require('sequelize');

const getAdminStats = async (req, res) => {
  try {
    const totalUsers = await User.count();
    
    const activeUsers = await User.count({
      where: {
        [Op.or]: [
          { data_expiracao: { [Op.gt]: new Date() } },
          { data_expiracao: null }
        ],
        status: 'ativo'
      }
    });

    const totalConsultations = await Consulta.count();

    const totalRevenue = await User.sum('creditos') || 0;

    res.json({
      totalUsers,
      activeUsers,
      totalConsultations,
      totalRevenue
    });
  } catch (error) {
    console.error('Erro ao buscar estatísticas:', error);
    res.status(500).json({ error: 'Erro interno do servidor' });
  }
};

module.exports = {
  getAdminStats
};
