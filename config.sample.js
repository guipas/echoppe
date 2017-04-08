'use strict';

const sailsPostgreAdapter = require(`sails-postgresql`);

module.exports = {
  theme: `default`,
  db: {
    adapters: {
      postgre : sailsPostgreAdapter
    },

    connections: {
      default: {
        adapter: `postgre`,
        host: `localhost`,
        user: ``,
        database: ``,
        password : ``,
      }
    }
  }
}
