'use strict';

const Sequelize = require(`sequelize`);
const sequelize = require(`../sequelize`);


const addressModel = sequelize.define(`address`, {

    uid : {
      type: Sequelize.UUID,
      primaryKey: true,
      defaultValue: Sequelize.UUIDV4,
    },

    email : { // for order without an account
      type : Sequelize.STRING,
      allowNull : true,
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
        .then(address => this.fetchOne(address.uid))
      },
      fetchForUser (user) {
        return this.findAll({ where : { user_uid : typeof user === `object` ? user.uid : user } })
        .then(addresses => { return addresses ? addresses.map(address => address.get({ plain : true })) : [] })
      },
      fetchForCart (cartUid) {
        return this.findOne({ where : { cart_uid : cartUid } })
        .then(address => { return address ? address.get({ plain : true }) : null })
      },
      fetch (...args) {
        // return this.fetchOne(uid);
        return Reflect.apply(this.fetchOne, this, args);
      },
      fetchOne (uid, options = {}) {
        const where = { uid };
        if (options.userUid) { where.user_uid = options.userUid };
        if (options.user) { where.user_uid = typeof options.user === `object` ? options.user.uid : options.user }

        return this.find({ where })
        .then(address => { return address ? address.get({ plain : true }) : null })
      },
      modify (addressUid, values) {
        console.log(values);
        Reflect.deleteProperty(values, `uid`);
        return this.update(values, { where : { uid : addressUid } })
        .then(() => this.fetch(addressUid));
      }
    }
  }
);

module.exports = addressModel;
