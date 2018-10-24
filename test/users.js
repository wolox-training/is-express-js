const chai = require('chai'),
  dictum = require('dictum.js'),
  server = require('./../app'),
  nock = require('nock'),
  should = chai.should();

const userList = {
    adminUser: {
      firstName: 'admin',
      lastName: 'istrator',
      email: 'admin@wolox.com.ar',
      password: 'admin123',
      isAdmin: 'true'
    },
    userOne: {
      firstName: 'ignacio',
      lastName: 'sosa',
      email: 'nacho.sosa@wolox.com.ar',
      password: '123456789'
    },
    userTwo: {
      firstName: 'dante',
      lastName: 'farias',
      email: 'dante.farias@wolox.com.ar',
      password: '123456789'
    },
    userThree: {
      firstName: 'maria',
      lastName: 'delacamara',
      email: 'maria.dela@wolox.com.ar',
      password: '123456789'
    }
  },
  invalidInput = {
    invalidPassword: {
      withSymbolsCase: '123456789$',
      shortLengthCase: '123456',
      wrongPassCase: '12345678'
    },
    invalidEmail: {
      wrongDomainCase: 'example@gmail.com'
    },
    invalidFirstName: 'carlos',
    invalidLastName: 'juarez'
  },
  flag = {
    is: {
      admin: true,
      not: {
        admin: false
      }
    }
  },
  albumObjects = {
    albumOne: {
      userId: 1,
      id: 1,
      title: 'quidem molestiae enim'
    },
    albumTwo: {
      userId: 1,
      id: 2,
      title: 'sunt qui excepturi placeat culpa'
    },
    albumThree: {
      userId: 1,
      id: 3,
      title: 'omnis laborum odio'
    }
  },
  albumList = [albumObjects.albumThree, albumObjects.albumOne, albumObjects.albumTwo],
  albumIndex = {
    one: 1,
    two: 2,
    three: 3,
    notFound: 4
  },
  photoObjects = {
    albumOne: [
      {
        albumId: 1,
        id: 1,
        title: 'accusamus beatae ad facilis cum similique qui sunt',
        url: 'https://via.placeholder.com/600/92c952',
        thumbnailUrl: 'https://via.placeholder.com/150/92c952'
      },
      {
        albumId: 1,
        id: 2,
        title: 'reprehenderit est deserunt velit ipsam',
        url: 'https://via.placeholder.com/600/771796',
        thumbnailUrl: 'https://via.placeholder.com/150/771796'
      }
    ],
    albumTwo: [
      {
        albumId: 2,
        id: 3,
        title: 'officia porro iure quia iusto qui ipsa ut modi',
        url: 'https://via.placeholder.com/600/24f355',
        thumbnailUrl: 'https://via.placeholder.com/150/24f355'
      }
    ]
  },
  photoList = [{}, photoObjects.albumOne, photoObjects.albumTwo],
  photoIndex = {
    one: 1,
    two: 2,
    three: 3,
    notFound: 0
  };

