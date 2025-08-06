const { Log } = require('../models');

const createLog = async (tipo, usuario_id, acao, detalhes = null) => {
  try {
    const log = await Log.create({
      tipo,
      usuario_id,
      acao,
      detalhes,
      data: new Date(),
    });
    return log;
  } catch (error) {
    console.error('Erro ao criar log:', error);
  }
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
  createLog,
  logAdminAction,
  logRevendedorAction,
  logConsulta,
};
