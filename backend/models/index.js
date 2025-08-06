const { Sequelize } = require('sequelize');
require('dotenv').config();

const sequelize = new Sequelize({
  dialect: process.env.DB_DIALECT || 'postgres',
  host: process.env.DB_HOST || 'localhost',
  port: process.env.DB_PORT || 5432,
  database: process.env.DB_NAME || 'painelconsulta_dev',
  username: process.env.DB_USER || 'postgres',
  password: process.env.DB_PASSWORD || 'postgres',
  logging: process.env.DB_LOGGING === 'true' ? console.log : false,
  timezone: '+00:00',
  dialectOptions: {
    timezone: 'local',
  },
});

const User = require('./User')(sequelize);
const Modulo = require('./Modulo')(sequelize);
const Consulta = require('./Consulta')(sequelize);
const Log = require('./Log')(sequelize);

User.hasMany(Consulta, { foreignKey: 'usuario_id' });
Consulta.belongsTo(User, { foreignKey: 'usuario_id' });

Modulo.hasMany(Consulta, { foreignKey: 'modulo_id' });
Consulta.belongsTo(Modulo, { foreignKey: 'modulo_id' });

User.hasMany(Log, { foreignKey: 'usuario_id' });
Log.belongsTo(User, { foreignKey: 'usuario_id' });

const db = {
  sequelize,
  Sequelize,
  User,
  Modulo,
  Consulta,
  Log,
};

module.exports = db;
