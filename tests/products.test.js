'use strict';


const request = require('superagent');
const mongoose = require('mongoose');
const express = require('express')
const path = require('path');
const helpers = require('./helpers');
const fs = require('fs');
const util = require('util');
const fsAccess = util.promisify(fs.access);
const fsUnlink = util.promisify(fs.unlink);
let server = null;
const config = require('./config');
const app = require('../app')(config.app);

const url = config.app.url;
const adminUser = 'admin';
const adminPassword = '75f6a3399491121c';
const expressApp = express();
expressApp.use('/test', app);

const emptyDb = () => app.locals.connection.db.dropDatabase();

beforeAll(() => {
  return app.initialized
  .then(() => {
    return new Promise((res) => {
      server = expressApp.listen(config.app.port, () => {
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

test('Request list of product return an empty array', async () => {
  expect.assertions(3);

  const res = await request.get(url + '/products').accept('json');
  expect(res.status).toBe(200);
  expect(res.body).toBeDefined();
  expect(res.body.length).toBe(0);

});


test('Can not create product if not admin', async () => {
  expect.assertions(2);

  const agent = request.agent();
  const csrfRes = await agent.get(url + '/csrf');
  const csrf = csrfRes.body.csrf;

  let err = null;

  try {
    await agent.post(url + '/products').type('application/json').accept('json').send({ _csrf : csrf });
  } catch (e) {
    err = e;
  }

  expect(err).toBeDefined();
  expect(err.status).toBe(401);

});


test('Can create a simple product if admin', async () => {
  expect.assertions(16);

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

  const listRes = await request.get(url + '/products').accept('json');

  expect(listRes.status).toBe(200);
  expect(listRes.body).toBeDefined();
  expect(listRes.body.length).toBeDefined();
  expect(listRes.body.length).toBe(1);
  expect(listRes.body[0].name).toBe('t');
  expect(listRes.body[0].stock).toBe(0);
  expect(listRes.body[0].price).toBe(0);
  expect(listRes.body[0].description).toBeUndefined();

});

test('Can fetch a product given its id', async () => {
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

test('Admin can delete a product', async () => {
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

test('Admin can modify a product', async () => {
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

test('Must be admin to upload image', async () => {
  expect.assertions(3);

  const agent = request.agent();
  const { csrf } = await helpers.logInAsAdmin(agent, url, adminUser, adminPassword);

  const createRes = await helpers.createProduct(agent, url, {
    name : 't',
    _csrf : csrf,
  });

  const agent2 = request.agent();
  const csrf2 = await helpers.getCsrf(agent2, url);

  let res = null;
  let err = null;
  try {
    res = await agent2
    .post(`${url}/products/${createRes.body.id}/medias`)
    .set('csrf-token', csrf2)
    .accept('json')
    .attach('files', path.join(__dirname, `./o.png`))
  } catch (e) {
    err = e;
  }

  expect(res).toBe(null);
  expect(err).toBeDefined();
  expect(err.status).toBe(401);
});

test('Admin can upload a product image', async () => {
  expect.assertions(7);

  const agent = request.agent();
  const { csrf } = await helpers.logInAsAdmin(agent, url, adminUser, adminPassword);

  const createRes = await helpers.createProduct(agent, url, {
    name : 't',
    _csrf : csrf,
  });

  let res = null;
  try {
    res = await agent
    .post(`${url}/products/${createRes.body.id}/medias`)
    .set('csrf-token', csrf)
    .accept('json')
    .attach('files', path.join(__dirname, `./o.png`))
  } catch (e) {
    console.error(e);
  }

  expect(res).toBeDefined();

  const checkRes = await request.get(url + '/products/' + createRes.body.id).accept('json');

  expect(checkRes.body).toBeDefined();
  expect(checkRes.body.medias).toBeDefined();
  expect(checkRes.body.medias.length).toBeDefined();
  expect(checkRes.body.medias.length).toBe(1);
  expect(checkRes.body.medias[0].name).toBe(`o.png`);

  let access = false;
  const uploadedFile = path.join(__dirname, 'content', 'uploads', checkRes.body.medias[0].filename)
  try {
    await fsAccess(uploadedFile);
    access = true;
  } catch (e) {
    console.error(e);
    access = false;
  }

  expect(access).toBe(true);

  await fsUnlink(uploadedFile);
});

test('Admin can upload multiple product images', async () => {
  expect.assertions(8);

  const agent = request.agent();
  const { csrf } = await helpers.logInAsAdmin(agent, url, adminUser, adminPassword);

  const createRes = await helpers.createProduct(agent, url, {
    name : 't',
    _csrf : csrf,
  });

  let res = null;
  try {
    res = await agent
    .post(`${url}/products/${createRes.body.id}/medias`)
    .set('csrf-token', csrf)
    .accept('json')
    .attach('files', path.join(__dirname, `./o.png`))
    .attach('files', path.join(__dirname, `./o2.png`))
  } catch (e) {
    console.error(e);
  }

  expect(res).toBeDefined();

  const checkRes = await request.get(url + '/products/' + createRes.body.id).accept('json');

  expect(checkRes.body).toBeDefined();
  expect(checkRes.body.medias).toBeDefined();
  expect(checkRes.body.medias.length).toBeDefined();
  expect(checkRes.body.medias.length).toBe(2);
  expect(checkRes.body.medias[0].name).toBe(`o.png`);
  expect(checkRes.body.medias[1].name).toBe(`o2.png`);

  let access = false;
  const uploadedFile = path.join(__dirname, 'content', 'uploads', checkRes.body.medias[0].filename)
  const uploadedFile2 = path.join(__dirname, 'content', 'uploads', checkRes.body.medias[1].filename)
  try {
    await fsAccess(uploadedFile);
    await fsAccess(uploadedFile2);
    access = true;
  } catch (e) {
    console.error(e);
    access = false;
  }

  expect(access).toBe(true);

  await fsUnlink(uploadedFile);
  await fsUnlink(uploadedFile2);
});


