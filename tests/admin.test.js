'use strict';

const url = 'http://localhost:3000/test';
const request = require('superagent');

const mongoose = require('mongoose');
const express = require('express')
let server = null;
const app = require('../app')({
  env : 'development',
  url,
  mongodbURI : process.env.ECHOPPE_TEST_MONGODBURI,
  testConfig : {
  },
  sessionUseStore : false,
  adminHash : '$2a$10$mDlMToHYMK2pbjVdReBdveHCqaCGLpUu/GrBy9RK707VNQQ2dh7H6', // 75f6a3399491121c
});


const expressApp = express();
expressApp.use((req, res, next) => {
  res.header("Access-Control-Allow-Origin", "*");
  next();
})
expressApp.use('/test', app);

const emptyDb = () => app.locals.connection.db.dropDatabase();


beforeAll(() => {
  return app.initialized
  .then(() => {
    return new Promise((res) => {
      server = expressApp.listen(3000, () => {
        res();
      })
    })
  })
  .then(() => emptyDb())
});

afterAll(() => {
  return emptyDb()
  .then(() => {
    server.close();
    return mongoose.disconnect();
  })
});

beforeEach(() => {
  emptyDb();
});


test('Accessing admin without being logged in returns a 401', async () => {
  expect.assertions(2);

  let err = null;

  try {
    await request.get(url + '/admin');
  } catch (e) {
    err = e;
  }

  expect(err).toBeDefined();
  expect(err.status).toBe(401);


});


test('Get csrf token', async () => {
  expect.assertions(3);

  const res = await request.get(url + '/csrf');

  expect(res.body).toBeDefined();
  expect(res.body.csrf).toBeDefined();
  expect(res.body.csrf.length).toBeGreaterThan(0);
});

test('Logging as admin grants access to admin section', async () => {
  expect.assertions(1);

  const agent = request.agent();

  const csrfReq = await agent.get(url + '/csrf');
  const csrf = csrfReq.body.csrf;

  const adminReq = await agent.post(url + '/admin/login').send({
    user : 'admin',
    password : '75f6a3399491121c',
    _csrf : csrf,
  });

  expect(adminReq.status).toBe(200);
});


// test('Creating a product requires to be admin')
