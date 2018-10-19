'use strict';

const bcrypt = require('bcryptjs'),
  adminPass = 'admin123';

const hashPassword = pass => {
  const saltRounds = 10;
  return bcrypt.hash(pass, saltRounds).catch(err => {
    throw err;
  });
};

module.exports = {
  up: (queryInterface, Sequelize) => {
    return hashPassword(adminPass).then(pass => {
      queryInterface.bulkInsert(
        'users',
        [
          {
            first_name: 'admin',
            last_name: 'istrator',
            email: 'admin@wolox.com.ar',
            password: pass,
            is_admin: true
          }
        ],
        {}
      );
    });
  },

  down: (queryInterface, Sequelize) => {
    return queryInterface.bulkDelete('users', null, {});
  }
};
