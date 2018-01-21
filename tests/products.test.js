'use strict';

const url = 'http://localhost:3010/test';

const request = require('superagent');
const mongoose = require('mongoose');
const express = require('express')
const helpers = require('./helpers');
let server = null;
const app = require('../app')({
  env : 'test',
  url,
  mongodbURI : process.env.ECHOPPE_TEST_MONGODBURI,
  testConfig : {
  },
  sessionUseStore : false,
  adminHash : '$2a$10$mDlMToHYMK2pbjVdReBdveHCqaCGLpUu/GrBy9RK707VNQQ2dh7H6', // 75f6a3399491121c
});

const adminUser = 'admin';
const adminPassword = '75f6a3399491121c';


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
      server = expressApp.listen(3010, () => {
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

// afterEach(() => {
//   clearCityDatabase();
// });

test('Request list of product return an empty array', async () => {
  expect.assertions(3);

  const res = await request.get(url + '/products');
  expect(res.status).toBe(200);
  expect(res.body).toBeDefined();
  expect(res.body.length).toBeUndefined();

});


test('Can not create product if not admin', async () => {
  expect.assertions(4);

  const agent = request.agent();
  const csrfRes = await agent.get(url + '/csrf');
  const csrf = csrfRes.body.csrf;

  let err = null;

  try {
    await agent.post(url + '/products').type('application/json').send({ _csrf : csrf });
  } catch (e) {
    err = e;
  }

  expect(err).toBeDefined();
  expect(err.status).toBe(401);
  expect(err.response.text.indexOf(`not allowed`)).not.toBe(-1);
  expect(err.response.text.indexOf(`csrf`)).toBe(-1);

});


test('Create a product just with a name', async () => {
  expect.assertions(8);

  const agent = request.agent();
  const { csrf } = await helpers.logInAsAdmin(agent, url, adminUser, adminPassword);

  const res = await helpers.createProduct(agent, url, {
    name : 't',
    _csrf : csrf,
  });

  expect(res.status).toBe(200);
  expect(res.body).toBeDefined();
  expect(res.body._id).toBeDefined();
  expect(res.body.id).toBeDefined();
  expect(res.body.name).toBe('t');
  expect(res.body.stock).toBe(0);
  expect(res.body.price).toBe(0);
  expect(res.body.description).toBeUndefined();
});

test('fetching a product by its id', async () => {
  expect.assertions(4);

  const agent = request.agent();
  const { csrf } = await helpers.logInAsAdmin(agent, url, adminUser, adminPassword);

  const createRes = await helpers.createProduct(agent, url, {
    name : 't',
    _csrf : csrf,
  });

  const res = await request.get(url + '/products/' + createRes.body.id).accept('json');

  expect(res.status).toBe(200);
  expect(res.body).toBeDefined();
  expect(res.body._id).toBeDefined();
  expect(res.body._id).toBe(createRes.body._id);
});

test('deleting a product ', async () => {
  expect.assertions(4);

  const agent = request.agent();
  const { csrf } = await helpers.logInAsAdmin(agent, url, adminUser, adminPassword);

  const createRes = await helpers.createProduct(agent, url, {
    name : 't',
    _csrf : csrf,
  });

  const destroyRes = await agent.delete(url + '/products/' + createRes.body.id).send({ _csrf : csrf }).accept('json');

  expect(destroyRes.status).toBe(200);

  let res = null;
  try {
    res = await request.get(url + '/products/' + createRes.body.id).accept('json');
  } catch (e) {
    expect(res).toBe(null);
    expect(e).toBeDefined();
    expect(e.status).toBe(404);
  }
});

test('modifying a product ', async () => {
  expect.assertions(5);

  const agent = request.agent();
  const { csrf } = await helpers.logInAsAdmin(agent, url, adminUser, adminPassword);

  const createRes = await helpers.createProduct(agent, url, {
    name : 't',
    _csrf : csrf,
  });

  const putRes = await agent
    .put(url + '/products/' + createRes.body.id)
    .send({
      _csrf : csrf,
      name  : 'x',
    })
    .accept('json');

  expect(putRes.status).toBe(200);

  const res = await request.get(url + '/products/' + createRes.body.id).accept('json');

  expect(res).toBeDefined();
  expect(res.status).toBe(200);
  expect(res.body).toBeDefined();
  expect(res.body.name).toBe('x');
});

// test('Creating a product requires to be admin')
