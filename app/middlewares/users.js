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
          email: req.body.email,
          isAdmin : req.user.isAdmin ? true : false
        }
      : {},
    emailDomain = '@wolox.com.ar',
    regex = new RegExp('^[0-9A-Za-z]+$'),
    saltRounds = 10;
  User.findOne({ where: { email: params.email } }).then(value => {
    if (value && value.email === params.email) {
      if(!params.isAdmin){
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
          req.body.userParams = params; //used at create process
          req.userFound = value; // used at update or create process
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
    if (!value || (params.email && !params.email.includes(emailDomain))) {
      return next(errors.invalidEmail);
    } else if (!headerToken || headerToken !== auth) {
      req.body.auth = auth;
      req.body.dbPass = value.password;
      next();
    } else {
      return res.status(200).send('Already logged-in!');
    }
  });
};

exports.tokenValidation = (req, res, next) => {
  const headerToken = req.headers.authorization ? req.headers.authorization : false;
  if (!headerToken) {
    next(errors.tokenError);
  } else {
    let userEmail = '';
    try {
      userEmail = sessionManager.decode(headerToken);
    } catch (error) {
      next(errors.invalidToken);
    }
    User.findOne({ where: userEmail }).then(u => {
      if (!u) {
        next(errors.invalidToken);
      } else {
        req.user = u;
        next();
      }
    });
  }
};

exports.adminValidation = (req, res, next) => { 
      if(!req.user.isAdmin){
        next(errors.invalidAdminUser);
      }
      else{
        next();
      }
};

exports.updateValidation = (req, res, next) => {
  if(!req.userFound){
    next();
  }
  else if(req.userFound.firstName !== req.body.userParams.firstName){
    return next(errors.invalidUpdate);
  }else if(req.userFound.lastName !== req.body.userParams.lastName){
    return next(errors.invalidUpdate);
  }else if(req.userFound.password !== req.body.userParams.password){
    return next(errors.invalidUpdate);
  }else if(req.userFound.email !== req.body.userParams.email){
    return next(errors.invalidUpdate);
  }else{
    req.updateFlag = true;
    next();
  }
};