'use strict';

const Sequelize = require(`sequelize`);
const sequelize = require(`../sequelize`);


const stepFulfillment = sequelize.define(`step_fulfillment`, {

    uid : {
      type: Sequelize.UUID,
      primaryKey: true,
      defaultValue: Sequelize.UUIDV4,
    },

    infos : {
      type: Sequelize.STRING,
      defaultValue : `{}`,
      get () { return JSON.parse(this.getDataValue(`infos`)); },
      set (val) { this.setDataValue(`infos`, JSON.stringify(val)); }
    }

  }, {
    freezeTableName: true,
    underscored: true,

  }
);

module.exports = stepFulfillment;
