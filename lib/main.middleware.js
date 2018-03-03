'use strict'

const linkTo = require('./linkTo');
const safeHandle = require('./safeHandle');
const config = require('./config');

module.exports = safeHandle(async (req, res, next) => {
  req.shop = {
    current: {},
    user: {
      isAdmin: req.session.isAdmin === true,
    },
  };

  res.locals.shop = req.shop;
  res.locals.linkTo = linkTo;
  res.locals.config = config;

  next();
});
