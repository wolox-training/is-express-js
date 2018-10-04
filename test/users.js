const chai = require('chai'),
  dictum = require('dictum.js'),
  server = require('./../app'),
  should = chai.should();

describe('/users POST', () => {
  it('should create user ok', () => {
    return chai
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
      });
  });
});
