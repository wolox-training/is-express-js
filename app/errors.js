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

exports.invalidUserDB = {
  statusCode: 400,
  message: 'This user is not in the DB'
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

exports.tokenExpired = {
  statusCode: 400,
  message: 'The token has expired'
};

exports.invalidAdminUser = {
  statusCode: 400,
  message: 'This user is not an Admin'
};

exports.invalidUpdate = {
  statusCode: 400,
  message: 'Some input does not match with DB'
};

exports.notAdminUser = {
  statusCode: 400,
  message: 'You are not admin user'
};

exports.invalidUserTryingToBeAdmin = {
  statusCode: 400,
  message: 'You are not suppose to be an Admin'
};

exports.nothingFound = {
  statusCode: 404,
  message: 'There is no information'
};

exports.alreadyBought = {
  statusCode: 400,
  message: 'You have already bought this album!'
};

exports.noUserAlbum = {
  statusCode: 400,
  message: 'No user with that ID related to any Album'
};

exports.invalidUserList = {
  statusCode: 400,
  message: 'You can not ask for other users list of albums'
};

exports.invalidUserAlbum = {
  statusCode: 400,
  message: 'That user does not have that album'
};
