// const controller = require('./controllers/controller');
const userController = require('./controllers/users');
const userMiddleware = require('./middlewares/users');

exports.init = app => {
  // app.get('/endpoint/get/path', [], controller.methodGET);
  // app.put('/endpoint/put/path', [], controller.methodPUT);
  app.post('/users', [userMiddleware.signUpValidation], userController.create);
  app.post('/users/sessions', [userMiddleware.signInValidation], userController.login);
};
