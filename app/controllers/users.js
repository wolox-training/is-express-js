'use strict';

const User = require('../models').user,
  errors = require('../errors'),
  bcrypt = require('bcryptjs'),
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
  const token = req.body.auth,
    pass = req.body.password,
    dbPass = req.body.dbPass;
  bcrypt.compare(pass, dbPass).then(validPass => {
    if (validPass) {
      logger.info(`User correctly sign-in`);
      res.status(200).send({ token });
    } else {
      logger.info(`User used an invalid password`);
      next(errors.invalidPassword);
    }
  });
};
