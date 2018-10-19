const Album = require('../models').album,
  errors = require('../errors'),
  bcrypt = require('bcryptjs'),
  fetch = require('node-fetch'),
  logger = require('../logger');

exports.userBuyAlbum = (req, res, next) => {
  /* const albumId = req.params.id,
    userId = req.user.id; */
  const albumId = req.params.id;
  logger.info(`Attempting to buy Album.`);
  fetch(`https://jsonplaceholder.typicode.com/albums/${albumId}`)
    .then(response => response.json())
    .then(albumToBuy => {
      // res.status(200).send({ albumToBuy });
      const relation = {
        userId: req.user.id,
        albumId: albumToBuy.id
      };
      Album.create(relation).then(newRelation => {
        logger.info(
          `Relation userID: ${newRelation.userId} - albumID: ${newRelation.albumId} correctly created`
        );
        res.status(200).send({ newRelation });
      });
    })
    .catch(error => {
      logger.error(`Database Error. Details: ${JSON.stringify(error)}`);
      next(error);
    });
};
