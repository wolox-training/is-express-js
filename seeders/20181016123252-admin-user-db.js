'use strict';

const bcrypt = require('bcryptjs'),
  config = require('../config'),
  pw = config.password;

const hashPassword = pass => {
  const saltRounds = 10;
  bcrypt
    .hash(pass, saltRounds)
    .then(hashPass => {
      return hashPass;
    })
    .catch(err => {
      throw err;
    });
};

module.exports = {
  up: (queryInterface, Sequelize) => {
    return queryInterface.bulkInsert(
      'users',
      [
        {
          first_name: 'admin',
          last_name: 'istrator',
          email: 'admin@wolox.com.ar',
          password: hashPassword(pw.adminPass),
          is_admin: true
        }
      ],
      {}
    );
  },

  down: (queryInterface, Sequelize) => {
    return queryInterface.bulkDelete('users', null, {});
  }
};
