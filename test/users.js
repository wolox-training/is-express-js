const chai = require('chai'),
  dictum = require('dictum.js'),
  server = require('./../app'),
  nock = require('nock'),
  should = chai.should();

const testGetAlbum = nock('https://jsonplaceholder.typicode.com/albums')
  .get('/albums')
  .reply(200, {
    userId: 1,
    id: 1,
    title: 'quidem molestiae enim'
  });

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
    it.only('should print all the albums', done => {
      successfulCreate(userList.userOne).then(res => {
        successfulLogin(userList.userOne).then(ress => {
          chai
            .request(server)
            .testGetAlbum()
            .set('authorization', ress.body.token)
            .then(resp => {
              resp.should.have.status(200);
              resp.should.be.json;
              dictum.chai(resp);
              done();
            });
        });
      });
    });
  });
});
