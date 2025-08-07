const { DataTypes } = require('sequelize');

module.exports = (sequelize) => {
  const Modulo = sequelize.define('Modulo', {
    id: {
      type: DataTypes.INTEGER,
      primaryKey: true,
      autoIncrement: true,
    },
    nome: {
      type: DataTypes.STRING,
      allowNull: false,
    },
    descricao: {
      type: DataTypes.TEXT,
      allowNull: true,
    },
    ativo: {
      type: DataTypes.BOOLEAN,
      allowNull: false,
      defaultValue: true,
    },
    tipo_limite: {
      type: DataTypes.ENUM('creditos', 'quantidade'),
      allowNull: false,
      defaultValue: 'creditos',
    },
    preco_por_consulta: {
      type: DataTypes.DECIMAL(10, 2),
      allowNull: true,
    },
    api_url: {
      type: DataTypes.STRING,
      allowNull: false,
    },
    campos_entrada: {
      type: DataTypes.JSON,
      allowNull: false,
      defaultValue: [],
    },
    manutencao: {
      type: DataTypes.BOOLEAN,
      allowNull: false,
      defaultValue: false,
    },
    imagem_url: {
      type: DataTypes.STRING,
      allowNull: true,
    },
    timeout_segundos: {
      type: DataTypes.INTEGER,
      allowNull: false,
      defaultValue: 30,
    },
    limite_padrao_quantidade: {
      type: DataTypes.INTEGER,
      allowNull: true,
      defaultValue: 1000,
    },
  }, {
    tableName: 'modulos',
    timestamps: true,
  });

  return Modulo;
};
