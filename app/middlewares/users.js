const logger = require('../logger'),
  errors = require('../errors'),
  User = require('./../models').user,
  sessionManager = require('./../services/sessionManager'),
  bcrypt = require('bcryptjs'),
  moment = require('moment'),
  config = require('../../config').common;

exports.signUpValidation = (req, res, next) => {
  let flagAdmin;
  if (typeof req.user !== 'undefined') {
    if (req.user.isAdmin) {
      flagAdmin = req.user.isAdmin;
    } else {
      next(errors.notAdminUser);
    }
  }
  if (!flagAdmin && req.body.isAdmin === 'true') {
    next(errors.invalidUserTryingToBeAdmin);
  }
  const params = req.body
      ? {
          firstName: req.body.firstName,
          lastName: req.body.lastName,
          password: req.body.password,
          email: req.body.email,
          isAdmin: typeof req.body.isAdmin !== 'undefined' ? JSON.parse(req.body.isAdmin) : true
        }
      : {},
    emailDomain = '@wolox.com.ar',
    regex = new RegExp('^[0-9A-Za-z]+$'),
    saltRounds = 10;
  User.findOne({ where: { email: params.email } }).then(value => {
    if (value && value.email === params.email) {
      if (!flagAdmin) {
        return next(errors.notUniqueEmail);
      }
    }
    if (!params.email || !params.email.includes(emailDomain)) {
      return next(errors.invalidEmail);
    } else if ((params.password && !regex.test(params.password)) || params.password.length < 8) {
      return next(errors.invalidPassword);
    } else {
      bcrypt
        .hash(params.password, saltRounds)
        .then(notPlanePass => {
          params.password = notPlanePass;
          req.originalPass = req.body.password;
          req.body.userParams = params;
          req.userFound = value;
          next();
        })
        .catch(err => {
          next(errors.defaultError);
        });
    }
  });
};

const emailIsNotValid = userEmail => {
  const emailDomain = '@wolox.com.ar';
  if (userEmail && !userEmail.includes(emailDomain)) {
    return true;
  } else {
    return false;
  }
};

const encoder = email => {
  return sessionManager.encode({ email, tokenCreationMoment: moment() });
};

const decoder = token => {
  let data = '';
  try {
    data = sessionManager.decode(token);
  } catch (error) {
    data = false;
  }
  return data;
};

const tokenHasExpired = token => {
  const tokenValidationMoment = moment(),
    tokenDurationMinutes = moment.duration(tokenValidationMoment.diff(token.tokenCreationMoment)).asMinutes(),
    tokenTimeout = process.env.TOKEN_TIMEOUT_MINUTES; // tokenTimeout = timeout.token;
  if (tokenDurationMinutes >= tokenTimeout) {
    return true;
  } else {
    return false;
  }
};

const noUserLogged = (user, token, headerToken) => {
  if (!headerToken || user.email !== token.email || tokenHasExpired(token.tokenCreationMoment)) {
    return true;
  } else {
    return false;
  }
};

exports.signInValidation = (req, res, next) => {
  const userToFind = req.body ? { email: req.body.email } : {},
    headerToken = req.headers.authorization ? req.headers.authorization : false,
    tokenTimeout = process.env.TOKEN_TIMEOUT_MINUTES; // tokenTimeout = timeout.token;
  if (emailIsNotValid(userToFind.email)) return next(errors.invalidEmail);
  User.findOne({ where: { email: userToFind.email } }).then(userFound => {
    if (!userFound) {
      return next(errors.invalidUserDB);
    } else {
      const tokenData = decoder(headerToken);
      if (
        noUserLogged(userToFind, tokenData, headerToken) ||
        tokenHasExpired(tokenData.tokenCreationMoment)
      ) {
        logger.info(`Token will expire in ${tokenTimeout} minutes`);
        req.body.auth = encoder(userFound.email);
        req.body.dbPass = userFound.password;
        next();
      } else {
        return res.status(200).send('Already logged-in!');
      }
    }
  });
};

exports.tokenValidation = (req, res, next) => {
  const headerToken = req.headers.authorization ? req.headers.authorization : false;
  if (!headerToken) {
    next(errors.tokenError);
  } else {
    const tokenData = decoder(headerToken);
    User.findOne({ where: { email: tokenData.email } }).then(userFound => {
      if (!userFound) {
        return next(errors.invalidToken);
      } else if (tokenHasExpired(tokenData)) {
        next(errors.tokenExpired);
      } else {
        req.user = userFound;
        next();
      }
    });
  }
};

exports.adminValidation = (req, res, next) => {
  if (!req.user.isAdmin) {
    next(errors.invalidAdminUser);
  } else {
    next();
  }
};

exports.updateValidation = (req, res, next) => {
  if (!req.userFound) {
    req.updateFlag = false;
    next();
  } else {
    bcrypt.compare(req.originalPass, req.userFound.password).then(validPass => {
      if (validPass) {
        if (req.userFound.firstName !== req.body.userParams.firstName) {
          return next(errors.invalidUpdate);
        } else if (req.userFound.lastName !== req.body.userParams.lastName) {
          return next(errors.invalidUpdate);
        } else if (req.userFound.email !== req.body.userParams.email) {
          return next(errors.invalidUpdate);
        } else if (req.userFound.isAdmin === JSON.parse(req.body.userParams.isAdmin)) {
          return res.status(200).send('There is nothing to change!');
        } else {
          req.updateFlag = true;
          next();
        }
      } else {
        return next(errors.invalidUpdate);
      }
    });
  }
};
