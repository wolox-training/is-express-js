<<<<<<< 0245e35d56d825ec245c3c28f1df33f6c645a844
const userController = require('./controllers/users'),
  userMiddleware = require('./middlewares/users');

exports.init = app => {
  app.get('/users/:page', [userMiddleware.tokenValidation], userController.printSomeUser);
  app.post('/users', [userMiddleware.signUpValidation], userController.create);
  app.post('/users/sessions', [userMiddleware.signInValidation], userController.login);
  app.post('/admin/users', [], );
=======
const uCtrl = require('./controllers/users'),
  uMW = require('./middlewares/users');

exports.init = app => {
  app.get('/users/:page', [uMW.tokenValidation], uCtrl.printSomeUser);
  app.post('/users', [uMW.signUpValidation], uCtrl.create);
  app.post('/users/sessions', [uMW.signInValidation], uCtrl.login);
  app.post('/admin/users', [uMW.tokenValidation, uMW.adminValidation, uMW.signUpValidation, uMW.updateValidation], uCtrl.createOrUpdateAdminUser );
>>>>>>> Add user-admin features
};
