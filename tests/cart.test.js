'use strict';

const request = require('superagent');
const mongoose = require('mongoose');
const express = require('express')
const helpers = require('./helpers');
const port = 3011;
const config = require('./config')({ port });

let server = null;
const app = require('../app')(config.app);
const expressApp = express();
expressApp.use('/test', app);

let product = null;

const emptyDb = () => app.locals.connection.db.dropDatabase();

beforeAll(() => {
  return app.initialized
  .then(() => {
    return new Promise(res => {
      server = expressApp.listen(port, () => res());
    });
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
  return emptyDb()
  .then(() => {
    const agent = request.agent();
    return helpers.loginAndCreateProduct({
      agent,
      username : config.adminUser,
      password : config.adminPassword,
      url : config.app.url,
    });
  })
  .then(res => {
    product = res.product;
  })
});

test('Add product to the cart', async () => {
  expect.assertions(5);

  const agent = request.agent();
  const _csrf = await helpers.getCsrf(agent, config.app.url);

  const postResponse = await agent.post(config.app.url + '/cart/products/' + product.id).accept('json').send({ _csrf });

  expect(postResponse).toBeDefined();
  expect(postResponse.status).toBe(200);
  expect(postResponse.body).toBeDefined();
  expect(postResponse.body.content).toBeDefined();
  expect(postResponse.body.content.length).toBe(1);
});

test('Modify quantity of product in cart', async () => {
  expect.assertions(8);
  const agent = request.agent();
  const _csrf = await helpers.getCsrf(agent, config.app.url);

  await agent.post(config.app.url + '/cart/products/' + product.id).accept('json').send({ _csrf });

  const putResponse = await agent.put(config.app.url + '/cart/products/' + product.id).accept('json').send({ _csrf, quantity : 2 });

  expect(putResponse).toBeDefined();
  expect(putResponse.status).toBe(200);

  const getResponse = await agent.get(config.app.url + '/cart').accept('json');

  expect(getResponse).toBeDefined();
  expect(getResponse.status).toBe(200);
  expect(getResponse.body).toBeDefined();
  expect(getResponse.body.content).toBeDefined();
  expect(getResponse.body.content.length).toBe(1);
  expect(getResponse.body.content[0].quantity).toBe(2);
});

test('User can not modify cart directly', async () => {
  expect.assertions(2);

  const agent = request.agent();
  const _csrf = await helpers.getCsrf(agent, config.app.url);

  const postResponse = await agent.post(config.app.url + '/cart/products/' + product.id).accept('json').send({ _csrf });

  const cartId = postResponse.body.id;

  await agent.put(config.app.url + '/carts/' + cartId)
  .send({ _csrf })
  .accept('json')
  .catch(err => {
    expect(err).toBeDefined();
    expect(err.response.status).toBe(401)
  })
});

test('Admin can modify cart directly', async () => {
  expect.assertions(4);

  const agent = request.agent();
  const _csrf = await helpers.getCsrf(agent, config.app.url);

  const postResponse = await agent.post(config.app.url + '/cart/products/' + product.id).accept('json').send({ _csrf });

  const cartId = postResponse.body.id;

  const adminAgent = request.agent();
  const res = await helpers.logInAsAdmin(adminAgent, config.app.url, config.adminUser, config.adminPassword);

  await adminAgent.put(config.app.url + '/carts/' + cartId)
  .send({ _csrf : res.csrf, state : 99 })
  .then(res => {
    expect(res).toBeDefined();
    expect(res.status).toBeDefined();
    expect(res.body).toBeDefined();
    expect(res.body.state).toBe(99);
  });


});

