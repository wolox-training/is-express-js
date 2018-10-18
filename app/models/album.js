const errors = require('../errors');

module.exports = (sequelize, DataTypes) => {
  const album = sequelize.define(
    'album',
    {
      userId: {
        type: DataTypes.INTEGER,
        allowNull: false,
        field: 'user_id'
      }
    },
    {
      paranoid: true,
      underscored: true
    }
  );
  album.associate = models => {
    album.belongsTo(models.user);
  };
  album.assignUser = buyAlbum => {
    return album.create(buyAlbum).catch(err => {
      errors.defaultError;
    });
  };
  return album;
};
