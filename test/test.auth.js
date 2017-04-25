'use strict';

const chai = require(`chai`);
const should = chai.should();
const chaiHttp = require(`chai-http`);
const passportStub = require(`passport-stub`);
const db = require(`../db/db`);
const memoryAdapter = require(`sails-memory`);
const fixtures = require(`./fixtures.auth.js`);
const config = require('../config.js');
config.csrf = false;
const server = require(`../app`);

chai.use(chaiHttp);
passportStub.install(server);

const tests = {};


describe(`routes : auth`, () => {

  before(() => {
    return db.init({
      adapters : {
        default : memoryAdapter,
        memory  : memoryAdapter,
      },
      connections : {
        default : {
          adapter : `memory`,
        },
      },
      defaults : {
        migrate : `drop`,
      },
    })
    .then(o => {
      // console.log(o);
      return (tests.dbConn = o.connection) && (tests.models = o.models)
    })
  });

  beforeEach(() => {
    passportStub.logout();
    // return knex.migrate.rollback();
    return Promise.all(Object.keys(fixtures).map(modelName => {
      const model = tests.models[modelName];
      if (model === undefined) {
        throw new Error('[beforeEach] Unknown model "' + modelName + '"');
      }

      return model.create(fixtures[modelName]);
    }))
    .catch(e =>
      console.error(e)
    )
  });

  after(() => {
    tests.models = {};
    return new Promise(resolve => tests.dbConn.teardown(resolve));
  });

  afterEach(() => Promise.all(Object.keys(tests.models).map(model => tests.models[model].destroy())))

  describe(`POST /auth/register`, () => {
    it(`should register a new user`, (done) => {
      chai.request(server)
      .post(`/auth/register`)
      .set(`accept`, `application/json`)
      .send({
        email: `test@guipss.com`,
        password: `testtest`
      })
      .end((err, res) => {
        should.not.exist(err);
        res.redirects.length.should.eql(0);
        res.status.should.eql(200);
        res.type.should.eql(`application/json`);
        res.body.status.should.eql(`success`);
        done();
      });
    });
    it(`should throw an error if a user is logged in`, (done) => {
      passportStub.login({
        email: `test@guipss.com`,
        password: `testtest`
      });
      chai.request(server)
      .post(`/auth/register`)
      .send({
        email: `test@guipss.com`,
        password: `testtest`
      })
      .end((err, res) => {
        should.exist(err);
        res.redirects.length.should.eql(0);
        res.status.should.eql(401);
        res.type.should.eql(`application/json`);
        res.body.status.should.eql(`You are already logged in`);
        done();
      });
    });
    it(`should throw an error if the password is < 6 characters`, (done) => {
      chai.request(server)
      .post(`/auth/register`)
      .send({
        email: `test@guipss.com`,
        password: `six`
      })
      .end((err, res) => {
        should.exist(err);
        res.redirects.length.should.eql(0);
        res.status.should.eql(400);
        res.type.should.eql(`application/json`);
        res.body.status.should.eql(`Password must be longer than 6 characters`);
        done();
      });
    });
  });

  describe(`POST /auth/login`, () => {
    it(`should login a user`, (done) => {
      chai.request(server)
      .post(`/auth/login`)
      .send({
        email: `user1@localhost.com`,
        password: `xxx`
      })
      .end((err, res) => {
        should.not.exist(err);
        res.redirects.length.should.eql(0);
        res.status.should.eql(200);
        res.type.should.eql(`application/json`);
        res.body.status.should.eql(`success`);
        done();
      });
    });
    it(`should not login an unregistered user`, (done) => {
      chai.request(server)
      .post(`/auth/login`)
      .send({
        email: `test@guipss.com`,
        password: `johnson123`
      })
      .end((err, res) => {
        should.exist(err);
        res.redirects.length.should.eql(0);
        res.status.should.eql(404);
        res.type.should.eql(`application/json`);
        res.body.status.should.eql(`User not found`);
        done();
      });
    });
    it(`should throw an error if a user is logged in`, (done) => {
      passportStub.login({
        email: `test@guipss.com`,
        password: `johnson123`
      });
      chai.request(server)
      .post(`/auth/login`)
      .send({
         email: `test@guipss.com`,
         password: `johnson123`
      })
      .end((err, res) => {
        should.exist(err);
        res.redirects.length.should.eql(0);
        res.status.should.eql(401);
        res.type.should.eql(`application/json`);
        res.body.status.should.eql(`You are already logged in`);
        done();
      });
    });
  });

  describe(`GET /auth/logout`, () => {
    it(`should logout a user`, (done) => {
      passportStub.login({
        username: `jeremy`,
        password: `johnson123`
      });
      chai.request(server)
      .get(`/auth/logout`)
      .end((err, res) => {
        should.not.exist(err);
        res.redirects.length.should.eql(0);
        res.status.should.eql(200);
        res.type.should.eql(`application/json`);
        res.body.status.should.eql(`success`);
        done();
      });
    });
    it(`should throw an error if a user is not logged in`, (done) => {
      chai.request(server)
      .get(`/auth/logout`)
      .end((err, res) => {
        should.exist(err);
        res.redirects.length.should.eql(0);
        res.status.should.eql(401);
        res.type.should.eql(`application/json`);
        res.body.status.should.eql(`Please log in`);
        done();
      });
    });
  });

  describe(`GET /auth/user`, () => {
    it(`should return a success`, (done) => {
      passportStub.login({
        email: `test@guipss.com`,
        password: `johnson123`
      });
      chai.request(server)
      .get(`/auth/user`)
      .end((err, res) => {
        should.not.exist(err);
        res.redirects.length.should.eql(0);
        res.status.should.eql(200);
        res.type.should.eql(`application/json`);
        res.body.status.should.eql(`success`);
        done();
      });
    });
    it(`should throw an error if a user is not logged in`, (done) => {
      chai.request(server)
      .get(`/auth/user`)
      .end((err, res) => {
        should.exist(err);
        res.redirects.length.should.eql(0);
        res.status.should.eql(401);
        res.type.should.eql(`application/json`);
        res.body.status.should.eql(`Please log in`);
        done();
      });
    });
  });

  describe(`GET /admin`, () => {
    it(`should return a success`, (done) => {
      passportStub.login({
        email: `user1@localhost.com`,
        password: `xxx`,
        role : `admin`,
      });
      chai.request(server)
      .get(`/admin`)
      .end((err, res) => {
        should.not.exist(err);
        res.redirects.length.should.eql(0);
        res.status.should.eql(200);
        res.type.should.eql(`application/json`);
        res.body.status.should.eql(`success`);
        done();
      });
    });
    it(`should throw an error if a user is not logged in`, (done) => {
      chai.request(server)
      .get(`/auth/user`)
      .end((err, res) => {
        should.exist(err);
        res.redirects.length.should.eql(0);
        res.status.should.eql(401);
        res.type.should.eql(`application/json`);
        res.body.status.should.eql(`Please log in`);
        done();
      });
    });
    it(`should throw an error if a user is not an admin`, (done) => {
      passportStub.login({
        email: `test@guipss.com`,
        password: `johnson123`
      });
      chai.request(server)
      .get(`/admin`)
      .end((err, res) => {
        should.exist(err);
        res.redirects.length.should.eql(0);
        res.status.should.eql(401);
        res.type.should.eql(`application/json`);
        res.body.status.should.eql(`You are not authorized`);
        done();
      });
    });
  });

});