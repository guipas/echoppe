'use strict';

const _ = require('lodash');
const log = require('./debugLog').log;

const demandHandlers = [];

module.exports = {
  init (plugins) {
    plugins.forEach(plugin => {
      if (plugin.demandHandlers) {
        demandHandlers.push(...plugin.demandHandlers);
      }
    });
    console.log(demandHandlers);
  },
  async demand (demandName, args) {
    log(`Demanding [${demandName}]`);
    const chain = _.chain(demandHandlers)
      .filter({ demand : demandName })
      .orderBy(`priority`)
      .reduce((promise, handler) =>
        promise.then(() =>
          handler.fn(args).catch(error => {
            log(`Error while handling demand [${demandName}]`, error);
          })
        ),
        Promise.resolve()
      )
      .value();

    const x = await chain;
    console.log(x);
    console.log(args);

    return args;
  },
};
