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

    if (modulo.tipo_limite === 'creditos') {
      if (user.creditos <= 0) {
        throw new Error('Créditos insuficientes');
      }
    } else if (modulo.tipo_limite === 'quantidade') {
      console.log('=== VALIDACAO MODULO QUANTIDADE ===');
      console.log('Modulo limite_padrao_quantidade:', modulo.limite_padrao_quantidade);
      
      let novosModulos = { ...user.modulos };
      
      if (!novosModulos[modulo_id]) {
        console.log('Modulo nao encontrado nos modulos do usuario, criando entrada com limite padrao');
        novosModulos[modulo_id] = { 
          limite: modulo.limite_padrao_quantidade || 1000, 
          usado: 0, 
          usos: []
        };
      }
      
      const agora = new Date();
      const moduloConfig = novosModulos[modulo_id];
      
      if (!moduloConfig.limite || moduloConfig.limite === 0 || moduloConfig.limite !== modulo.limite_padrao_quantidade) {
        console.log('Atualizando limite do modulo para:', modulo.limite_padrao_quantidade);
        moduloConfig.limite = modulo.limite_padrao_quantidade || 1000;
      }
      
      if (!moduloConfig.usos) {
        moduloConfig.usos = [];
      }
      
      const usos24hAtras = moduloConfig.usos.filter(uso => {
        const usoDate = new Date(uso);
        const diff = agora - usoDate;
        return diff < 24 * 60 * 60 * 1000;
      });
      
      moduloConfig.usos = usos24hAtras;
      moduloConfig.usado = usos24hAtras.length;
      
      console.log('Usado atual:', moduloConfig.usado);
      console.log('Limite atual:', moduloConfig.limite);
      
      if (moduloConfig.usado >= moduloConfig.limite) {
        throw new Error('Limite de consultas excedido para este módulo');
      }
      
      user.modulos = novosModulos;
      await user.save({ transaction });
      console.log('=== FIM VALIDACAO MODULO QUANTIDADE ===');
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
        console.log('Modulo limite_padrao_quantidade:', modulo.limite_padrao_quantidade);
        
        const novosModulos = { ...user.modulos };
        const agora = new Date();
        
        if (!novosModulos[modulo_id]) {
          console.log('Modulo nao encontrado nos modulos do usuario, criando entrada com limite padrao');
          novosModulos[modulo_id] = { 
            limite: modulo.limite_padrao_quantidade || 1000, 
            usado: 0, 
            usos: []
          };
        }
        
        if (!novosModulos[modulo_id].limite || novosModulos[modulo_id].limite === 0 || novosModulos[modulo_id].limite !== modulo.limite_padrao_quantidade) {
          console.log('Atualizando limite do modulo para:', modulo.limite_padrao_quantidade);
          novosModulos[modulo_id].limite = modulo.limite_padrao_quantidade || 1000;
        }
        
        if (!novosModulos[modulo_id].usos) {
          novosModulos[modulo_id].usos = [];
        }
        
        novosModulos[modulo_id].usos.push(agora.toISOString());
        
        const usos24hAtras = novosModulos[modulo_id].usos.filter(uso => {
          const usoDate = new Date(uso);
          const diff = agora - usoDate;
          return diff < 24 * 60 * 60 * 1000;
        });
        
        novosModulos[modulo_id].usos = usos24hAtras;
        novosModulos[modulo_id].usado = usos24hAtras.length;
        
        console.log('Usado ANTES:', novosModulos[modulo_id].usado - 1);
        console.log('Usado DEPOIS:', novosModulos[modulo_id].usado);
        console.log('Limite:', novosModulos[modulo_id].limite);
        
        user.modulos = novosModulos;
        console.log('Modulos do usuario DEPOIS:', JSON.stringify(user.modulos, null, 2));
        console.log('=== FIM PROCESSAMENTO MODULO QUANTIDADE ===');
      }else {
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
    console.log('Usuario completo APOS COMMIT:', JSON.stringify({
      id: userVerificacao.id,
      nome: userVerificacao.nome,
      creditos: userVerificacao.creditos,
      modulos: userVerificacao.modulos
    }, null, 2));

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
