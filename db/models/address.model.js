'use strict';

const Sequelize = require(`sequelize`);
const sequelize = require(`../sequelize`);


const addressModel = sequelize.define(`address`, {

    uid : {
      type: Sequelize.UUID,
      primaryKey: true,
      defaultValue: Sequelize.UUIDV4,
    },

    name : {
      type : Sequelize.STRING,
      allowNull : true,
    },

    line1 : {
      type : Sequelize.STRING,
      allowNull : false,
    },

    line2 : {
      type : Sequelize.STRING,
      allowNull : true,
    },

    state : {
      type : Sequelize.STRING,
      allowNull : true,
    },

    zipcode : {
      type : Sequelize.STRING,
      allowNull : true,
    },

    city : {
      type : Sequelize.STRING,
      allowNull : false,
    },

    country : {
      type : Sequelize.STRING,
      allowNull : false,
    },

    other : {
      type : Sequelize.STRING,
      allowNull : true,
    },


  }, {
    freezeTableName: true,
    underscored: true,
    classMethods : {
      make (address, user) {
        const userUid = typeof user === `object` ? user.uid : user;
        return this.create(Object.assign({}, address, { user_uid : userUid }))
      },
      fetchForUser (user) {
        return this.find({ where : { user_uid : user.uid } })
        .then(addresses => addresses.map(address => address.get({ plain : true })))
      },
      fetchOne (uid) {
        return this.find({ where : { uid } })
        .then(address => { return address ? address.get({ plain : true }) : null })
      },
      modify (address) {
        return this.update(address, { where : { uid : address.uid } })
        .then(() => this.fetch(address.uid));
      }
    }
  }
);

module.exports = addressModel;
