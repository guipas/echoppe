'use strict';

const path = require(`path`);
const globalConfig = require('../../config');
const customPluginConfig = globalConfig.plugins ? globalConfig.plugins.basicTheme : {};

const config = {
  ...customPluginConfig,
};

const plugin = {
  name : `basictheme`,
  title : `Basic theme`,
  description : ``,
  middlewares : [
    {
      route : `index`,
      method : `GET`,
      priority : 0,
      fn : (req, res) => {
        console.log('it works !');
        res.render(path.join(__dirname, 'templates', 'index.ejs'));
      },
    },
    {
      route : `products:details`,
      method : `GET`,
      priority : 0,
      fn : (req, res) => {
        console.log('rendering product via theme');
        res.render(path.join(__dirname, 'templates', 'product.ejs'));
      },
    },
  ],
}


module.exports = plugin;
