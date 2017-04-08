'use strict';

const uuid = require(`uuid`);

const fixtures = {};

fixtures.user = [
  {
    uid : uuid.v4(),
    name : `n1`,
    password : `xxx`,
    email : `user1@localhost.com`,
    role : `admin`,
  }
]

module.exports = fixtures;
