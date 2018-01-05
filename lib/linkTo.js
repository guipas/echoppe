'use strict';

const config = require('./config');
const url = require('url');

module.exports = (...paths) => url.resolve(config.url, paths.join(`/`));
