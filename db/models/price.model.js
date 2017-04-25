'use strict';

const Sequelize = require(`sequelize`);
const sequelize = require(`../sequelize`);
const config = require(`../../config`);


const priceModel = sequelize.define(`price`, {

    uid : {
      type: Sequelize.UUID,
      primaryKey: true,
      defaultValue: Sequelize.UUIDV4,
    },

    // product : {
    //   model : `product`,
    //   required : false,
    // },

    value : {
      type : Sequelize.FLOAT,
      defaultValue: 0,
    },

    currency : {
      type: Sequelize.STRING,
      defaultValue : config.defaultCurrency,
    }

  }, {
    freezeTableName: true,
    underscored: true,
  }
);

module.exports = priceModel;
