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
const end = require('../lib/end.middleware');
const sendJson = require('../lib/sendJson.middleware');

module.exports = () => {
  const router = express.Router();

  router.get('/',
    ...middlewareManager.getMiddlewares('index', 'get', 'start'),
    csrf,
    ...middlewareManager.getMiddlewares('index', 'get', 'beforeLogic'),
    safeHandle(async (req, res, next) => {
      res.locals.products = await models.product.list();
      next();
    }),
    ...middlewareManager.getMiddlewares('index', 'get', 'afterLogic'),
    ...middlewareManager.getMiddlewares('index', 'get', 'end'),
    end,
  );

  router.get('/settings',
    ...middlewareManager.getMiddlewares('settings', 'get', 'start'),
    ...middlewareManager.getMiddlewares('settings', 'get', 'beforeLogic'),
    safeHandle(async (req, res, next) => {

      res.locals.name = config.name;
      res.locals.url = config.url;
      res.locals.currency = config.currency;
      res.locals.cartStatus = cartStatus;
      res.locals.cartStatusArray = Object.keys(cartStatus).map(k => ({ status : k, value : cartStatus[k] }));

      next();
    },
    ...middlewareManager.getMiddlewares('settings', 'get', 'afterLogic'),
    sendJson,
    ...middlewareManager.getMiddlewares('settings', 'get', 'end'),
    end,
  ));

  router.get('/csrf', csrf, (req, res) => res.json({ csrf : res.locals.csrf }));

  productRoutes(router);
  cartRoutes(router);
  orderRoutes(router);
  uploadRoutes(router);
  adminRoutes(router);


  return router;
};
