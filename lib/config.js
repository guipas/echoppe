'use strict';


const defaultConfig = require('../default.config');


module.exports = {
  init (customConfig) {
    Object.keys(defaultConfig).forEach(key => {
      const custom = customConfig[key];
      const def = defaultConfig[key];
      this[key] = custom ? custom : def;
    });

    return this;
  },
};
