const { DataTypes } = require('sequelize');

module.exports = (sequelize) => {
  const Consulta = sequelize.define('Consulta', {
    id: {
      type: DataTypes.INTEGER,
      primaryKey: true,
      autoIncrement: true,
    },
    modulo_id: {
      type: DataTypes.INTEGER,
      allowNull: false,
      references: {
        model: 'modulos',
        key: 'id',
      },
    },
    usuario_id: {
      type: DataTypes.INTEGER,
      allowNull: false,
      references: {
        model: 'users',
        key: 'id',
      },
    },
    data: {
      type: DataTypes.DATE,
      allowNull: false,
      defaultValue: DataTypes.NOW,
    },
    input: {
      type: DataTypes.JSON,
      allowNull: false,
    },
    retorno_resumido: {
      type: DataTypes.JSON,
      allowNull: true,
    },
    status: {
      type: DataTypes.ENUM('sucesso', 'falha'),
      allowNull: false,
    },
  }, {
    tableName: 'consultas',
    timestamps: true,
    createdAt: 'data',
    updatedAt: 'updatedAt',
  });

  return Consulta;
};
