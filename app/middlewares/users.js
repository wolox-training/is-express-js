const logger = require('../logger'),
  errors = require('../errors'),
  User = require('./../models').user,
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
      return res.status(400).send('This email is already in this Database');
    }
    if (params.email && params.email.includes(emailDomain) === false) {
      return res.status(400).send('Invalid email');
    } else if ((params.password && regex.test(params.password) === false) || params.password.length < 8) {
      return res.status(400).send('Invalid Password');
    } else {
      bcrypt
        .hash(params.password, saltRounds)
        .then(notPlanePass => {
          params.password = notPlanePass;
          req.body.userParams = params;
          next();
        })
        .catch(err => {
          next(errors.defaultError(err));
        });
    }
  });
};
