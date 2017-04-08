'use strict';

const Waterline = require(`Waterline`);
const uuid      = require(`uuid`);

const Attribute = Waterline.Collection.extend({
  identity: `attribute`,
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

    values : {
      collection : `attribute_value`,
      via: `attribute`,
    },

  },
});

module.exports = Attribute;
