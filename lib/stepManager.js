'use strict';

const _ = require('lodash');
const basicShippingPlugin = require('./plugins/basicShipping');
const basicStripePlugin = require('./plugins/basicStripe');

const plugins = [basicShippingPlugin, basicStripePlugin];
const handlers = _.flatten(_.map(plugins, `stepHandlers`));


module.exports = {
  getHandler (handlerName) {
    return _.find(handlers, { name : handlerName });
  },
  getPossibleHandlers (stepName) {
    return _.filter(handlers, { step : stepName });
  },
}
