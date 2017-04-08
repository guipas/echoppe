'use strict';

const Waterline = require(`Waterline`);
// const bcrypt = require(`bcrypt`);
const uuid      = require(`uuid`);

const Product = Waterline.Collection.extend({
  identity: `product`,
  connection: `default`,

  attributes: {

    uid : {
      type: `string`,
      primaryKey  : true,
      uuidv4      : true,
      defaultsTo  : () => uuid.v4()
    },

    name : {
      type: `string`,
    },

    description : {
      type: `string`,
    },

    parent : {
      model : `product`,
      required : false,
    },

    root : {
      model : `product`,
      required : false,
    }


  },
});

module.exports = Product;
