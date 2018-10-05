const logger = require('../logger'),
  errors = require('../errors'),
  User = require('./../models').user,
  sessionManager = require('./../services/sessionManager'),
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
  const params = req.body ? { email: req.body.email } : {},
    emailDomain = '@wolox.com.ar',
    auth = sessionManager.encode({ email: params.email }),
    headerToken = req.headers.authorization;
  User.findOne({ where: { email: params.email } }).then(value => {
    if (!value || (params.email && params.email.includes(emailDomain) === false)) {
      return next(errors.invalidEmail);
    } else if (!headerToken || headerToken !== auth) {
      req.body.auth = auth;
      req.body.dbPass = value.password;
      next();
    } else {
      return next(errors.loggedUser);
    }
  });
};
