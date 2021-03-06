'use strict';

const moment = require('moment');
let debug = true;

module.exports = {
  init (config) {
    debug = config.debugLog === true;
  },
  log (...logs) {
    if (debug) console.log(moment().format('YY-MM-DD HH:mm:ss'), ...logs);
  },
};
