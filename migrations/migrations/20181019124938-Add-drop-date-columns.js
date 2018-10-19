module.exports = {
  up: (queryInterface, Sequelize) => {
    queryInterface.removeColumn('albums', 'createdAt');
    queryInterface.removeColumn('albums', 'updatedAt');
  },

  down: (queryInterface, Sequelize) => {
    queryInterface.addColumn('albums', 'createdAt', { type: Sequelize.DATE });
    queryInterface.addColumn('albums', 'updatedAt', { type: Sequelize.DATE });
  }
};
