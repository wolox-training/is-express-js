'use strict';

module.exports = {
  up: (queryInterface, Sequelize) => {
    return queryInterface.bulkInsert(
      'users',
      [
        {
          first_name: 'admin',
          last_name: 'istrator',
          email: 'admin@wolox.com.ar',
          password: '$2a$10$VkavuYbqAZP3unWY1wXP/etsKtlulG4JwhH/hm5AXaCWm1z315Uxe',
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
