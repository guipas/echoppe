'use strict';

const db = require(`../db/db`);
const mediaManager = require(`./media_manager`);
const config = require(`../config`);
const pluginManager = require(`./plugin_manager`);

const loadCart = req => {
  if (req.session && req.session.cartUid) {
    console.log(`### loading cart from session...`);
    return db.models.cart.fetchOne(req.session.cartUid)
  }
  return Promise.resolve(null);
}

const getCurrencySymbol = code => {
  const currency = config.currencies.find(c => c.code === code);
  if (currency) return currency.char;
  return ``;
}

const middleware = (req, res, next) => {
  return loadCart(req)
  .then(cart => {
    req.shop = Object.assign({}, db, {
      current : { cart },
      mediaManager,
      pluginManager,
      helpers : { getCurrencySymbol },
    });
    res.newRender = function newRender (...args) {
      if (args[1] && typeof args[1] === `object` && !args[1].shop) {
        args[1].shop = req.shop;
      }
      this.oldRender(...args)
    };
    res.oldRender = res.render;
    res.render = res.newRender;
    next();
    return null;
  })
}


module.exports = middleware;
