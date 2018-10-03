const logger = require('../logger'),
  errors = require('../errors'),
  User = require('./../models').user;

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
  const regex = new RegExp('w+');
  User.findOne({where: { email: params.email }})
    .then(value => {
      if (value && value.email === params.email) {
        return res.status(400).send('This email is already in this Database');
      }
      if (params.email && params.email.includes(emailDomain) === false) {
        return res.status(400).send('Invalid email');
      } else if (params.password && regex.test(params.password) === true && params.password.length < 8) {
        return res.status(400).send('Invalid Password');
      } else {
        req.body.flagValidationOK = true;
        req.body.userParams = params;
        next();
      }
    });
};
