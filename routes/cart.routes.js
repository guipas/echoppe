'use strict';

const isAdmin = require('../lib/isAdmin.middleware');
const safeHandle = require(`../lib/safeHandle`);
const models = require('../lib/models');

module.exports = router => {
  router.get('/cart', safeHandle(async (req, res) => {
    const cart = await req.shop.getCurrentCart();

    if (req.wantsJson) {
      res.json(cart);
      return;
    }

    const quantityErrors = await cart.checkQuantities();
    const quantityErrorsMap = quantityErrors.reduce((m, curr) => { m[curr.productId] = curr.available; return m }, {});

    res.render('cart', {
      csrf : req.csrfToken(),
      cart, quantityErrors, quantityErrorsMap
    });
  }));


  router.post('/cart/products/:product', safeHandle(async (req, res) => {
    const cart = await req.shop.getCurrentCart();
    await cart.addProduct(req.params.product);

    if (req.wantsJson) {
      res.send(cart);
      return;
    }

    res.redirect('/cart');
  }));

  router.put('/cart/products/:product', safeHandle(async (req, res) => {
    const cart = await req.shop.getCurrentCart();
    const quantity = parseInt(req.body.quantity, 10);
    await cart.setProductQuantity(req.params.product, quantity);

    if (req.wantsJson) {
      res.send(cart);
      return;
    }

    res.redirect('/cart');
  }));

  router.get('/cart/delete', safeHandle(async (req, res) => {
    const cart = await req.shop.getCurrentCart();
    await cart.remove();

    if (req.wantsJson) {
      res.end();
    }

    res.redirect('/cart');
  }));

  router.put('/carts/:cart', isAdmin, safeHandle(async (req, res) => {
    await models.cart.modify({ ...req.body, _id : req.params.cart });
    const cart = await models.cart.fetch(req.params.cart);
    return res.send(cart);
  }));
}
