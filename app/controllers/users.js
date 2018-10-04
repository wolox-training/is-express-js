'use strict';

const User = require('../models').user,
  logger = require('../logger');

exports.create = (req, res, next) => {
  const params = req.body.userParams;
  User.create(params)
    .then(newUser => {
      logger.info(`User with email ${newUser.email} correctly created`);
      res.status(200).send({ newUser });
    })
    .catch(error => {
      logger.error(`Database Error. Details: ${JSON.stringify(error)}`);
      next(error);
    });
};
