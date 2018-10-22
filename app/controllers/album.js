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
  const listOfUserAlbums = req.list.albumList,
    userIdToPrint = req.list.userId,
    isAdminFlag = req.user.isAdmin,
    userIdAsking = req.user.id;
  if (isAdminFlag) {
    res.status(200).send({ listOfUserAlbums });
  } else if (userIdToPrint !== userIdAsking) {
    return next(errors.invalidUserList);
  } else {
    res.status(200).send({ listOfUserAlbums });
  }
};
