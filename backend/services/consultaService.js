const axios = require('axios');
const { Consulta, Modulo, User } = require('../models');
const { logConsulta } = require('./logService');

const executarConsulta = async (usuario_id, modulo_id, input) => {
  console.log('=== INICIANDO EXECUCAO DE CONSULTA ===');
  console.log('Usuario ID:', usuario_id);
  console.log('Modulo ID:', modulo_id);
  console.log('Input:', input);
  
  const transaction = await require('../models').sequelize.transaction();

  try {
    const user = await User.findByPk(usuario_id, {
      transaction,
    });
    console.log('Usuario encontrado:', user ? user.nome : 'NAO ENCONTRADO');

    const modulo = await Modulo.findByPk(modulo_id, {
      transaction,
    });
    console.log('Modulo encontrado:', modulo ? modulo.nome : 'NAO ENCONTRADO');

    if (!modulo || !modulo.ativo) {
      throw new Error('Módulo não encontrado ou inativo');
    }

    const moduloConfig = user.modulos[modulo_id] || { limite: 0, usado: 0 };
    
    if (modulo.tipo_limite === 'creditos') {
      if (user.creditos <= 0) {
        throw new Error('Créditos insuficientes');
      }
    } else if (modulo.tipo_limite === 'quantidade') {
      if (moduloConfig.usado >= moduloConfig.limite) {
        throw new Error('Limite de consultas excedido para este módulo');
      }
    }

    let retorno_resumido = null;
    let status = 'falha';

    try {
      let apiUrl = modulo.api_url;
      
      Object.keys(input).forEach(key => {
        apiUrl = apiUrl.replace(`{${key}}`, encodeURIComponent(input[key]));
      });

      console.log('Fazendo requisição para:', apiUrl);

      let response;
      
      if (apiUrl.includes('localhost:3000/api/local-test/')) {
        console.log('Detectada API local, fazendo chamada direta');
        
        response = await axios.get(apiUrl, {
          timeout: (modulo.timeout_segundos || 30) * 1000,
        });
      } else {
        response = await axios.get(apiUrl, {
          timeout: (modulo.timeout_segundos || 30) * 1000,
        });
      }

      const filteredData = { ...response.data };
      delete filteredData.success;
      delete filteredData.query;
      delete filteredData.query_id;

      retorno_resumido = filteredData;
      status = 'sucesso';

      if (modulo.tipo_limite === 'creditos') {
        user.creditos -= 1;
      }

      const novosModulos = { ...user.modulos };
      if (!novosModulos[modulo_id]) {
        novosModulos[modulo_id] = { limite: 0, usado: 0 };
      }
      console.log('Modulos antes da atualizacao:', user.modulos);
      console.log('Incrementando uso do modulo:', modulo_id);
      novosModulos[modulo_id].usado += 1;
      user.modulos = novosModulos;
      console.log('Modulos apos atualizacao:', user.modulos);

      await user.save({ transaction });
      console.log('Usuario salvo no banco de dados');

    } catch (apiError) {
      console.error('Erro na API externa:', apiError.message);
      retorno_resumido = { erro: 'Erro ao consultar API externa' };
    }

    const consulta = await Consulta.create({
      modulo_id,
      usuario_id,
      input,
      retorno_resumido,
      status,
    }, { transaction });

    console.log('=== FAZENDO COMMIT DA TRANSACAO ===');
    await transaction.commit();
    console.log('=== TRANSACAO COMMITADA COM SUCESSO ===');

    await logConsulta(usuario_id, `Consulta ${modulo.nome}`, {
      modulo_id,
      input,
      status,
    });

    return {
      consulta,
      retorno: retorno_resumido,
      status,
    };

  } catch (error) {
    await transaction.rollback();
    
    await logConsulta(usuario_id, `Erro na consulta`, {
      modulo_id,
      erro: error.message,
    });

    throw error;
  }
};

module.exports = {
  executarConsulta,
};
