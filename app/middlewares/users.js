/* const User = require('./../models').user;

const emailDomain = 'wolox.com.ar';

exports.emailValidation = email => {
  const test = email.split('@')[1];
  if (test === emailDomain) {
    console.log('validado');
  } else {
    console.log('foo');
  }
};
*/
const logger = require('../logger');

exports.signUpValidation = (req, res, next) => {
  const params = req.body
    ? {
        firstName: req.body.firstName,
        lastName: req.body.lastName,
        password: req.body.password,
        email: req.body.email
      }
    : {};

  req.body.flagValidationOK = false;
  const emailDomain = '@wolox.com.ar';
  if (params.email && params.email.includes(emailDomain) === false) {
    // wrong domain;
    return res.status(400).send('Invalid email');
  } else if (params.password && params.password.length < 8) {
    // short pass
    return res.status(400).send('Invalid Password');
  } else {
    req.body.flagValidationOK = true; // aviso que salio todo bien
    req.body.userParams = params;
    next();
  }
};
