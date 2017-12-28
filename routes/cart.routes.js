'use strict';

const _ = require('lodash');
const isAdmin = require('../lib/isAdmin.auth.middleware');
const safeHandle = require(`../lib/safeHandle`);
const models = require('../lib/models');
const config = require('../lib/config');
const log       = require('../lib/debugLog').log;


module.exports = router => {
  router.get('/cart', safeHandle(async (req, res) => {
    const cart = req.shop.cartManager.cart;

    if (req.wantsJson) {
      res.json(cart);
      return;
    }

    const quantityErrors = await req.shop.cartManager.checkQuantities();
    const quantityErrorsMap = quantityErrors.reduce((m, curr) => { m[curr.productId] = curr.available; return m }, {});

    res.render('cart', {
      csrf : req.csrfToken(),
      cart, quantityErrors, quantityErrorsMap
    });
  }));

  router.post('/cart/products/:product', safeHandle(async (req, res) => {
    await req.shop.cartManager.addProduct(req.params.product);

    if (req.wantsJson) {
      res.end();
    }

    res.redirect('/cart');
  }));

  router.post('/cart/products/:product/quantity', safeHandle(async (req, res) => {
    const quantity = parseInt(req.body.quantity, 10);
    await req.shop.cartManager.setProductQuantity(req.params.product, quantity);

    if (req.wantsJson) {
      res.end();
    }

    res.redirect('/cart');
  }));

  router.get('/cart/delete', safeHandle(async (req, res) => {
    await req.shop.cartManager.destroy();

    if (req.wantsJson) {
      res.end();
    }

    res.redirect('/cart');
  }));

  router.put('/cart/:cart', isAdmin, safeHandle(async (req, res) => {
    await models.cart.modify({ ...req.body, _id : req.params.cart });
    res.end();
  }));
}
