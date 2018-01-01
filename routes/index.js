'use strict';

const express = require('express');
const path = require('path');
const _ = require('lodash');
const isAdmin = require('../lib/isAdmin.auth.middleware');
const safeHandle = require(`../lib/safeHandle`);
const models = require('../lib/models');
const config = require('../lib/config');
const orderRoutes = require('./order.routes');
const productRoutes = require('./product.routes');
const cartRoutes = require('./cart.routes');
const uploadRoutes = require('./upload.routes');
const adminRoutes = require('./admin.routes');
const cartStatus = require('../lib/models/cart.status');

module.exports = () => {
  const router = express.Router();


  router.post('/api/admin/login', (req, res) => {
    req.session.isAdmin = true;
    res.end();
  })

  router.get('/', safeHandle(async (req, res) => {
    const products = await models.product.list();
    res.render('index', { products, csrf : req.csrfToken() });
  }));

  router.get('/settings', safeHandle(async (req, res) => {
    return res.json({
      name : config.name,
      url : config.url,
      currency : config.currency,
      cartStatus,
      cartStatusArray : Object.keys(cartStatus).map(k => ({ status : k, value : cartStatus[k] })),
    });
  }));

  productRoutes(router);
  cartRoutes(router);
  orderRoutes(router);
  uploadRoutes(router);
  adminRoutes(router);


  return router;
};
