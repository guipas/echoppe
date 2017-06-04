'use strict';

const seedData = require(`../db/seed.data`);
const db = require(`../db/db`);

const seed = () => {
  let prom = Promise.resolve();
  Object.keys(seedData).forEach(model => {
    prom = prom.then(() => db.models[model].bulkCreate(seedData[model]));
  })
  return prom;
}

module.exports = seed;
