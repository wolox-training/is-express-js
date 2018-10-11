const errors = require('../errors');

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
      }
    },
    {
      paranoid: true,
      underscored: true
    }
  );

  User.getAll = (props, limit = 5, offset = 0) => {
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
