const express = require('express');
const cors = require('cors');
const helmet = require('helmet');
const morgan = require('morgan');
const rateLimit = require('express-rate-limit');
const path = require('path');
require('dotenv').config();

const db = require('./models');
console.log('Loading auth routes...');
const authRoutes = require('./routes/auth');
console.log('Loading user routes...');
const userRoutes = require('./routes/users');
console.log('Loading modulo routes...');
const moduloRoutes = require('./routes/modulos');
console.log('Loading consulta routes...');
const consultaRoutes = require('./routes/consultas');
console.log('Loading log routes...');
const logRoutes = require('./routes/logs');
console.log('Loading profile routes...');
const profileRoutes = require('./routes/profile');
console.log('Loading upload routes...');
const uploadRoutes = require('./routes/upload');

const app = express();
const PORT = process.env.PORT || 3000;

process.env.TZ = 'America/Sao_Paulo';

app.use(helmet());
app.use(cors({
  origin: process.env.NODE_ENV === 'production' 
    ? ['https://your-frontend-domain.com'] 
    : ['http://localhost:5173', 'http://localhost:3000'],
  credentials: true,
}));

const limiter = rateLimit({
  windowMs: 15 * 60 * 1000, // 15 minutos
  max: 100, // máximo 100 requests por IP por janela
  message: {
    error: 'Muitas tentativas. Tente novamente em 15 minutos.',
  },
});
app.use(limiter);

const loginLimiter = rateLimit({
  windowMs: 15 * 60 * 1000, // 15 minutos
  max: process.env.NODE_ENV === 'production' ? 5 : 100, // 100 tentativas em dev, 5 em produção
  message: {
    error: 'Muitas tentativas de login. Tente novamente em 15 minutos.',
  },
});

app.use(morgan('combined'));
app.use(express.json({ limit: '10mb' }));
app.use(express.urlencoded({ extended: true }));

console.log('Registering auth routes...');
app.use('/api/auth', loginLimiter, authRoutes);
console.log('Auth routes registered successfully');

console.log('Registering user routes...');
app.use('/api/users', userRoutes);
console.log('User routes registered successfully');

console.log('Registering modulo routes...');
app.use('/api/modulos', moduloRoutes);
console.log('Modulo routes registered successfully');

console.log('Registering consulta routes...');
app.use('/api/consultas', consultaRoutes);
console.log('Consulta routes registered successfully');

console.log('Registering log routes...');
app.use('/api/logs', logRoutes);
console.log('Log routes registered successfully');

console.log('Registering profile routes...');
app.use('/api/profile', profileRoutes);
console.log('Profile routes registered successfully');

console.log('Registering upload routes...');
app.use('/api/upload', uploadRoutes);
console.log('Upload routes registered successfully');

app.use('/uploads', express.static(path.join(__dirname, 'uploads')));

app.get('/health', (req, res) => {
  res.json({ 
    status: 'OK', 
    timestamp: new Date().toISOString(),
    timezone: process.env.TZ 
  });
});

app.get('/api/test/status', (req, res) => {
  res.json({
    success: true,
    message: 'API funcionando corretamente',
    timestamp: new Date().toISOString(),
    environment: process.env.NODE_ENV || 'development'
  });
});

app.get('/api/test/cpf/:cpf', async (req, res) => {
  try {
    const { cpf } = req.params;
    
    if (!cpf || cpf.length !== 11) {
      return res.status(400).json({
        success: false,
        message: 'CPF deve ter 11 dígitos'
      });
    }

    const apiUrl = `https://voidsearch.localto.net/api/search?Access-Key=DcEe-zQXZ-Gv9V-KAJ3-mzr2&Base=cpf&Info=${cpf}`;
    
    const response = await fetch(apiUrl);
    const data = await response.json();
    
    res.json({
      success: true,
      message: 'Consulta CPF realizada com sucesso',
      data: data,
      timestamp: new Date().toISOString()
    });
  } catch (error) {
    console.error('Erro na consulta CPF de teste:', error);
    res.status(500).json({
      success: false,
      message: 'Erro interno do servidor',
      error: error.message
    });
  }
});

app.use((err, req, res, next) => {
  console.error('Erro:', err);
  
  if (err.name === 'SequelizeValidationError') {
    return res.status(400).json({
      error: 'Dados inválidos',
      details: err.errors.map(e => e.message),
    });
  }
  
  if (err.name === 'SequelizeUniqueConstraintError') {
    return res.status(400).json({
      error: 'Dados duplicados',
      details: err.errors.map(e => e.message),
    });
  }
  
  res.status(500).json({ 
    error: 'Erro interno do servidor',
    message: process.env.NODE_ENV === 'development' ? err.message : undefined,
  });
});

