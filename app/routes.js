const userController = require('./controllers/users'),
  userMiddleware = require('./middlewares/users');

exports.init = app => {
  app.get('/users/:page', [userMiddleware.tokenValidation], userController.printSomeUser);
  app.post('/users', [userMiddleware.signUpValidation], userController.create);
  app.post('/users/sessions', [userMiddleware.signInValidation], userController.login);
};
