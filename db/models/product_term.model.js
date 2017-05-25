'use strict';

const sequelize = require(`../sequelize`);


const productTermModel = sequelize.define(`product_term`, {

}, {
  freezeTableName: true,
  underscored: true,
});

module.exports = productTermModel;

