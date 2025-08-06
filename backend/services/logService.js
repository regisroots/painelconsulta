const { Log, User } = require('../models');
const { Op } = require('sequelize');

class LogService {
  static async criarLog(tipo, usuarioId, acao, detalhes = null, req = null) {
    try {
      const startTime = req?.startTime || Date.now();
      const duracao = Date.now() - startTime;
      
      const log = await Log.create({
        tipo,
        usuario_id: usuarioId,
        acao,
        detalhes,
        ip_address: req ? this.getClientIP(req) : null,
        user_agent: req ? req.get('User-Agent') : null,
        duracao_ms: duracao,
        data: new Date()
      });
      
      return log;
    } catch (error) {
      console.error('Erro ao criar log:', error);
      throw error;
    }
  }

  static getClientIP(req) {
    return req.ip || 
           req.connection?.remoteAddress || 
           req.socket?.remoteAddress ||
           (req.connection?.socket ? req.connection.socket.remoteAddress : null) ||
           req.headers['x-forwarded-for']?.split(',')[0] ||
           req.headers['x-real-ip'] ||
           'unknown';
  }

  static async buscarLogs(filtros = {}) {
    try {
      const { 
        page = 1, 
        limit = 50, 
        tipo, 
        usuarioId, 
        nomeUsuario,
        dataInicio,
        dataFim,
        acao 
      } = filtros;
      
      const offset = (page - 1) * limit;

      const whereClause = {};
      const includeClause = [{
        model: User,
        attributes: ['id', 'nome', 'email', 'tipo'],
        required: false
      }];

      if (tipo) whereClause.tipo = tipo;
      if (usuarioId) whereClause.usuario_id = usuarioId;
      if (acao) whereClause.acao = { [Op.iLike]: `%${acao}%` };
      
      if (dataInicio || dataFim) {
        whereClause.data = {};
        if (dataInicio) whereClause.data[Op.gte] = new Date(dataInicio);
        if (dataFim) whereClause.data[Op.lte] = new Date(dataFim);
      }

      if (nomeUsuario) {
        includeClause[0].where = {
          nome: { [Op.iLike]: `%${nomeUsuario}%` }
        };
        includeClause[0].required = true;
      }

      const logs = await Log.findAndCountAll({
        where: whereClause,
        include: includeClause,
        order: [['data', 'DESC']],
        limit: parseInt(limit),
        offset: parseInt(offset)
      });

      return {
        logs: logs.rows,
        total: logs.count,
        page: parseInt(page),
        totalPages: Math.ceil(logs.count / limit),
        hasNext: page < Math.ceil(logs.count / limit),
        hasPrev: page > 1
      };
    } catch (error) {
      console.error('Erro ao buscar logs:', error);
      throw error;
    }
  }

  static async buscarLogsUsuario(usuarioId, filtros = {}) {
    try {
      const { 
        page = 1, 
        limit = 20,
        dataInicio,
        dataFim,
        tipo = 'consulta'
      } = filtros;
      
      const offset = (page - 1) * limit;
      const whereClause = { 
        usuario_id: usuarioId,
        tipo: tipo
      };

      if (dataInicio || dataFim) {
        whereClause.data = {};
        if (dataInicio) whereClause.data[Op.gte] = new Date(dataInicio);
        if (dataFim) whereClause.data[Op.lte] = new Date(dataFim);
      }

      const logs = await Log.findAndCountAll({
        where: whereClause,
        order: [['data', 'DESC']],
        limit: parseInt(limit),
        offset: parseInt(offset)
      });

      return {
        logs: logs.rows,
        total: logs.count,
        page: parseInt(page),
        totalPages: Math.ceil(logs.count / limit),
        hasNext: page < Math.ceil(logs.count / limit),
        hasPrev: page > 1
      };
    } catch (error) {
      console.error('Erro ao buscar logs do usuário:', error);
      throw error;
    }
  }
}

const createLog = async (tipo, usuario_id, acao, detalhes = null) => {
  return LogService.criarLog(tipo, usuario_id, acao, detalhes);
};

const logAdminAction = (usuario_id, acao, detalhes) => {
  return createLog('admin_action', usuario_id, acao, detalhes);
};

const logRevendedorAction = (usuario_id, acao, detalhes) => {
  return createLog('revendedor_action', usuario_id, acao, detalhes);
};

const logConsulta = (usuario_id, acao, detalhes) => {
  return createLog('consulta', usuario_id, acao, detalhes);
};

module.exports = {
  LogService,
  createLog,
  logAdminAction,
  logRevendedorAction,
  logConsulta,
};
