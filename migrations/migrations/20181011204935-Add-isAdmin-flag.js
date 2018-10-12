'use strict';

module.exports = {
  up: (queryInterface, Sequelize) => {
    queryInterface.addColumn('users', 'is_admin', {
      type: Sequelize.BOOLEAN,
      allowNull: true,
      defaulValue: false
    });
  },

  down: (queryInterface, Sequelize) => {
    queryInterface.removeColumn('users', 'is_admin');
  }
};
