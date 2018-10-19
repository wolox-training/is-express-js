const errors = require('../errors');

module.exports = (sequelize, DataTypes) => {
  const album = sequelize.define(
    'album',
    {
      userId: {
        type: DataTypes.INTEGER,
        allowNull: false,
        field: 'user_id'
      },
      albumId: {
        type: DataTypes.INTEGER,
        allowNull: false,
        field: 'album_id'
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
  album.assignUser = (userID, albumID) => {
    const relation = {
      userId: userID,
      albumId: albumID
    };
    return album.create(relation).catch(err => {
      errors.defaultError;
    });
  };
  return album;
};
