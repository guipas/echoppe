'use strict';

const Sequelize = require(`sequelize`);
const sequelize = require(`../sequelize`);


const stepModel = sequelize.define(`step`, {

  uid: {
    type: Sequelize.UUID,
    primaryKey: true,
    defaultValue: Sequelize.UUIDV4,
  },

  activated : {
    type: Sequelize.BOOLEAN,
    defaultValue : true,
  }

  }, {
    freezeTableName: true,
    underscored: true,
  }
);

module.exports = stepModel;
