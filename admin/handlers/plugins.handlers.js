'use strict';

const db = require(`../../db/db`);
const pluginManager = require(`../../lib/plugins`);

const handlers = {
  list (req, res) {
    pluginManager.plugins.forEach(plugin => {})
  }
}

module.exports = handlers;