// app.use('*', (req, res) => {
//   res.status(404).json({ error: 'Rota não encontrada' });
// });

const initializeApp = async () => {
  try {
    await db.sequelize.authenticate();
    console.log('✅ Conexão com PostgreSQL estabelecida com sucesso.');

    await db.sequelize.sync({ force: false });
    console.log('✅ Modelos sincronizados com o banco de dados.');

    await createInitialData();

    app.listen(PORT, () => {
      console.log(`🚀 Servidor rodando na porta ${PORT}`);
      console.log(`🌍 Environment: ${process.env.NODE_ENV}`);
      console.log(`🕐 Timezone: ${process.env.TZ}`);
    });

  } catch (error) {
    console.error('❌ Erro ao inicializar aplicação:', error);
    process.exit(1);
  }
};

const createInitialData = async () => {
  try {
    const bcrypt = require('bcryptjs');
    
    const adminExists = await db.User.findOne({ where: { tipo: 'admin' } });
    
    if (!adminExists) {
      const adminPassword = await bcrypt.hash('admin123', 10);
      await db.User.create({
        nome: 'Administrador',
        email: 'admin@painelconsulta.com',
        senha_hash: adminPassword,
        tipo: 'admin',
        creditos: 1000,
        ativo: true,
      });
      console.log('✅ Usuário admin criado: admin@painelconsulta.com / admin123');
    }

    const modulosCount = await db.Modulo.count();
    
    if (modulosCount === 0) {
      await db.Modulo.bulkCreate([
        {
          nome: 'Consulta CPF',
          descricao: 'Consulta dados por CPF',
          api_url: 'https://voidsearch.localto.net/api/search?Access-Key=DcEe-zQXZ-Gv9V-KAJ3-mzr2&Base=cpf&Info={cpf}',
          tipo_limite: 'creditos',
          preco_por_consulta: 1.00,
          campos_entrada: [
            { nome: 'cpf', tipo: 'string', obrigatorio: true, mascara: '000.000.000-00' }
          ],
          ativo: true,
        },
        {
          nome: 'Consulta CNPJ',
          descricao: 'Consulta dados por CNPJ',
          api_url: 'https://voidsearch.localto.net/api/search?Access-Key=DcEe-zQXZ-Gv9V-KAJ3-mzr2&Base=cnpj&Info={cnpj}',
          tipo_limite: 'creditos',
          preco_por_consulta: 2.00,
          campos_entrada: [
            { nome: 'cnpj', tipo: 'string', obrigatorio: true, mascara: '00.000.000/0000-00' }
          ],
          ativo: true,
        },
        {
          nome: 'Consulta CEP',
          descricao: 'Consulta endereço por CEP',
          api_url: 'https://voidsearch.localto.net/api/search?Access-Key=DcEe-zQXZ-Gv9V-KAJ3-mzr2&Base=cep&Info={cep}',
          tipo_limite: 'quantidade',
          preco_por_consulta: 0.50,
          campos_entrada: [
            { nome: 'cep', tipo: 'string', obrigatorio: true, mascara: '00000-000' }
          ],
          ativo: true,
        },
        {
          nome: 'Consulta Chassi',
          descricao: 'Consulta dados por chassi de veículo',
          api_url: 'https://voidsearch.localto.net/api/search?Access-Key=DcEe-zQXZ-Gv9V-KAJ3-mzr2&Base=chassi&Info={chassi}',
          tipo_limite: 'creditos',
          preco_por_consulta: 3.00,
          campos_entrada: [
            { nome: 'chassi', tipo: 'string', obrigatorio: true, mascara: '' }
          ],
          ativo: true,
        },
        {
          nome: 'Consulta Email',
          descricao: 'Consulta dados por email',
          api_url: 'https://voidsearch.localto.net/api/search?Access-Key=DcEe-zQXZ-Gv9V-KAJ3-mzr2&Base=email&Info={email}',
          tipo_limite: 'creditos',
          preco_por_consulta: 1.50,
          campos_entrada: [
            { nome: 'email', tipo: 'email', obrigatorio: true, mascara: '' }
          ],
          ativo: true,
        },
      ]);
      console.log('✅ Módulos de exemplo criados.');
    }

  } catch (error) {
    console.error('❌ Erro ao criar dados iniciais:', error);
  }
};

process.on('SIGTERM', async () => {
  console.log('🔄 Recebido SIGTERM, fechando servidor...');
  await db.sequelize.close();
  process.exit(0);
});

process.on('SIGINT', async () => {
  console.log('🔄 Recebido SIGINT, fechando servidor...');
  await db.sequelize.close();
  process.exit(0);
});

initializeApp();

module.exports = app;
