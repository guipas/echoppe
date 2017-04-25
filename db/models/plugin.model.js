'use strict';

const Sequelize = require(`sequelize`);
const sequelize = require(`../sequelize`);


const pluginModel = sequelize.define(`plugin`, {

    uid : {
      type: Sequelize.UUID,
      primaryKey: true,
      defaultValue: Sequelize.UUIDV4,
    },

    name : {
      type: Sequelize.STRING,
      allowNull : false,
    },

  }, {
    freezeTableName: true,
    underscored: true,
    
  }
);

module.exports = pluginModel;
