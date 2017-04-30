'use strict';

const fs = require(`fs`);
const path      = require(`path`);
const models = {};
const Sequelize = require(`sequelize`);
const config = require(`../config`);
const sequelize = require(`./sequelize`);
// let sequelize = null;

// const loadModels = () => {
//   fs.readdirSync(`${__dirname}/models/`)
//   .filter(file => {
//     return file.indexOf(`./models`) !== 0;
//   })
//   .forEach(file => {
//     const model = require(path.join(`${__dirname}/models/`, file));
//     waterline.loadCollection(model);
//   });
// }

const userModel = require(`./models/user.model`);
const productModel = require(`./models/product.model`);
const priceModel = require(`./models/price.model`);
const uploadModel = require(`./models/upload.model`);
const cartModel = require(`./models/cart.model`);
const optionModel = require(`./models/option.model`);
const stepModel = require(`./models/step.model`);

require(`./relations`);

module.exports = {
  sequelize,
  models : {
    product : productModel,
    upload : uploadModel,
    user : userModel,
    price : priceModel,
    cart : cartModel,
    option : optionModel,
    step : stepModel,
  },
};
