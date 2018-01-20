'use strict';

const mongoose = require('mongoose');
const log = require('./debugLog').log;

mongoose.Promise = global.Promise;

module.exports = {
  async init (config) {
    log('connecting with mongoose to ', config.mongodbURI);
    return await mongoose.connect(config.mongodbURI, { useMongoClient: true });
  },
};
