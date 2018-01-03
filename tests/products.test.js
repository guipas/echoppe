'use strict';

const axios = require('axios');
const url = 'http://localhost:3000/test/';
const api = axios.create({
  baseURL: url,
});

const mongoose = require('mongoose');
const express = require('express')
let server = null;
const app = require('../app')({
  env : 'test',
  url,
  mongodbURI : process.env.ECHOPPE_TEST_MONGODBURI,
  testConfig : {
  },
  sessionUseStore : false,
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

// afterEach(() => {
//   clearCityDatabase();
// });

test('Request list of product return an empty array', () => {
  expect.assertions(3);
  return api.get('/products').then(res => {
    expect(res.data).toBeDefined();
    expect(res.data.length).toBeDefined();
    expect(res.data.length).toBe(0);
  });
});

// test('Creating a product requires to be admin')
