'use strict';

const Sequelize = require(`sequelize`);
const sequelize = require(`../sequelize`);


const termModel = sequelize.define(`term`, {

    uid : {
      type: Sequelize.UUID,
      primaryKey: true,
      defaultValue: Sequelize.UUIDV4,
    },

    name : {
      type : Sequelize.STRING,
      allowNull : false,
    },

    order : {
      type : Sequelize.INTEGER,
      defaultValue: 0,
    },

  }, {
    freezeTableName: true,
    underscored: true,
  }
);

module.exports = termModel;
