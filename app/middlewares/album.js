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

exports.retrieveUserAlbums = (req, res, next) => {
  const userToFind = { userId: req.params.user_id };
  logger.info(`Attempting to find all Albums of user with id: ${userToFind.userId}.`);
  Album.getAlbumList(userToFind)
    .then(list => {
      if (!list.length) {
        return next(errors.noUserAlbum);
      } else {
        req.list = {
          albumList: list,
          userId: parseInt(userToFind.userId)
        };
        next();
      }
    })
    .catch(error => {
      logger.error(`Database Error. Details: ${JSON.stringify(error)}`);
      next(error);
    });
};
