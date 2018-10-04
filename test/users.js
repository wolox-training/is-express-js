const chai = require('chai'),
  dictum = require('dictum.js'),
  server = require('./../app'),
  should = chai.should();

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
        email: 'pablolampone@wolox.com.ar',
        password: '123456789'
      })
      .then(res => {
        res.should.have.status(200);
        res.should.be.json;
        dictum.chai(res);
        done();
      })
      .catch(res => {
        res.should.have.status(400);
        done();
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
