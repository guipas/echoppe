'use strict';

const sequelize = require(`../sequelize`);


const uploadProductModel = sequelize.define(`upload_product`, {}, {
  freezeTableName: true,
  underscored: true,
});

module.exports = uploadProductModel;
