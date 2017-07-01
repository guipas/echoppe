'use strict';

const Sequelize = require(`sequelize`);
const sequelize = require(`../sequelize`);
const status = require(`./step_fulfillment.status`);

const stepFulfillment = sequelize.define(`step_fulfillment`, {

    uid : {
      type: Sequelize.UUID,
      primaryKey: true,
      defaultValue: Sequelize.UUIDV4,
    },

    status : {
      type : Sequelize.INTEGER,
      defaultValue: status.STEP_CHOSEN,
    },

    handler : {
      type: Sequelize.STRING,
      allowNull : false,
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
    classMethods : {
      status () {
        return status;
      }
    }
  }
);

module.exports = stepFulfillment;
