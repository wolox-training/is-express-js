exports.invalidPassword = {
  statusCode: 400,
  message: 'Invalid Password'
};

exports.notUniqueEmail = {
  statusCode: 400,
  message: 'This email is already in this Database'
};

exports.invalidEmail = {
  statusCode: 400,
  message: 'Invalid Email'
};

exports.defaultError = {
  statusCode: 400,
  message: 'Default Error'
};

exports.invalidUser = {
  statusCode: 400,
  message: 'Invalid User'
};

exports.loggedUser = {
  statusCode: 400,
  message: 'User already logged'
};

exports.databaseError = {
  statusCode: 400,
  message: 'Database Error'
};

exports.tokenError = {
  statusCode: 400,
  message: 'User not logged'
};

exports.invalidToken = {
  statusCode: 400,
  message: 'Token is not valid'
};

exports.invalidAdminUser = {
  statusCode: 400,
  message: 'This user is not an Admin'
};

exports.invalidUpdate = {
  statusCode: 400,
  message: 'Some input does not match with DB'
};