const uCtrl = require('./controllers/users'),
  uMW = require('./middlewares/users'),
  albumCtrl = require('./controllers/album'),
  albumMW = require('./middlewares/album');

exports.init = app => {
  app.get('/users/:page', [uMW.tokenValidation], uCtrl.printSomeUser);
  app.post('/users', [uMW.signUpValidation], uCtrl.create);
  app.post('/users/sessions', [uMW.signInValidation], uCtrl.login);
  app.post(
    '/admin/users',
    [uMW.tokenValidation, uMW.adminValidation, uMW.signUpValidation, uMW.updateValidation],
    uCtrl.createOrUpdateAdminUser
  );
  app.get('/albums', [uMW.tokenValidation], albumCtrl.printAllAlbums);
  app.get('/users/:user_id/albums', [uMW.tokenValidation], albumCtrl.printAllUserAlbums);
  app.get(
    '/users/albums/:id/photos',
    [uMW.tokenValidation, albumMW.retrieveAlbumPhotos],
    albumCtrl.printAlbumPhotos
  );
  app.post(
    '/albums/:id',
    [uMW.tokenValidation, albumMW.retrieveAlbum, albumMW.uniqueAlbumBoughtValidation],
    albumCtrl.userBuyAlbum
  );
};
