module.exports = {
  up: (queryInterface, Sequelize) => {
    queryInterface.addColumn('albums', 'created_at', { type: Sequelize.DATE });
    queryInterface.addColumn('albums', 'updated_at', { type: Sequelize.DATE });
  },

  down: (queryInterface, Sequelize) => {
    queryInterface.removeColumn('albums', 'created_at');
    queryInterface.removeColumn('albums', 'updated_at');
  }
};
