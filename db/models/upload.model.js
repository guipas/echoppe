'use strict';

const Sequelize = require(`sequelize`);
const sequelize = require(`../sequelize`);

const uploadModel = sequelize.define(`upload`, {

    uid : {
      type: Sequelize.UUID,
      primaryKey: true,
      defaultValue: Sequelize.UUIDV4,
    },

    name : {
      type: Sequelize.STRING,
      allowNull: true,
    },

    description : {
      type: Sequelize.STRING,
      allowNull: true,
    },

    mimetype : {
      type: Sequelize.STRING,
      allowNull: false,
    },

    filename : {
      type: Sequelize.STRING,
      allowNull: false,
    },

    // products : {
    //   collection: `product`,
    //   via : `images`,
    // }

  }, {
    freezeTableName: true,
    underscored: true,
  }
)

module.exports = uploadModel;
