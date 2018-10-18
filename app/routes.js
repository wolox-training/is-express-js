const uCtrl = require('./controllers/users'),
  uMW = require('./middlewares/users'),
  albumCtrl = require('./controllers/album');

exports.init = app => {
  app.get('/users/:page', [uMW.tokenValidation], uCtrl.printSomeUser);
  app.post('/users', [uMW.signUpValidation], uCtrl.create);
  app.post('/users/sessions', [uMW.signInValidation], uCtrl.login);
  app.post(
    '/admin/users',
    [uMW.tokenValidation, uMW.adminValidation, uMW.signUpValidation, uMW.updateValidation],
    uCtrl.createOrUpdateAdminUser
  );
  app.get('/albums', [uMW.tokenValidation], uCtrl.printAllAlbums);
  app.post('/albums/:id', [uMW.tokenValidation], albumCtrl.userBuyAlbum);
};
