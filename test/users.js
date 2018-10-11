const chai = require('chai'),
  dictum = require('dictum.js'),
  server = require('./../app'),
  should = chai.should();

describe('users', () => {
  describe('/users GET', () => {
    it('should print all the users', done => {
      chai
        .request(server)
        .post('/users')
        .send({
          firstName: 'ignacio',
          lastName: 'sosa',
          email: 'nacho.sosa@wolox.com.ar',
          password: '123456789'
        })
        .then(userTwo => {
          chai
            .request(server)
            .post('/users')
            .send({
              firstName: 'dante',
              lastName: 'farias',
              email: 'dante.farias@wolox.com.ar',
              password: '123456789'
            })
            .then(userThree => {
              chai
                .request(server)
                .post('/users')
                .send({
                  firstName: 'maria',
                  lastName: 'delacamara',
                  email: 'maria.dela@wolox.com.ar',
                  password: '123456789'
                })
                .then(res => {
                  chai
                    .request(server)
                    .post('/users/sessions')
                    .send({ email: 'nacho.sosa@wolox.com.ar', password: '123456789' })
                    .then(resolve => {
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
      chai
        .request(server)
        .post('/users')
        .send({
          firstName: 'ignacio',
          lastName: 'sosa',
          email: 'nacho.sosa@wolox.com.ar',
          password: '123456789'
        })
        .then(resolve => {
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
      chai
        .request(server)
        .post('/users')
        .send({
          firstName: 'ignacio',
          lastName: 'sosa',
          email: 'nacho.sosa@wolox.com.ar',
          password: '123456789'
        })
        .then(res => {
          chai
            .request(server)
            .post('/users/sessions')
            .send({ email: 'nacho.sosa@wolox.com.ar', password: '123456789' })
            .then(resolve => {
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
      chai
        .request(server)
        .post('/users')
        .send({
          firstName: 'pablo',
          lastName: 'lampone',
          email: 'pablolampone@wolox.com.ar',
          password: 'lampone84'
        })
        .then(res => {
          res.should.have.status(200);
          res.should.be.json;
          dictum.chai(res);
          done();
        });
    });
    it('should fail because of not unique email', done => {
      chai
        .request(server)
        .post('/users')
        .send({
          firstName: 'dante',
          lastName: 'farias',
          email: 'dante.farias@wolox.com.ar',
          password: '123456789'
        })
        .then(res => {
          chai
            .request(server)
            .post('/users')
            .send({
              firstName: 'dante',
              lastName: 'farias',
              email: 'dante.farias@wolox.com.ar',
              password: '123456789'
            })
            .catch(err => {
              err.should.have.status(400);
              done();
            });
        });
    });

    it('should fail because of short password', done => {
      chai
        .request(server)
        .post('/users')
        .send({
          firstName: 'dante',
          lastName: 'farias',
          email: 'dante.farias@wolox.com.ar',
          password: '123456'
        })
        .catch(res => {
          res.should.have.status(400);
          done();
        });
    });
    it('should fail because of invalid chars in password', done => {
      chai
        .request(server)
        .post('/users')
        .send({
          firstName: 'dante',
          lastName: 'farias',
          email: 'dante.farias@wolox.com.ar',
          password: '123456789$'
        })
        .catch(res => {
          res.should.have.status(400);
          done();
        });
    });
    it('should fail because of invalid email domain', done => {
      chai
        .request(server)
        .post('/users')
        .send({
          firstName: 'dante',
          lastName: 'farias',
          email: 'dante.farias@gmail.com',
          password: '123456789'
        })
        .catch(res => {
          res.should.have.status(400);
          done();
        });
    });
  });
  describe('/users/sessions POST', () => {
    it('should fail login because of invalid email', done => {
      chai
        .request(server)
        .post('/users/sessions')
        .send({ email: 'invalid', password: '1234' })
        .catch(err => {
          err.should.have.status(400);
          done();
        });
    });

    it('should fail login because of invalid password', done => {
      chai
        .request(server)
        .post('/users/sessions')
        .send({ email: 'nacho.sosa@wolox.com.ar', password: 'invalid' })
        .catch(err => {
          err.should.have.status(400);
          done();
        });
    });

    it('should be successful', done => {
      chai
        .request(server)
        .post('/users')
        .send({
          firstName: 'ignacio',
          lastName: 'sosa',
          email: 'nacho.sosa@wolox.com.ar',
          password: '123456789'
        })
        .then(res => {
          chai
            .request(server)
            .post('/users/sessions')
            .send({ email: 'nacho.sosa@wolox.com.ar', password: '123456789' })
            .then(ress => {
              ress.should.have.status(200);
              done();
            });
        });
    });
    it('should fail because user already logged in', done => {
      chai
        .request(server)
        .post('/users')
        .send({
          firstName: 'ignacio',
          lastName: 'sosa',
          email: 'nacho.sosa@wolox.com.ar',
          password: '123456789'
        })
        .then(res => {
          chai
            .request(server)
            .post('/users/sessions')
            .send({ email: 'nacho.sosa@wolox.com.ar', password: '123456789' })
            .then(resolve => {
              chai
                .request(server)
                .post('/users/sessions')
                .set('authorization', resolve.body.token)
                .send({ email: 'nacho.sosa@wolox.com.ar', password: '123456789' })
                .then(ress => {
                  ress.should.have.status(200);
                  done();
                });
            });
        });
    });
  });
});
