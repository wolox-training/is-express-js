'use strict';

const User = require('../models').user,
  logger = require('../logger');

exports.create = (req, res, next) => {
  const params = req.body.userParams;
  // const params = req.userParams;
  const validationOK = req.body.flagValidationOK;
  logger.info(`validationOK: ${validationOK}`);
  if (validationOK === true) {
    // const params = req.userParams;
    User.create(params)
      .then(newUser => {
        logger.info(`User with email ${newUser.email} correctly created`);
        res.status(200).send({ newUser });
      })
      .catch(error => {
        logger.error(`Database Error. Details: ${JSON.stringify(error)}`);
        next(error);
      });
  } else {
    logger.error(`no estoy guardando nada`);
  }
};
/*
exports.create = (req, res, next) => {
  const emailDomain = '@wolox.com.ar';
  const params = req.body
    ? {
        firstName: req.body.firstName,
        lastName: req.body.lastName,
        password: req.body.password,
        email: req.body.email
      }
    : {};
  logger.info(
    `Attempting to create user with name ${params.firstName} ${params.lastName} and email ${params.email}`
  );

  if (params.email && params.email.includes(emailDomain) === false) {
    // wrong domain
    return res.status(400).send('Invalid email');
  } else if (params.password && params.password.length < 8) {
    // short pass
    return res.status(400).send('Invalid Password');
  } else {
    // ahora vemos
    User.create(params)
      .then(newUser => {
        logger.info(`User with email ${newUser.email} correctly created`);
        res.status(200).send({ newUser });
      })
      .catch(error => {
        logger.error(`Database Error. Details: ${JSON.stringify(error)}`);
        next(error);
      });
  }
}; */
/*
exports.signUp = (req, res, next) => {
  console.log(req.body);
  console.log(middleware.emailValidation(req.body.email));
  res.status(200);
  // next('error');
  res.end();
};
*/
