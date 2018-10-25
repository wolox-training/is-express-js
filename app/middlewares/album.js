const Album = require('../models').album,
  errors = require('../errors'),
  fetch = require('node-fetch'),
  logger = require('../logger');

exports.retrieveAlbum = (req, res, next) => {
  const albumId = req.params.id;
  logger.info(`Attempting to find an Album.`);
  fetch(`https://jsonplaceholder.typicode.com/albums/${albumId}`)
    .then(response => response.json())
    .then(someAlbum => {
      if (!someAlbum.id) {
        return next(errors.nothingFound);
      } else {
        req.albumData = someAlbum;
        next();
      }
    })
    .catch(error => {
      return errors.defaultError;
    });
};

exports.uniqueAlbumBoughtValidation = (req, res, next) => {
  const userAlreadyBoughtOne = {
    userId: req.user.id,
    albumId: req.albumData.id
  };
  Album.findOne({ where: userAlreadyBoughtOne }).then(someAlbum => {
    if (!someAlbum) {
      next();
    } else {
      return next(errors.alreadyBought);
    }
  });
};

exports.retrieveAlbumPhotos = (req, res, next) => {
  const albumToFind = parseInt(req.params.id),
    userToFind = req.user.id;
  logger.info(`Looking for album-user relation at DB`);
  Album.getPhotos(userToFind, albumToFind)
    .then(albumFound => {
      if (!albumFound) {
        return next(errors.invalidUserAlbum);
      } else {
        req.albumFound = albumFound;
        next();
      }
    })
    .catch(error => {
      return errors.defaultError;
    });
};
