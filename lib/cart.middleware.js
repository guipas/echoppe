'use strict';

const db = require(`../db/db`);

const middleware = (req, res, next) => {
  if (req.session && req.session.cartUid) {
    console.log(`### loading cart from session...`);
    return db.models.cart.fetchOne(req.session.cartUid)
    .then(cart => {
      if (cart) { req.cart = cart }
      next();
      return null;
    });
  }
  next();
  return null;
}


module.exports = middleware;
