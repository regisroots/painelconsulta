const { DataTypes } = require('sequelize');

module.exports = (sequelize) => {
  const User = sequelize.define('User', {
    id: {
      type: DataTypes.INTEGER,
      primaryKey: true,
      autoIncrement: true,
    },
    nome: {
      type: DataTypes.STRING,
      allowNull: false,
    },
    email: {
      type: DataTypes.STRING,
      allowNull: false,
      unique: true,
      validate: {
        isEmail: true,
      },
    },
    senha_hash: {
      type: DataTypes.STRING,
      allowNull: false,
    },
    tipo: {
      type: DataTypes.ENUM('admin', 'revendedor', 'usuario'),
      allowNull: false,
      defaultValue: 'usuario',
    },
    dias_ativos: {
      type: DataTypes.INTEGER,
      allowNull: false,
      defaultValue: 0,
    },
    data_criacao: {
      type: DataTypes.DATE,
      allowNull: false,
      defaultValue: DataTypes.NOW,
    },
    data_expiracao: {
      type: DataTypes.DATE,
      allowNull: true,
    },
    ativo: {
      type: DataTypes.BOOLEAN,
      allowNull: false,
      defaultValue: true,
    },
    banido: {
      type: DataTypes.BOOLEAN,
      allowNull: false,
      defaultValue: false,
    },
    motivo_banimento: {
      type: DataTypes.TEXT,
      allowNull: true,
    },
    creditos: {
      type: DataTypes.INTEGER,
      allowNull: false,
      defaultValue: 0,
    },
    modulos: {
      type: DataTypes.JSON,
      allowNull: false,
      defaultValue: {},
    },
    revendedor_id: {
      type: DataTypes.INTEGER,
      allowNull: true,
      references: {
        model: 'users',
        key: 'id',
      },
    },
    whatsapp_contato: {
      type: DataTypes.STRING,
      allowNull: true,
    },
    telegram_contato: {
      type: DataTypes.STRING,
      allowNull: true,
    },
  }, {
    tableName: 'users',
    timestamps: true,
    createdAt: 'data_criacao',
    updatedAt: 'updatedAt',
  });

  return User;
};
