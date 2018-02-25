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
      method : `get`,
      position : `end`,
      priority : 0,
      fn : (req, res) => {
        console.log('it works !');
        res.render(path.join(__dirname, 'templates', 'index.ejs'));
      },
    },
    {
      route : `product`,
      method : `get`,
      position : `end`,
      priority : 0,
      fn : (req, res) => {
        res.render(path.join(__dirname, 'templates', 'product.ejs'));
      },
    },
    {
      route : `cart`,
      method : `get`,
      position : `end`,
      priority : 0,
      fn : (req, res) => {
        res.render(path.join(__dirname, 'templates', 'cart.ejs'));
      },
    },
    {
      route : `error`,
      method : null,
      position : `end`,
      priority : 0,
      fn : (req, res) => {
        res.render(path.join(__dirname, 'templates', 'error.ejs'));
      },
    },
    {
      route : `admin_login`,
      method : 'get',
      position : `end`,
      priority : 0,
      fn : (req, res) => {
        res.render(path.join(__dirname, 'templates', 'admin-login.ejs'));
      },
    },
  ],
}


module.exports = plugin;
