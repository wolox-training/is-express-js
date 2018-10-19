module.exports = {
  up: (queryInterface, Sequelize) => {
    queryInterface.addColumn('albums', 'album_id', { type: Sequelize.INTEGER, allowNull: false });
  },

  down: (queryInterface, Sequelize) => {
    queryInterface.removeColumn('albums', 'album_id');
  }
};