const successfulLogin = u => {
    return chai
      .request(server)
      .post('/users/sessions')
      .send(u);
  },
  successfulCreate = (u, adminFlag = false) => {
    u.isAdmin = adminFlag;
    return chai
      .request(server)
      .post('/users')
      .send(u);
  },
  successfulAdminCreate = (u, adminFlag) => {
    u.isAdmin = adminFlag;
    return chai
      .request(server)
      .post('/admin/users')
      .send(u);
  },
  successfullRelationCreate = albumPage => {
    return chai.request(server).post(`/albums/${albumPage}`);
  },
  successfullGetAllAlbums = () => {
    return chai.request(server).get('/albums');
  },
  successfullAlbumNock = (albumPage = null) => {
    if (!albumPage) {
      const testGetAlbums = nock('https://jsonplaceholder.typicode.com')
        .get('/albums')
        .reply(200, albumList);
    } else if (albumPage === albumIndex.notFound) {
      const testNoneAlbum = nock('https://jsonplaceholder.typicode.com/albums')
        .get(`/${albumPage}`)
        .reply(200, {});
    } else {
      const testOneAlbum = nock('https://jsonplaceholder.typicode.com/albums')
        .get(`/${albumPage}`)
        .reply(200, albumList[albumPage]);
    }
  },
  successfullAlbumPhotoNock = albumPhoto => {
    const testGetAlbums = nock('https://jsonplaceholder.typicode.com')
      .get(`/photos?albumId=${albumPhoto}`)
      .reply(200, photoList[albumPhoto]);
  },
  wrongUserBecauseOf = reasons => {
    const wrongUser = Object.assign({}, userList.userOne);
    if (reasons === invalidInput.invalidPassword.withSymbolsCase) {
      wrongUser.password = invalidInput.invalidPassword.withSymbolsCase;
    } else if (reasons === invalidInput.invalidPassword.shortLengthCase) {
      wrongUser.password = invalidInput.invalidPassword.shortLengthCase;
    } else if (reasons === invalidInput.invalidPassword.wrongPassCase) {
      wrongUser.password = invalidInput.invalidPassword.wrongPassCase;
    } else if (reasons === invalidInput.invalidEmail.wrongDomainCase) {
      wrongUser.email = invalidInput.invalidEmail.wrongDomainCase;
    } else if (reasons === invalidInput.invalidFirstName) {
      wrongUser.firstName = invalidInput.invalidFirstName;
    } else if (reasons === invalidInput.invalidLastName) {
      wrongUser.lastName = invalidInput.invalidLastName;
    }
    return wrongUser;
  };

