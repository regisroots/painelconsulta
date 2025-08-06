const { DataTypes } = require('sequelize');

module.exports = (sequelize) => {
  const Log = sequelize.define('Log', {
    id: {
      type: DataTypes.INTEGER,
      primaryKey: true,
      autoIncrement: true,
    },
    tipo: {
      type: DataTypes.ENUM('admin_action', 'revendedor_action', 'consulta', 'login', 'logout', 'error'),
      allowNull: false,
    },
    usuario_id: {
      type: DataTypes.INTEGER,
      allowNull: true,
      references: {
        model: 'users',
        key: 'id',
      },
    },
    acao: {
      type: DataTypes.STRING,
      allowNull: false,
    },
    detalhes: {
      type: DataTypes.JSON,
      allowNull: true,
    },
    ip_address: {
      type: DataTypes.STRING,
      allowNull: true,
    },
    user_agent: {
      type: DataTypes.TEXT,
      allowNull: true,
    },
    duracao_ms: {
      type: DataTypes.INTEGER,
      allowNull: true,
    },
    data: {
      type: DataTypes.DATE,
      allowNull: false,
      defaultValue: DataTypes.NOW,
    },
  }, {
    tableName: 'logs',
    timestamps: true,
    createdAt: 'data',
    updatedAt: 'updatedAt',
  });

  Log.associate = function(models) {
    Log.belongsTo(models.User, {
      foreignKey: 'usuario_id'
    });
  };

  return Log;
};
