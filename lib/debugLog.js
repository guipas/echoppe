'use strict';

const moment = require('moment');
let debug = true;

module.exports = {
  debug : true,
  init (config) {
    // debug = config.deug;
  },
  log (...logs) {
    if (debug) console.log(moment().format('YY-MM-DD HH:mm:ss'), ...logs);
  },
};
