'use strict';

const _ = require(`lodash`);
const log = require('./debugLog').log;

const middlewares = [];

module.exports = {
  init (plugins) {
    plugins.forEach(plugin => {
      if (plugin.middlewares) {
        middlewares.push(...plugin.middlewares);
      }
    })
  },
  getMiddlewares (route, method, position) {
    const currentMiddlewares = middlewares
    .filter(m =>
      m.route === route &&
      m.method === method &&
      m.position === position
    )
    .sort((a, b) => a.priority - b.priority);

    return currentMiddlewares.map(m => m.fn);
  },
};
