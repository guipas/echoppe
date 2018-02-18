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
  call (route, before, req, res, next) {
    const currentMiddlewares = middlewares
      .filter(m => m.route === route && (before && m.priority < 0 || !before && m.priority >= 0))
      .sort((a, b) => a.priority - b.priority);

      let prom = Promise.resolve();
      currentMiddlewares.forEach(middleware => {
        prom = prom.then(() => middleware.fn(req, res, e => {

        }))
      })

  },
  getMiddlewares (route, before, method) {
    const currentMiddlewares = middlewares
    .filter(m =>
      m.route === route &&
      (before && m.priority < 0 || !before && m.priority >= 0) &&
      m.method.toLowerCase() === method
    )
    .sort((a, b) => a.priority - b.priority);

    // console.log('matching middlewares : ', currentMiddlewares);

    return currentMiddlewares.map(m => m.fn);
  },
};