describe('users', () => {
  describe('/users GET', () => {
    it('should print all the users', done => {
      successfulCreate(userList.userOne).then(userTwo => {
        successfulCreate(userList.userTwo).then(userThree => {
          successfulLogin(userList.userOne).then(resolve => {
            chai
              .request(server)
              .get('/users/1')
              .set('authorization', resolve.body.token)
              .then(ress => {
                ress.should.have.status(200);
                ress.should.be.json;
                ress.body.users.length.should.equals(2);
                chai
                  .request(server)
                  .get('/users/2')
                  .set('authorization', resolve.body.token)
                  .then(resp => {
                    resp.should.have.status(200);
                    resp.should.be.json;
                    resp.body.users.length.should.equals(1);
                    dictum.chai(resp);
                    done();
                  });
              });
          });
        });
      });
    });
    it('should fail because there is no user logged', done => {
      successfulCreate(userList.userOne).then(resolve => {
        chai
          .request(server)
          .get('/users/1')
          .catch(err => {
            err.should.have.status(400);
            err.response.body.should.have.property('error');
            done();
          });
      });
    });
    it('should fail because of not token validation', done => {
      successfulCreate(userList.userOne).then(res => {
        successfulLogin(userList.userOne).then(resolve => {
          chai
            .request(server)
            .get('/users/1')
            .set('authorization', 'wrongTokenValue')
            .catch(err => {
              err.should.have.status(400);
              err.response.body.should.have.property('error');
              done();
            });
        });
      });
    });
  });
  describe('/users POST', () => {
    it('should create user ok', done => {
      successfulCreate(userList.userOne).then(res => {
        res.should.have.status(200);
        res.should.be.json;
        dictum.chai(res);
        done();
      });
    });
    it('should fail because of not unique email', done => {
      successfulCreate(userList.userOne).then(res => {
        successfulCreate(userList.userOne).catch(err => {
          err.should.have.status(400);
          done();
        });
      });
    });

    it('should fail because of short password', done => {
      successfulCreate(wrongUserBecauseOf(invalidInput.invalidPassword.shortLengthCase)).catch(res => {
        res.should.have.status(400);
        done();
      });
    });
    it('should fail because of invalid chars in password', done => {
      successfulCreate(wrongUserBecauseOf(invalidInput.invalidPassword.withSymbolsCase)).catch(res => {
        res.should.have.status(400);
        done();
      });
    });
    it('should fail because of invalid email domain', done => {
      successfulCreate(wrongUserBecauseOf(invalidInput.invalidEmail.wrongDomainCase)).catch(res => {
        res.should.have.status(400);
        done();
      });
    });
  });
  describe('/users/sessions POST', () => {
    it('should be successful', done => {
      successfulCreate(userList.userOne).then(res => {
        successfulLogin(userList.userOne).then(ress => {
          ress.should.have.status(200);
          done();
        });
      });
    });
    it('should fail because user already logged in', done => {
      successfulCreate(userList.userOne).then(res => {
        successfulLogin(userList.userOne).then(resolve => {
          successfulLogin(userList.userOne)
            .set('authorization', resolve.body.token)
            .then(ress => {
              ress.should.have.status(200);
              done();
            });
        });
      });
    });

    it('should fail login because of invalid email', done => {
      successfulLogin(wrongUserBecauseOf(invalidInput.invalidEmail.wrongDomainCase)).catch(err => {
        err.should.have.status(400);
        done();
      });
    });

    it('should fail login because of invalid password', done => {
      successfulLogin(wrongUserBecauseOf(invalidInput.invalidPassword.shortLengthCase)).catch(err => {
        err.should.have.status(400);
        done();
      });
    });
  });
  describe('/admin/users POST', () => {
    it('should create new user with isAdmin = true', done => {
      successfulLogin(userList.adminUser).then(ress => {
        successfulAdminCreate(userList.userOne, flag.is.admin)
          .set('authorization', ress.body.token)
          .then(resolve => {
            resolve.should.have.status(200);
            resolve.should.be.json;
            dictum.chai(resolve);
            done();
          });
      });
    });
    it('should create new user with isAdmin = false', done => {
      successfulLogin(userList.adminUser).then(ress => {
        successfulAdminCreate(userList.userOne, flag.is.not.admin)
          .set('authorization', ress.body.token)
          .then(resolve => {
            resolve.should.have.status(200);
            resolve.should.be.json;
            dictum.chai(resolve);
            done();
          });
      });
    });
    it('should create new user with isAdmin = undefined => true', done => {
      successfulLogin(userList.adminUser).then(ress => {
        successfulAdminCreate(userList.userOne)
          .set('authorization', ress.body.token)
          .then(resolve => {
            resolve.should.have.status(200);
            resolve.should.be.json;
            dictum.chai(resolve);
            done();
          });
      });
    });
    it('should not create user because of invalid password - short case', done => {
      successfulLogin(userList.adminUser).then(ress => {
        successfulAdminCreate(wrongUserBecauseOf(invalidInput.invalidPassword.shortLengthCase), flag.is.admin)
          .set('authorization', ress.body.token)
          .catch(err => {
            err.should.have.status(400);
            done();
          });
      });
    });
    it('should not create user because of invalid password - invalid char case', done => {
      successfulLogin(userList.adminUser).then(ress => {
        successfulAdminCreate(wrongUserBecauseOf(invalidInput.invalidPassword.withSymbolsCase), flag.is.admin)
          .set('authorization', ress.body.token)
          .catch(err => {
            err.should.have.status(400);
            done();
          });
      });
    });
    it('should not create user because of invalid email', done => {
      successfulLogin(userList.adminUser).then(ress => {
        successfulAdminCreate(wrongUserBecauseOf(invalidInput.invalidEmail.wrongDomainCase), flag.is.admin)
          .set('authorization', ress.body.token)
          .catch(err => {
            err.should.have.status(400);
            done();
          });
      });
    });
    it('should update user with original isAdmin = true', done => {
      successfulLogin(userList.adminUser).then(ress => {
        successfulAdminCreate(userList.userOne, flag.is.admin)
          .set('authorization', ress.body.token)
          .then(resss => {
            successfulAdminCreate(userList.userOne, flag.is.not.admin)
              .set('authorization', ress.body.token)
              .then(resolve => {
                resolve.should.have.status(200);
                resolve.should.be.json;
                dictum.chai(resolve);
                done();
              });
          });
      });
    });
    it('should update user with original isAdmin = false', done => {
      successfulLogin(userList.adminUser).then(ress => {
        successfulAdminCreate(userList.userOne, flag.is.not.admin)
          .set('authorization', ress.body.token)
          .then(resss => {
            successfulAdminCreate(userList.userOne, flag.is.admin)
              .set('authorization', ress.body.token)
              .then(resolve => {
                resolve.should.have.status(200);
                resolve.should.be.json;
                dictum.chai(resolve);
                done();
              });
          });
      });
    });
    it('should not update user because of wrong password', done => {
      successfulLogin(userList.adminUser).then(ress => {
        successfulAdminCreate(userList.userOne, flag.is.not.admin)
          .set('authorization', ress.body.token)
          .then(resss => {
            successfulAdminCreate(
              wrongUserBecauseOf(invalidInput.invalidPassword.wrongPassCase),
              flag.is.admin
            )
              .set('authorization', ress.body.token)
              .catch(err => {
                err.should.have.status(400);
                done();
              });
          });
      });
    });
    it('should not update user because of wrong first name', done => {
      successfulLogin(userList.adminUser).then(ress => {
        successfulAdminCreate(userList.userOne, flag.is.not.admin)
          .set('authorization', ress.body.token)
          .then(resss => {
            successfulAdminCreate(wrongUserBecauseOf(invalidInput.invalidFirstName), flag.is.admin)
              .set('authorization', ress.body.token)
              .catch(err => {
                err.should.have.status(400);
                done();
              });
          });
      });
    });
    it('should not update user because of wrong last name', done => {
      successfulLogin(userList.adminUser).then(ress => {
        successfulAdminCreate(userList.userOne, flag.is.not.admin)
          .set('authorization', ress.body.token)
          .then(resss => {
            successfulAdminCreate(wrongUserBecauseOf(invalidInput.invalidLastName), flag.is.admin)
              .set('authorization', ress.body.token)
              .catch(err => {
                err.should.have.status(400);
                done();
              });
          });
      });
    });
    it('should not update user because there is nothing to change', done => {
      successfulLogin(userList.adminUser).then(ress => {
        successfulAdminCreate(userList.userOne, flag.is.not.admin)
          .set('authorization', ress.body.token)
          .then(resss => {
            successfulAdminCreate(userList.userOne, flag.is.not.admin)
              .set('authorization', ress.body.token)
              .then(resolve => {
                resolve.should.have.status(200);
                resolve.should.have.property('text').equals('There is nothing to change!');
                dictum.chai(resolve);
                done();
              });
          });
      });
    });
    it('should fail because there is no user logged-in', done => {
      successfulLogin(userList.adminUser).then(ress => {
        successfulAdminCreate(userList.userOne, flag.is.admin).catch(err => {
          err.should.have.status(400);
          done();
        });
      });
    });
    it('should fail because not same token', done => {
      successfulLogin(userList.adminUser).then(ress => {
        successfulAdminCreate(userList.userOne, flag.is.not.admin)
          .set('authorization', 'Another token')
          .catch(err => {
            err.should.have.status(400);
            done();
          });
      });
    });
    it('should fail because the user is not Admin', done => {
      successfulCreate(userList.userTwo).then(res => {
        successfulLogin(userList.userTwo).then(ress => {
          successfulAdminCreate(userList.userOne)
            .set('authorization', ress.body.token)
            .catch(err => {
              err.should.have.status(400);
              done();
            });
        });
      });
    });
  });
  describe('/albums GET', () => {
    beforeEach(done => {
      successfullAlbumNock();
      done();
    });
    it('should print all the albums', done => {
      successfulCreate(userList.userOne).then(res => {
        successfulLogin(userList.userOne).then(ress => {
          successfullGetAllAlbums()
            .set('authorization', ress.body.token)
            .then(resp => {
              resp.should.have.status(200);
              resp.should.be.json;
              resp.body.albums.length.should.equals(albumList.length);
              dictum.chai(resp);
              done();
            });
        });
      });
    });
    it('should not print because no user logged', done => {
      successfulCreate(userList.userOne).then(res => {
        successfulLogin(userList.userOne).then(ress => {
          successfullGetAllAlbums().catch(resp => {
            resp.should.have.status(400);
            done();
          });
        });
      });
    });
  });
  describe('/albums/:id POST', () => {
    beforeEach(done => {
      successfullAlbumNock(albumIndex.one);
      done();
    });
    it('should create a relation of user-album', done => {
      successfulCreate(userList.userOne).then(res => {
        successfulLogin(userList.userOne).then(ress => {
          successfullRelationCreate(albumIndex.one)
            .set('authorization', ress.body.token)
            .then(resp => {
              resp.should.have.status(200);
              resp.should.be.json;
              resp.body.newRelation.userId.should.equals(res.body.newUser.id);
              dictum.chai(resp);
              done();
            });
        });
      });
    });
    it('should create two relations of user-album', done => {
      successfulCreate(userList.userOne).then(res => {
        successfulLogin(userList.userOne).then(ress => {
          successfullRelationCreate(albumIndex.one)
            .set('authorization', ress.body.token)
            .then(resss => {
              resss.should.have.status(200);
              resss.body.newRelation.userId.should.equals(res.body.newUser.id);
              successfullAlbumNock(albumIndex.two);
              successfullRelationCreate(albumIndex.two)
                .set('authorization', ress.body.token)
                .then(resp => {
                  resp.should.have.status(200);
                  resp.should.be.json;
                  resp.body.newRelation.userId.should.equals(res.body.newUser.id);
                  dictum.chai(resp);
                  done();
                });
            });
        });
      });
    });
    it('should fail because user already bougth that album', done => {
      successfulCreate(userList.userOne).then(res => {
        successfulLogin(userList.userOne).then(ress => {
          successfullRelationCreate(albumIndex.one)
            .set('authorization', ress.body.token)
            .then(resss => {
              resss.should.have.status(200);
              resss.body.newRelation.userId.should.equals(res.body.newUser.id);
              successfullAlbumNock(albumIndex.one);
              successfullRelationCreate(albumIndex.one)
                .set('authorization', ress.body.token)
                .catch(err => {
                  err.should.have.status(400);
                  done();
                });
            });
        });
      });
    });
    it('should fail because user not logged', done => {
      successfulCreate(userList.userOne).then(res => {
        successfulLogin(userList.userOne).then(ress => {
          successfullRelationCreate(albumIndex.one).catch(err => {
            err.should.have.status(400);
            done();
          });
        });
      });
    });
    it('should fail because the albumId does not exist', done => {
      successfullAlbumNock(albumIndex.notFound);
      successfulCreate(userList.userOne).then(res => {
        successfulLogin(userList.userOne).then(ress => {
          successfullRelationCreate(albumIndex.notFound)
            .set('authorization', ress.body.token)
            .catch(err => {
              err.should.have.status(404);
              done();
            });
        });
      });
    });
  });
  describe('/users/:user_id/albums GET', () => {
    it('should get all albums case isAdmin false', done => {
      successfulCreate(userList.userOne).then(res => {
        successfulLogin(userList.userOne).then(ress => {
          successfullAlbumNock(albumIndex.one);
          successfullRelationCreate(albumIndex.one)
            .set('authorization', ress.body.token)
            .then(resss => {
              successfullAlbumNock(albumIndex.two);
              successfullRelationCreate(albumIndex.two)
                .set('authorization', ress.body.token)
                .then(ressss => {
                  chai
                    .request(server)
                    .get(`/users/${res.body.newUser.id}/albums`)
                    .set('authorization', ress.body.token)
                    .then(resp => {
                      resp.should.have.status(200);
                      resp.should.be.json;
                      resp.body.list.length.should.equals(2);
                      dictum.chai(resp);
                      done();
                    });
                });
            });
        });
      });
    });
    it('should get all albums case isAdmin true', done => {
      successfulLogin(userList.adminUser).then(admin => {
        successfulAdminCreate(userList.userOne, flag.is.admin)
          .set('authorization', admin.body.token)
          .then(userOneAdmin => {
            successfulLogin(userList.userOne).then(userOneAdminLogged => {
              successfulCreate(userList.userTwo).then(userTwoNotAdmin => {
                successfulLogin(userList.userTwo).then(userTwoNotAdminLogged => {
                  successfullAlbumNock(albumIndex.one);
                  successfullRelationCreate(albumIndex.one)
                    .set('authorization', userTwoNotAdminLogged.body.token)
                    .then(firstRelation => {
                      successfullAlbumNock(albumIndex.two);
                      successfullRelationCreate(albumIndex.two)
                        .set('authorization', userTwoNotAdminLogged.body.token)
                        .then(secondRelation => {
                          chai
                            .request(server)
                            .get(`/users/${userTwoNotAdmin.body.newUser.id}/albums`)
                            .set('authorization', userOneAdminLogged.body.token)
                            .then(resp => {
                              resp.should.have.status(200);
                              resp.should.be.json;
                              resp.body.list.length.should.equals(2);
                              userTwoNotAdmin.body.newUser.id.should.not.equals(userOneAdmin.body.newUser.id);
                              dictum.chai(resp);
                              done();
                            });
                        });
                    });
                });
              });
            });
          });
      });
    });
    it('should fail because different id and not admin', done => {
      successfulCreate(userList.userOne).then(userOneNotAdmin => {
        successfulLogin(userList.userOne).then(userOneNotAdminLogged => {
          successfulCreate(userList.userTwo).then(userTwoNotAdmin => {
            successfulLogin(userList.userTwo).then(userTwoNotAdminLogged => {
              successfullAlbumNock(albumIndex.one);
              successfullRelationCreate(albumIndex.one)
                .set('authorization', userTwoNotAdminLogged.body.token)
                .then(firstRelation => {
                  successfullAlbumNock(albumIndex.two);
                  successfullRelationCreate(albumIndex.two)
                    .set('authorization', userTwoNotAdminLogged.body.token)
                    .then(secondRelation => {
                      chai
                        .request(server)
                        .get(`/users/${userTwoNotAdmin.body.newUser.id}/albums`)
                        .set('authorization', userOneNotAdminLogged.body.token)
                        .catch(err => {
                          err.should.have.status(400);
                          userTwoNotAdmin.body.newUser.id.should.not.equals(userOneNotAdmin.body.newUser.id);
                          done();
                        });
                    });
                });
            });
          });
        });
      });
    });
    it('should fail because userid is not in relation table', done => {
      successfulCreate(userList.userOne).then(userOneNotAdmin => {
        successfulLogin(userList.userOne).then(userOneNotAdminLogged => {
          successfulCreate(userList.userTwo).then(userTwoNotAdmin => {
            successfulLogin(userList.userTwo).then(userTwoNotAdminLogged => {
              successfullAlbumNock(albumIndex.one);
              successfullRelationCreate(albumIndex.one)
                .set('authorization', userTwoNotAdminLogged.body.token)
                .then(firstRelation => {
                  successfullAlbumNock(albumIndex.two);
                  successfullRelationCreate(albumIndex.two)
                    .set('authorization', userTwoNotAdminLogged.body.token)
                    .then(secondRelation => {
                      chai
                        .request(server)
                        .get(`/users/${userOneNotAdmin.body.newUser.id}/albums`)
                        .set('authorization', userOneNotAdminLogged.body.token)
                        .catch(err => {
                          err.should.have.status(400);
                          done();
                        });
                    });
                });
            });
          });
        });
      });
    });
  });
  describe('/users/albums/:id/photos GET', () => {
    it('should get all photos of an Album', done => {
      successfulCreate(userList.userOne).then(userOneNotAdmin => {
        successfulLogin(userList.userOne).then(userOneNotAdminLogged => {
          successfullAlbumNock(albumIndex.one);
          successfullRelationCreate(albumIndex.one)
            .set('authorization', userOneNotAdminLogged.body.token)
            .then(firstRelation => {
              successfullAlbumNock(albumIndex.two);
              successfullRelationCreate(albumIndex.two)
                .set('authorization', userOneNotAdminLogged.body.token)
                .then(secondRelation => {
                  successfullAlbumPhotoNock(photoIndex.one);
                  chai
                    .request(server)
                    .get(`/users/albums/${photoIndex.one}/photos`)
                    .set('authorization', userOneNotAdminLogged.body.token)
                    .then(resp => {
                      resp.should.have.status(200);
                      resp.should.be.json;
                      resp.body.photoList.length.should.equals(photoList[photoIndex.one].length);
                      dictum.chai(resp);
                      done();
                    });
                });
            });
        });
      });
    });
    it('should fail because user do not have that album', done => {
      successfulCreate(userList.userOne).then(userOneNotAdmin => {
        successfulCreate(userList.userTwo).then(usertwoNotAdmin => {
          successfulLogin(userList.userOne).then(userOneNotAdminLogged => {
            successfulLogin(userList.userTwo).then(usertwoNotAdminLogged => {
              successfullAlbumNock(albumIndex.one);
              successfullRelationCreate(albumIndex.one)
                .set('authorization', userOneNotAdminLogged.body.token)
                .then(firstRelation => {
                  successfullAlbumNock(albumIndex.two);
                  successfullRelationCreate(albumIndex.two)
                    .set('authorization', userOneNotAdminLogged.body.token)
                    .then(secondRelation => {
                      successfullAlbumPhotoNock(photoIndex.one);
                      chai
                        .request(server)
                        .get(`/users/albums/${photoIndex.one}/photos`)
                        .set('authorization', usertwoNotAdminLogged.body.token)
                        .catch(err => {
                          err.should.have.status(400);
                          done();
                        });
                    });
                });
            });
          });
        });
      });
    });
    it('should fail because admin do not have that album', done => {
      successfulCreate(userList.userOne).then(userOneNotAdmin => {
        successfulLogin(userList.adminUser).then(adminuserLogged => {
          successfulAdminCreate(userList.userTwo, flag.is.admin)
            .set('authorization', adminuserLogged.body.token)
            .then(userTwoAdmin => {
              successfulLogin(userList.userOne).then(userOneNotAdminLogged => {
                successfulLogin(userList.userTwo).then(usertwoAdminLogged => {
                  successfullAlbumNock(albumIndex.one);
                  successfullRelationCreate(albumIndex.one)
                    .set('authorization', userOneNotAdminLogged.body.token)
                    .then(firstRelation => {
                      successfullAlbumNock(albumIndex.two);
                      successfullRelationCreate(albumIndex.two)
                        .set('authorization', userOneNotAdminLogged.body.token)
                        .then(secondRelation => {
                          successfullAlbumPhotoNock(photoIndex.one);
                          chai
                            .request(server)
                            .get(`/users/albums/${photoIndex.one}/photos`)
                            .set('authorization', usertwoAdminLogged.body.token)
                            .catch(err => {
                              err.should.have.status(400);
                              userTwoAdmin.body.newUser.isAdmin.should.be.equals(flag.is.admin);
                              done();
                            });
                        });
                    });
                });
              });
            });
        });
      });
    });
    it('should fail because the album is not related to any user', done => {
      successfulCreate(userList.userOne).then(userOneNotAdmin => {
        successfulLogin(userList.userOne).then(userOneNotAdminLogged => {
          successfullAlbumNock(albumIndex.one);
          successfullRelationCreate(albumIndex.one)
            .set('authorization', userOneNotAdminLogged.body.token)
            .then(firstRelation => {
              successfullAlbumPhotoNock(photoIndex.two);
              chai
                .request(server)
                .get(`/users/albums/${photoIndex.two}/photos`)
                .set('authorization', userOneNotAdminLogged.body.token)
                .catch(err => {
                  err.should.have.status(400);
                  done();
                });
            });
        });
      });
    });
  });
});
