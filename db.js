'use strict';

const Waterline = require(`waterline`);

const waterline = new Waterline();
const fs = require(`fs`);
const path      = require(`path`);
const models = {};

const loadModels = () => {
  fs.readdirSync(`${__dirname}/models/`)
  .filter(file => {
    return file.indexOf(`./models`) !== 0;
  })
  .forEach(file => {
    const model = require(path.join(`${__dirname}/models/`, file));
    waterline.loadCollection(model);
  });
}



const db = {
  init : config => {
    loadModels();
    return new Promise((resolve, reject) => {
      waterline.initialize(config, (err, res) => {
        if (err) {
          console.log(`Database initialization error`);
          console.log(err);
          reject(err);
        }
        Object.keys(res.collections).forEach(collection => models[collection] = res.collections[collection]);

        return resolve({
          connection : waterline,
          models,
        });
      });
    })
  },
  models,
}



module.exports = db;
