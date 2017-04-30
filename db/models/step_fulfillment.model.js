'use strict';

const Sequelize = require(`sequelize`);
const sequelize = require(`../sequelize`);

const STEP_CHOSEN = 1;
const STEP_PROCESSING = 5;
const STEP_COMPLETED = 10;


const stepFulfillment = sequelize.define(`step_fulfillment`, {

    uid : {
      type: Sequelize.UUID,
      primaryKey: true,
      defaultValue: Sequelize.UUIDV4,
    },

    status : {
      type : Sequelize.INTEGER,
      defaultValue: STEP_CHOSEN,
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
