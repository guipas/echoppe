'use strict';

const log = require('./debugLog').log;
const events = require('events');
const eventEmitter = new events.EventEmitter();

const basicEmailingPlugin = require('./plugins/basicEmailing');

const plugins = [basicEmailingPlugin];

plugins.forEach(plugin => {
  if (plugin.initEvents) {
    plugin.initEvents(eventEmitter);
  }
});

log('## Event listeners : ');
const eventNames = eventEmitter.eventNames();
if (eventNames.length === 0) {
  log('## no event listeners');
}
eventNames.forEach(eventName => {
  const count = eventEmitter.listenerCount(eventName);
  log(`## Event *${eventName}* --> ${count} listeners`);
  eventEmitter.on(eventName, () => { log(`## Triggered event : *${eventName}*`) });
})

module.exports = eventEmitter;
