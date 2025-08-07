'use strict';

module.exports = {
  up: async (queryInterface, Sequelize) => {
    await queryInterface.addColumn('modulos', 'limite_padrao_quantidade', {
      type: Sequelize.INTEGER,
      allowNull: true,
      defaultValue: 1000,
    });
  },

  down: async (queryInterface, Sequelize) => {
    await queryInterface.removeColumn('modulos', 'limite_padrao_quantidade');
  }
};
