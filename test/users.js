const chai = require('chai'),
  dictum = require('dictum.js'),
  server = require('./../app'),
  should = chai.should();

const userList = {
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
      shortLengthCase: '123456'
    },
    invalidEmail: {
      wrongDomainCase: 'example@gmail.com'
    }
  };

const successfulLogin = u => {
    return chai
      .request(server)
      .post('/users/sessions')
      .send(u);
  },
  successfulCreate = u => {
    return chai
      .request(server)
      .post('/users')
      .send(u);
  },
  wrongUserBecauseOf = reasons => {
    const wrongUser = Object.assign({}, userList.userOne);
    if (reasons === invalidInput.invalidPassword.withSymbolsCase) {
      wrongUser.password = invalidInput.invalidPassword.withSymbolsCase;
    } else if (reasons === invalidInput.invalidPassword.shortLengthCase) {
      wrongUser.password = invalidInput.invalidPassword.shortLengthCase;
    } else if (reasons === invalidInput.invalidEmail.wrongDomainCase) {
      wrongUser.email = invalidInput.invalidEmail.wrongDomainCase;
    }
    return wrongUser;
  };

describe('users', () => {
  describe('/users GET', () => {
    it('should print all the users', done => {
      successfulCreate(userList.userOne).then(userTwo => {
        successfulCreate(userList.userTwo).then(userThree => {
          successfulCreate(userList.userThree).then(res => {
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
                      dictum.chai(res);
                      done();
                    });
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
});
