'use strict';

module.exports = {
  up: (queryInterface, Sequelize) => {
    queryInterface.addColumn('users', 'deleted_at', { type: Sequelize.DATE });
  },

  down: (queryInterface, Sequelize) => {
    queryInterface.removeColumn('users', 'deleted_at');
  }
};
