const axios = require('axios');
const { Consulta, Modulo, User } = require('../models');
const { logConsulta } = require('./logService');

const executarConsulta = async (usuario_id, modulo_id, input) => {
  const transaction = await require('../models').sequelize.transaction();

  try {
    const user = await User.findByPk(usuario_id, {
      transaction,
    });

    const modulo = await Modulo.findByPk(modulo_id, {
      transaction,
    });

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

      console.log('=== INICIANDO DEDUCAO DE LIMITES ===');
      console.log('Tipo de limite do modulo:', modulo.tipo_limite);
      console.log('Modulo ID:', modulo_id);
      console.log('Usuario ID:', usuario_id);
      console.log('Modulos do usuario ANTES:', JSON.stringify(user.modulos, null, 2));
      console.log('Modulo tipo_limite:', modulo.tipo_limite);

      if (modulo.tipo_limite === 'creditos') {
        console.log('Debitando 1 credito. Creditos antes:', user.creditos);
        user.creditos -= 1;
        console.log('Creditos depois:', user.creditos);
      } else if (modulo.tipo_limite === 'quantidade') {
        console.log('=== PROCESSANDO MODULO TIPO QUANTIDADE ===');
        const novosModulos = { ...user.modulos };
        if (!novosModulos[modulo_id]) {
          console.log('Modulo nao encontrado nos modulos do usuario, criando entrada');
          novosModulos[modulo_id] = { limite: 0, usado: 0 };
        }
        
        console.log('Usado ANTES:', novosModulos[modulo_id].usado);
        novosModulos[modulo_id].usado += 1;
        console.log('Usado DEPOIS:', novosModulos[modulo_id].usado);
        
        user.modulos = novosModulos;
        console.log('Modulos do usuario DEPOIS:', JSON.stringify(user.modulos, null, 2));
        console.log('=== FIM PROCESSAMENTO MODULO QUANTIDADE ===');
      } else {
        console.log('TIPO DE LIMITE NAO RECONHECIDO:', modulo.tipo_limite);
      }

      console.log('=== SALVANDO USUARIO ===');
      await user.save({ transaction });
      console.log('=== USUARIO SALVO COM SUCESSO ===');

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
    console.log('=== VERIFICANDO USUARIO APOS COMMIT ===');
    const userVerificacao = await User.findByPk(usuario_id);
    console.log('Modulos do usuario APOS COMMIT:', JSON.stringify(userVerificacao.modulos, null, 2));

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
