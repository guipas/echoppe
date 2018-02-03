'use strict'

const safeHandle = require('./safeHandle');

module.exports = safeHandle(async (req, res, next) => {
  req.shop = {
    current: {},
    user: {
      isAdmin: req.session.isAdmin === true,
    },
  };

  res.locals.shop = req.shop;

  next();
});
