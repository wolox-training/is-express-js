'use strict';

module.exports = {
  up: (queryInterface, Sequelize) => {
    queryInterface.addColumn('users', 'created_at', { type: Sequelize.DATE });
    queryInterface.addColumn('users', 'updated_at', { type: Sequelize.DATE });
    // queryInterface.addColumn('users', 'deleted_at',  { type : Sequelize.DATE });
  },

  down: (queryInterface, Sequelize) => {
    queryInterface.removeColumn('users', 'created_at');
    queryInterface.removeColumn('users', 'updated_at');
  }
};
