'use strict';

const db = require(`../db/db`);
const mediaManager = require(`./media_manager`);
const config = require(`../config`);

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
      helpers : { getCurrencySymbol },
    });
    next();
    return null;
  })
}


module.exports = middleware;
