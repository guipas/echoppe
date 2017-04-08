'use strict';

const Waterline = require(`Waterline`);
const bcrypt = require(`bcryptjs`);
const uuid = require(`uuid`);

const User = Waterline.Collection.extend({

  identity: `user`,
  connection: `default`,

  attributes: {

    uid: {
      type: `string`,
      primaryKey: true,
      uuidv4: true,
      defaultsTo: () => uuid.v4()
    },

    email: {
      type: `string`,
      email: true,
      required: true,
      unique: true
    },

    name: {
      type: `string`,
      required: false,
    },

    password: {
      type: `string`,
      required: true
    },

    role: {
      type: `string`,
      required: false,
      defaultsTo: () => ``,
    },

    attempts: {
      type: `integer`,
      defaultsTo: () => 0,
    },

    toJSON () {
      const obj = this.toObject();
      delete obj.password;
      return obj;
    }
  },

  beforeCreate (values, next) {

    bcrypt.genSalt(10, function (err, salt) {
      if (err) return next(err);

      bcrypt.hash(values.password, salt, function (err, hash) {
        if (err) return next(err);

        values.password = hash;
        next();
      });
    });
  }
});

module.exports = User;
