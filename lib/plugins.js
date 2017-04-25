'use strict';

const fs = require(`fs`);
const path = require(`path`);
const config = require(`../config`);

const plugins = {
  plugins : [],
  loadPlugins () {
    return new Promise((resolve, reject) => {
      fs.readdir(path.join(config.contentDir, `plugins`), `utf8`, (err, files) => {
        if (err) reject(err);
        files.forEach(file => {
          this.plugins.push(require(path.join(file, `plugin`))) // eslint-disable-line
        })
      })
    })
  },
}


module.exports = plugins;
