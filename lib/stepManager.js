'use strict';

const _ = require('lodash');

let handlers = [];

module.exports = {
  init (plugins) {
    handlers = _(plugins).map(`stepHandlers`).compact().flatten().value();
  },
  getHandler (handlerName) {
    return _.find(handlers, { name : handlerName });
  },
  getPossibleHandlers (stepName) {
    return _.filter(handlers, { step : stepName });
  },
}
