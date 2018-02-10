'use strict';

const basicShippingPlugin = require('./plugins/basicShipping');
const basicStripePlugin = require('./plugins/basicStripe');
const basicEmailingPlugin = require('./plugins/basicEmailing');

const stepManager = require('./stepManager');
const eventManager = require('./eventManager');

const plugins = [basicEmailingPlugin, basicStripePlugin, basicShippingPlugin];


module.exports = {
  init () {
    stepManager.init(plugins);
    eventManager.init(plugins);
  },
};
