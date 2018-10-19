const Album = require('../models').album,
  errors = require('../errors'),
  bcrypt = require('bcryptjs'),
  fetch = require('node-fetch'),
  logger = require('../logger');

exports.retrieveAlbum = (req, res, next) => {
  const albumId = req.params.id;
  logger.info(`Attempting to find an Album.`);
  fetch(`https://jsonplaceholder.typicode.com/albums/${albumId}`)
    .then(response => response.json())
    .then(someAlbum => {
      req.albumData = {
        id: someAlbum.id,
        title: someAlbum.title
      };
      next();
    })
    .catch(error => {
      return next(errors.nothingFound);
    });
};
