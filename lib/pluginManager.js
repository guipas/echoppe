'use strict';

const basicShippingPlugin = require('./plugins/basicShipping');
const basicStripePlugin = require('./plugins/basicStripe');
const basicEmailingPlugin = require('./plugins/basicEmailing');
const basicThemePlugin = require('./plugins/basicTheme');

const stepManager = require('./stepManager');
const eventManager = require('./eventManager');
const middlewareManager = require('./middlewareManager');

const plugins = [basicEmailingPlugin, basicStripePlugin, basicShippingPlugin, basicThemePlugin];


module.exports = {
  init () {
    stepManager.init(plugins);
    eventManager.init(plugins);
    middlewareManager.init(plugins);
  },
};
