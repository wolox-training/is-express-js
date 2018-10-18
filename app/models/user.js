const errors = require('../errors'),
  config = require('../../config'),
  paging = config.paging;

module.exports = (sequelize, DataTypes) => {
  const User = sequelize.define(
    'user',
    {
      firstName: {
        type: DataTypes.STRING,
        allowNull: false,
        field: 'first_name'
      },
      lastName: {
        type: DataTypes.STRING,
        allowNull: false,
        field: 'last_name'
      },
      email: {
        type: DataTypes.STRING,
        allowNull: false,
        field: 'email'
      },
      password: {
        type: DataTypes.STRING,
        allowNull: false,
        field: 'password'
      },
      isAdmin: {
        type: DataTypes.BOOLEAN,
        allowNull: true,
        defaultValue: false,
        field: 'is_admin'
      }
    },
    {
      paranoid: true,
      underscored: true
    }
  );

  User.getAll = (props, limit = paging.limit, offset = paging.offset) => {
    return User.findAll({
      where: props,
      offset,
      limit
    }).catch(err => {
      throw errors.databaseError;
    });
  };

  return User;
};
