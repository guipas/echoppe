'use strict'

const url = require('url');
const safeHandle = require('./safeHandle');
const cartManager = require('./cartManager');

module.exports = safeHandle(async (req, res, next) => {
  req.shop = {
    cartManager,
    current: {},
    user: {
      isAdmin: req.session.isAdmin === true,
    },
    helpers : {
    }
  };
  res.locals.shop = req.shop;
  // res.locals.linkTo = to => to;
  await req.shop.cartManager.init(req.session);
  next();
});
