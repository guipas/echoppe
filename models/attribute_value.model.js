'use strict';

const Waterline = require(`Waterline`);
const uuid      = require(`uuid`);

const AttributeValue = Waterline.Collection.extend({
  identity: `attribute_value`,
  connection: `default`,

  attributes: {

    uid : {
      type: `string`,
      primaryKey  : true,
      uuidv4      : true,
      defaultsTo  : () => uuid.v4()
    },

    value : {
      type: `string`,
      required : true,
    },

    attribute : {
      model: `attribute`,
    },

  },
});

module.exports = AttributeValue;
