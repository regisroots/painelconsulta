const { LogService } = require('../services/logService');

class LogController {
  static async listarLogs(req, res) {
    try {
      const { 
        page, 
        limit, 
        tipo, 
        usuarioId, 
        nomeUsuario,
        dataInicio,
        dataFim,
        acao 
      } = req.query;
      
      const filtros = {
        page: page ? parseInt(page) : 1,
        limit: limit ? parseInt(limit) : 50,
        tipo,
        usuarioId: usuarioId ? parseInt(usuarioId) : undefined,
        nomeUsuario,
        dataInicio,
        dataFim,
        acao
      };

      if (req.user.tipo === 'revendedor') {
        filtros.usuarioId = req.user.id;
      }

      const resultado = await LogService.buscarLogs(filtros);

      res.json({
        success: true,
        data: resultado,
        filtros: filtros
      });
    } catch (error) {
      console.error('Erro ao listar logs:', error);
      res.status(500).json({
        success: false,
        message: 'Erro interno do servidor'
      });
    }
  }

  static async listarLogsUsuario(req, res) {
    try {
      const { page, limit, dataInicio, dataFim, tipo } = req.query;
      const usuarioId = req.user.id;
      
      const filtros = {
        page: page ? parseInt(page) : 1,
        limit: limit ? parseInt(limit) : 20,
        dataInicio,
        dataFim,
        tipo: tipo || 'consulta'
      };

      const resultado = await LogService.buscarLogsUsuario(usuarioId, filtros);

      res.json({
        success: true,
        data: resultado,
        filtros: filtros
      });
    } catch (error) {
      console.error('Erro ao listar logs do usuário:', error);
      res.status(500).json({
        success: false,
        message: 'Erro interno do servidor'
      });
    }
  }

  static async criarLog(req, res) {
    try {
      const { tipo, acao, detalhes } = req.body;
      const usuarioId = req.user?.id;

      const log = await LogService.criarLog(tipo, usuarioId, acao, detalhes, req);

      res.status(201).json({
        success: true,
        data: log
      });
    } catch (error) {
      console.error('Erro ao criar log:', error);
      res.status(500).json({
        success: false,
        message: 'Erro interno do servidor'
      });
    }
  }
}

const getLogs = LogController.listarLogs;

module.exports = {
  LogController,
  getLogs,
};
