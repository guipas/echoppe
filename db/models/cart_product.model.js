'use strict';

const Sequelize = require(`sequelize`);
const sequelize = require(`../sequelize`);


const cartProductModel = sequelize.define(`cart_product`, {

  quantity: {
    type: Sequelize.INTEGER,
    defaultValue: 1,
  }

}, {
  freezeTableName: true,
  underscored: true,
});

module.exports = cartProductModel;