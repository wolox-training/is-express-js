const Album = require('../models').album,
  errors = require('../errors'),
  fetch = require('node-fetch'),
  logger = require('../logger');

exports.printAllAlbums = (req, res, next) => {
  logger.info(`Attempting to retrieve list of albums.`);
  fetch('https://jsonplaceholder.typicode.com/albums')
    .then(response => response.json())
    .then(albums => {
      res.status(200).send({ albums });
    })
    .catch(error => {
      logger.error(`Database Error. Details: ${JSON.stringify(error)}`);
      next(error);
    });
};

exports.userBuyAlbum = (req, res, next) => {
  const relation = {
    userId: req.user.id,
    albumId: req.albumData.id,
    albumTitle: req.albumData.title
  };
  Album.assignUser(relation)
    .then(newRelation => {
      logger.info(`Relation correctly created`);
      res.status(200).send({ newRelation });
    })
    .catch(error => {
      logger.error(`Database Error. Details: ${JSON.stringify(error)}`);
      next(error);
    });
};

exports.printAllUserAlbums = (req, res, next) => {
  const isAdminFlag = req.user.isAdmin,
    userIdAsking = req.user.id,
    userToFind = { userId: req.params.user_id };
  if (parseInt(userToFind.userId) === userIdAsking || isAdminFlag) {
    logger.info(`Attempting to find all Albums of user with id: ${userToFind.userId}.`);
    Album.getAlbumList(userToFind)
      .then(list => {
        if (!list.length) {
          return next(errors.noUserAlbum);
        } else {
          res.status(200).send({ list });
        }
      })
      .catch(error => {
        logger.error(`Database Error. Details: ${JSON.stringify(error)}`);
        next(error);
      });
  } else {
    return next(errors.invalidUserList);
  }
};

exports.printAlbumPhotos = (req, res, next) => {
  const albumToFind = parseInt(req.params.id),
    albumFound = req.albumFound;
  logger.info(`Attempting to retrieve all photos from Album: ${albumToFind}.`);
  fetch(`https://jsonplaceholder.typicode.com/photos?albumId=${albumFound.albumId}`)
    .then(response => response.json())
    .then(photoList => {
      if (!photoList.length) {
        return next(errors.nothingFound);
      } else {
        req.photoData = photoList;
        res.status(200).send({ photoList });
      }
    })
    .catch(error => {
      return errors.defaultError;
    });
};
