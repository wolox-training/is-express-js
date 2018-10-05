const logger = require('../logger'),
  errors = require('../errors'),
  User = require('./../models').user,
  jwt = require('jwt-simple'),
  bcrypt = require('bcryptjs');

exports.signUpValidation = (req, res, next) => {
  const params = req.body
      ? {
          firstName: req.body.firstName,
          lastName: req.body.lastName,
          password: req.body.password,
          email: req.body.email
        }
      : {},
    emailDomain = '@wolox.com.ar',
    regex = new RegExp('^[0-9A-Za-z]+$'),
    saltRounds = 10;
  User.findOne({ where: { email: params.email } }).then(value => {
    if (value && value.email === params.email) {
      return next(errors.notUniqueEmail);
    }
    if (!params.email || params.email.includes(emailDomain) === false) {
      return next(errors.invalidEmail);
    } else if ((params.password && regex.test(params.password) === false) || params.password.length < 8) {
      return next(errors.invalidPassword);
    } else {
      bcrypt
        .hash(params.password, saltRounds)
        .then(notPlanePass => {
          params.password = notPlanePass;
          req.body.userParams = params;
          next();
        })
        .catch(err => {
          next(errors.defaultError);
        });
    }
  });
};

exports.signInValidation = (req, res, next) => {
  const params = req.body
      ? {
          password: req.body.password,
          email: req.body.email
        }
      : {},
    emailDomain = '@wolox.com.ar',
    secret = 'This is superTopArchiMegaTeraTopAgain Secret',
    saltRounds = 10;
  User.findOne({ where: { email: params.email } }).then(value => {
    if (!value || (params.email && params.email.includes(emailDomain) === false)) {
      return next(errors.invalidEmail);
    } else {
      bcrypt.compare(params.password, value.password).then(validPass => {
        if (validPass) {
          params.auth = jwt.encode({ email: params.email }, secret);
          if(res.get(header.auth)){
            logger.info(`User with email ${res.get(Headers.auth)} used an invalid password`);   
          }         
          req.body.userParams = params;
          next();
        } else {
          logger.info(`User with email ${params.email} used an invalid password`);
          next(errors.invalidPassword);
        }
      });
    }
  });
};
