const uCtrl = require('./controllers/users'),
  uMW = require('./middlewares/users');

exports.init = app => {
  app.get('/users/:page', [uMW.tokenValidation], uCtrl.printSomeUser);
  app.get('/albums', [uMW.tokenValidation], uCtrl.printAllAlbums);
  app.post('/users', [uMW.signUpValidation], uCtrl.create);
  app.post('/users/sessions', [uMW.signInValidation], uCtrl.login);
  app.post(
    '/admin/users',
    [uMW.tokenValidation, uMW.adminValidation, uMW.signUpValidation, uMW.updateValidation],
    uCtrl.createOrUpdateAdminUser
  );
};
