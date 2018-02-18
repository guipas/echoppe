'use strict';

const express = require('express');
const safeHandle = require(`../lib/safeHandle`);
const models = require('../lib/models');
const config = require('../lib/config');
const orderRoutes = require('./order.routes');
const productRoutes = require('./product.routes');
const cartRoutes = require('./cart.routes');
const uploadRoutes = require('./upload.routes');
const adminRoutes = require('./admin.routes');
const cartStatus = require('../lib/models/cart.status');
const middlewareManager = require('../lib/middlewareManager');
const csrf = require('../lib/csrf.middleware.js');

module.exports = () => {
  const router = express.Router();

  router.get('/',
    ...middlewareManager.getMiddlewares('index', true, `get`),
    csrf,
    safeHandle(async (req, res, next) => {
      res.locals.products = await models.product.list();
      next();
    }),
    ...middlewareManager.getMiddlewares('index', false, `get`)
  );

  router.get('/settings',
    ...middlewareManager.getMiddlewares('settings', true, `get`),
    safeHandle(async (req, res) => {
      return res.json({
        name : config.name,
        url : config.url,
        currency : config.currency,
        cartStatus,
        cartStatusArray : Object.keys(cartStatus).map(k => ({ status : k, value : cartStatus[k] })),
      });
    },
  ));

  router.get('/csrf', csrf, (req, res) => res.json({ csrf : res.locals.csrf }));

  productRoutes(router);
  cartRoutes(router);
  orderRoutes(router);
  uploadRoutes(router);
  adminRoutes(router);


  return router;
};
