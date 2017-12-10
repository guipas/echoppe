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

    res.render('cart', { cart });
  }));

  router.post('/cart/products/:product', safeHandle(async (req, res) => {
    await req.shop.cartManager.addProduct(req.params.product);

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
