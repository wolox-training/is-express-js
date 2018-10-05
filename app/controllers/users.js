'use strict';

const User = require('../models').user,
  sessionManager = require('./../services/sessionManager'),
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

exports.login = (req, res, next) => {
  const params = req.body.userParams;
  res.status(200);
  res.set(sessionManager.HEADER_NAME, params.auth);
  logger.info(`User with email ${params.email} correctly sign-in`);
  res.send(params);
};
