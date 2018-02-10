'use strict';

const log = require('./debugLog').log;

const handlersMap = {};

module.exports = {
  init (plugins) {
    plugins.forEach(plugin => {
      if (plugin.events) {
        Object.keys(plugin.events).forEach(eventName => {
          const handlerFunction = plugin.events[eventName];
          if (!handlersMap[eventName]) { handlersMap[eventName] = [] }
          handlersMap[eventName].push(handlerFunction);
        })
      } else {
        log('## no event listeners');
      }
    })
  },
  broadcast (eventName, args) {
    const handlers = handlersMap[eventName];
    if (handlers) {
      handlers.forEach(handlerFunction => {
        try {
          Promise.resolve(handlerFunction(eventName, args))
          .catch(err => {
            log(err);
          });
        } catch (err) {
          log(err);
        }
      });
    }
  },
};
