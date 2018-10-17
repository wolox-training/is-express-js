const bcrypt = require('bcryptjs'),
  User = require('../app/models').user,
  adminPass = 'admin123',
  saltRounds = 10;

exports.execute = () => {
  return bcrypt
    .hash(adminPass, saltRounds)
    .then(hash => {
      const data = [];
      data.push(
        User.create({
          firstName: 'admin',
          lastName: 'istrator',
          email: 'admin@wolox.com.ar',
          password: hash,
          isAdmin: 'true'
        })
      );
      return Promise.all(data);
    })
    .catch(bcryptErr => {
      throw bcryptErr;
    });
};
