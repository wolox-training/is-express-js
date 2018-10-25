const errors = require('../errors');

module.exports = (sequelize, DataTypes) => {
  const album = sequelize.define(
    'album',
    {
      userId: {
        type: DataTypes.INTEGER,
        primaryKey: true,
        allowNull: false,
        field: 'user_id'
      },
      albumId: {
        type: DataTypes.INTEGER,
        primaryKey: true,
        allowNull: false,
        field: 'id'
      },
      albumTitle: {
        type: DataTypes.STRING,
        allowNull: false,
        field: 'album_title'
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
  album.assignUser = relation => {
    return album.create(relation).catch(err => {
      throw errors.databaseError;
    });
  };
  album.getAlbumList = user => {
    return album.findAll({ where: user }).catch(err => {
      throw errors.databaseError;
    });
  };
  album.getPhotos = (userToFind, albumToFind) => {
    return album.findOne({ where: { userId: userToFind, albumId: albumToFind } }).catch(err => {
      throw errors.databaseError;
    });
  };
  return album;
};
